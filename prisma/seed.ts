import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  try {
    // 1. Create test owner
    const owner = await prisma.auth_user.create({
      data: {
        id: "test_owner_id",
        email: "owner@example.com",
        first_name: "Test",
        last_name: "Owner",
        role: "BARBER",
      },
    });

    // 2. Create barbershop
    const barbershop = await prisma.barberShop.create({
      data: {
        name: "Test Barbershop",
        slug: "test-barbershop",
        description: "A test barbershop",
        address: "123 Test St",
        ownerId: owner.id,
        timezone: "America/Sao_Paulo",
      },
    });

    // 3. Create services
    const services = await Promise.all([
      prisma.service.create({
        data: {
          name: "Haircut",
          description: "Basic haircut",
          price: 50,
          durationMinutes: 30,
          barbershopId: barbershop.id,
        },
      }),
      prisma.service.create({
        data: {
          name: "Beard Trim",
          description: "Beard trimming and styling",
          price: 30,
          durationMinutes: 20,
          barbershopId: barbershop.id,
        },
      }),
    ]);

    // 4. Create schedule rules
    await Promise.all([
      prisma.scheduleRule.create({
        data: {
          dayOfWeek: 1, // Monday
          startTime: "09:00",
          endTime: "18:00",
          barbershopId: barbershop.id,
        },
      }),
      prisma.scheduleRule.create({
        data: {
          dayOfWeek: 2, // Tuesday
          startTime: "09:00",
          endTime: "18:00",
          barbershopId: barbershop.id,
        },
      }),
      prisma.scheduleRule.create({
        data: {
          dayOfWeek: 3, // Wednesday
          startTime: "09:00",
          endTime: "18:00",
          barbershopId: barbershop.id,
        },
      }),
      prisma.scheduleRule.create({
        data: {
          dayOfWeek: 4, // Thursday
          startTime: "09:00",
          endTime: "18:00",
          barbershopId: barbershop.id,
        },
      }),
      prisma.scheduleRule.create({
        data: {
          dayOfWeek: 5, // Friday
          startTime: "09:00",
          endTime: "18:00",
          barbershopId: barbershop.id,
        },
      }),
      prisma.scheduleRule.create({
        data: {
          dayOfWeek: 6, // Saturday
          startTime: "09:00",
          endTime: "13:00",
          barbershopId: barbershop.id,
        },
      }),
    ]);

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
