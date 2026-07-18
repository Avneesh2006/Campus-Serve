/**
 * Seeds the single Super Admin account for CampusOS.
 *
 * This account bypasses the college-email domain restriction (see
 * SUPER_ADMIN_EMAIL in src/lib/validations/auth.ts) and is created here
 * pre-verified with a role of SUPER_ADMIN, since it doesn't go through the
 * normal registration flow.
 *
 * Run with: npx tsx prisma/seed.ts
 * (or `npm run db:seed` if you add that script to package.json)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = "avneeshagarwal2006@gmail.com";
const SUPER_ADMIN_NAME = "Avneesh Agarwal";

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  if (existing) {
    if (existing.role !== "SUPER_ADMIN") {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: "SUPER_ADMIN", emailVerified: existing.emailVerified ?? new Date() },
      });
      console.log(`Updated existing account ${SUPER_ADMIN_EMAIL} to SUPER_ADMIN.`);
    } else {
      console.log(`Super Admin ${SUPER_ADMIN_EMAIL} already exists. Nothing to do.`);
    }
    return;
  }

  // A default password is set so the account can sign in immediately;
  // change it after first login via the normal password flow.
  const defaultPassword = process.env.SUPER_ADMIN_PASSWORD || "ChangeMe123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  await prisma.user.create({
    data: {
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`Created Super Admin ${SUPER_ADMIN_EMAIL}.`);
  if (!process.env.SUPER_ADMIN_PASSWORD) {
    console.log(
      `No SUPER_ADMIN_PASSWORD env var was set, so the default password "${defaultPassword}" was used — sign in and change it, or set SUPER_ADMIN_PASSWORD and re-run before first login.`
    );
  }
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
