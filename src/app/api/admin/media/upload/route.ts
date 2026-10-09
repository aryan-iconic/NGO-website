import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const IMAGE_TYPES = {
  "image/jpeg": { extension: "jpg", signature: (buffer: Buffer) => buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
  "image/png": { extension: "png", signature: (buffer: Buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/webp": { extension: "webp", signature: (buffer: Buffer) => buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP" },
  "image/gif": { extension: "gif", signature: (buffer: Buffer) => ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii")) },
} as const;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: { message: "Choose an image file to upload." } }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ success: false, error: { message: "Image must be between 1 byte and 5 MB." } }, { status: 400 });
    }

    const type = IMAGE_TYPES[file.type as keyof typeof IMAGE_TYPES];
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!type || !type.signature(buffer)) {
      return NextResponse.json({ success: false, error: { message: "Use a valid JPEG, PNG, WebP, or GIF image." } }, { status: 400 });
    }

    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    const bucket = process.env.S3_BUCKET_NAME;
    const publicUrl = process.env.S3_PUBLIC_URL?.replace(/\/+$/, "");
    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
      return NextResponse.json({ success: false, error: { message: "Image storage is not fully configured. Set the S3/R2 endpoint, credentials, bucket, and public URL." } }, { status: 503 });
    }

    const s3Client = new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
    const key = `uploads/${Date.now()}-${randomUUID()}.${type.extension}`;
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }));
    const fileUrl = `${publicUrl}/${key}`;

    // Log audit
    await db.logAudit({
      actorType: "ADMIN",
      actorId: guard.admin!.id,
      actorName: guard.admin!.name,
      action: "MEDIA_UPLOADED",
      entity: "media",
      entityId: key,
    });

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error("Media upload failed:", err);
    return NextResponse.json({ success: false, error: { message: "Image upload failed. Check the storage configuration and try again." } }, { status: 500 });
  }
}
