import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3Client = process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID ? new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
}) : null;

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: { message: "No file provided" } }, { status: 400 });
    }

    // Integration with S3/R2
    let fileUrl = "";
    const fakeId = Math.random().toString(36).substring(7);

    if (s3Client && process.env.S3_BUCKET_NAME) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const extension = file.name.split('.').pop() || 'png';
      const key = `uploads/${Date.now()}-${randomUUID()}.${extension}`;
      
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type || 'image/png',
        })
      );
      
      fileUrl = process.env.S3_PUBLIC_URL 
        ? `${process.env.S3_PUBLIC_URL}/${key}`
        : `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`;
    } else {
      // Fallback for missing R2 configuration
      fileUrl = `https://picsum.photos/seed/${fakeId}/800/600`;
      console.warn("S3 Configuration missing. Falling back to picsum mock URL.");
    }
    
    // Log audit
    await db.logAudit({
      actorType: "ADMIN",
      actorId: guard.admin!.id,
      actorName: guard.admin!.name,
      action: "MEDIA_UPLOADED",
      entity: "media",
      entityId: fakeId,
    });

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}
