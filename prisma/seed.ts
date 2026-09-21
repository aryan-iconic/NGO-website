
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  
  if (!bootstrapPassword) {
    console.warn("Skipping Admin creation: ADMIN_BOOTSTRAP_PASSWORD environment variable is not set.");
  } else {
    const adminEmail = "admin@nityanikunj.org";
    const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      await prisma.admin.create({
        data: {
          name: "Super Admin",
          email: adminEmail,
          passwordHash: bcrypt.hashSync(bootstrapPassword, 10),
          role: "SUPER_ADMIN",
          twoFactorEnabled: false
        }
      });
      console.log("Super Admin created.");
    }
  }

  const sevaAreas: any[] = [];

  for (const sa of sevaAreas) {
    await prisma.sevaArea.upsert({
      where: { slug: sa.slug },
      update: {},
      create: {
        id: sa.id,
        name: sa.name,
        hindiName: sa.hindiName,
        slug: sa.slug,
        description: sa.description,
        icon: sa.icon,
        coverImage: sa.coverImage,
        objectives: sa.objectives,
        published: sa.published,
        sortOrder: sa.sortOrder,
        isActive: sa.isActive,
      }
    });
  }
  console.log("Seeded 9 Seva Areas.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
