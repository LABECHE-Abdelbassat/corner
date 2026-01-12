// prisma/seed.ts

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function main() {
  console.log("🌱 Starting seed...\n");

  // Create Wilayas
  const tiaret = await prisma.wilaya.upsert({
    where: { code: "14" },
    update: {},
    create: {
      name: "Tiaret",
      code: "14",
      lat: 35.3709,
      lng: 1.3219,
      gradient: "from-blue-500 to-cyan-500",
    },
  });

  const sba = await prisma.wilaya.upsert({
    where: { code: "22" },
    update: {},
    create: {
      name: "Sidi Bel Abbès",
      code: "22",
      lat: 35.2106,
      lng: -0.63,
      gradient: "from-purple-500 to-pink-500",
    },
  });

  console.log("✅ Wilayas created");
  console.log(`   - ${tiaret.name} (${tiaret.code})`);
  console.log(`   - ${sba.name} (${sba.code})\n`);

  // Create Super Admins
  const superAdmin1Pass = await bcrypt.hash("admin123", 10);
  const superAdmin1 = await prisma.user.upsert({
    where: { username: "superadmin1" },
    update: {},
    create: {
      username: "superadmin1",
      password: superAdmin1Pass,
      email: "superadmin1@corner.dz",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  const superAdmin2Pass = await bcrypt.hash("admin123", 10);
  const superAdmin2 = await prisma.user.upsert({
    where: { username: "superadmin2" },
    update: {},
    create: {
      username: "superadmin2",
      password: superAdmin2Pass,
      email: "superadmin2@corner.dz",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("✅ Super Admins created");
  console.log(`   - ${superAdmin1.username} (can access all wilayas)`);
  console.log(`   - ${superAdmin2.username} (can access all wilayas)\n`);

  // Create Manager for Tiaret
  const managerTiaretPass = await bcrypt.hash("manager123", 10);
  const managerTiaret = await prisma.user.upsert({
    where: { username: "manager_tiaret" },
    update: {},
    create: {
      username: "manager_tiaret",
      password: managerTiaretPass,
      email: "manager.tiaret@corner.dz",
      role: "MANAGER",
      status: "ACTIVE",
      wilayaId: tiaret.id,
    },
  });

  console.log("✅ Manager created");
  console.log(`   - ${managerTiaret.username} (manages ${tiaret.name} only)\n`);

  console.log("🎉 Seed completed successfully!\n");
  console.log("📋 Login Credentials:");
  console.log(
    "┌─────────────────┬──────────────────┬─────────────┬────────────────────┐"
  );
  console.log(
    "│ Username        │ Password         │ Role        │ Access             │"
  );
  console.log(
    "├─────────────────┼──────────────────┼─────────────┼────────────────────┤"
  );
  console.log(
    "│ superadmin1     │ admin123         │ Super Admin │ All Wilayas        │"
  );
  console.log(
    "│ superadmin2     │ admin123         │ Super Admin │ All Wilayas        │"
  );
  console.log(
    "│ manager_tiaret  │ manager123       │ Manager     │ Tiaret Only        │"
  );
  console.log(
    "└─────────────────┴──────────────────┴─────────────┴────────────────────┘\n"
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
