import { AppointmentStatus, UserRole } from '@prisma/client';
import { bcrypt, prisma } from './seed.config';

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Clean existing data
  await prisma.appointmentStatusHistory.deleteMany();
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.barberService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.blockedTime.deleteMany();
  await prisma.workingPeriod.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.barbershopSettings.deleteMany();
  await prisma.barbershop.deleteMany();
  await prisma.staffBarbershop.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'ACME Barbearias',
      slug: 'acme',
    },
  });

  console.log('✅ Tenant criado:', tenant.name);

  // Create users
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const owner = await prisma.user.create({
    data: {
      name: 'João Owner',
      email: 'owner@acme.com',
      phone: '(11) 99999-0001',
      passwordHash: ownerPassword,
      role: UserRole.OWNER,
      tenantId: tenant.id,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Maria Staff',
      email: 'staff@acme.com',
      phone: '(11) 99999-0002',
      passwordHash: staffPassword,
      role: UserRole.STAFF,
      tenantId: tenant.id,
    },
  });

  console.log('✅ Usuários criados');

  // Create barbershops
  const barbershopCentro = await prisma.barbershop.create({
    data: {
      tenantId: tenant.id,
      name: 'Barbearia Centro',
      description: 'Barbearia no centro da cidade',
      timezone: 'America/Sao_Paulo',
      address: 'Rua das Flores, 123 - Centro',
      phone: '(11) 3333-4444',
      slug: 'centro',
    },
  });

  const barbershopMoinhos = await prisma.barbershop.create({
    data: {
      tenantId: tenant.id,
      name: 'Barbearia Moinhos',
      description: 'Barbearia no bairro Moinhos de Vento',
      timezone: 'America/Sao_Paulo',
      address: 'Av. Osvaldo Aranha, 456 - Moinhos',
      phone: '(11) 3333-5555',
      slug: 'moinhos',
    },
  });

  console.log('✅ Barbearias criadas');

  // Create barbershop settings
  await prisma.barbershopSettings.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopCentro.id,
      slotGranularity: 15,
    },
  });

  // Moinhos will use .env fallback (no settings record)

  // Create staff barbershop assignment
  await prisma.staffBarbershop.create({
    data: {
      tenantId: tenant.id,
      userId: staff.id,
      barbershopId: barbershopCentro.id,
    },
  });

  console.log('✅ Configurações e staff criados');

  // Create barbers
  const barber1 = await prisma.barber.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopCentro.id,
      name: 'João Silva',
      bio: 'Especialista em cortes modernos',
      specialties: 'Corte, Barba',
      isActive: true,
      timezone: 'America/Sao_Paulo',
    },
  });

  const barber2 = await prisma.barber.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopCentro.id,
      name: 'Pedro Costa',
      bio: 'Especialista em sobrancelhas',
      specialties: 'Sobrancelha, Barba',
      isActive: true,
      timezone: 'America/Sao_Paulo',
    },
  });

  const barber3 = await prisma.barber.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopMoinhos.id,
      name: 'Carlos Santos',
      bio: 'Barbeiro experiente',
      specialties: 'Corte, Barba, Sobrancelha',
      isActive: true,
      timezone: 'America/Sao_Paulo',
    },
  });

  const barber4 = await prisma.barber.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopMoinhos.id,
      name: 'Roberto Lima',
      bio: 'Especialista em cortes clássicos',
      specialties: 'Corte, Barba',
      isActive: true,
      timezone: 'America/Sao_Paulo',
    },
  });

  console.log('✅ Barbeiros criados');

  // Create working periods (seg-sáb 09:00-12:00 e 14:00-18:00)
  const weekdays = [1, 2, 3, 4, 5, 6]; // seg-sáb
  const barbers = [barber1, barber2, barber3, barber4];

  for (const barber of barbers) {
    for (const weekday of weekdays) {
      // 09:00-12:00
      await prisma.workingPeriod.create({
        data: {
          tenantId: tenant.id,
          barberId: barber.id,
          weekday,
          startMinutes: 9 * 60, // 09:00
          endMinutes: 12 * 60, // 12:00
        },
      });

      // 14:00-18:00
      await prisma.workingPeriod.create({
        data: {
          tenantId: tenant.id,
          barberId: barber.id,
          weekday,
          startMinutes: 14 * 60, // 14:00
          endMinutes: 18 * 60, // 18:00
        },
      });
    }
  }

  console.log('✅ Períodos de trabalho criados');

  // Create services
  const service1 = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopCentro.id,
      name: 'Corte',
      durationMinutes: 30,
      bufferMinutes: 5,
      priceCents: 2500, // R$ 25,00
      isActive: true,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopCentro.id,
      name: 'Sobrancelha',
      durationMinutes: 15,
      bufferMinutes: 0,
      priceCents: 1500, // R$ 15,00
      isActive: true,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopCentro.id,
      name: 'Barba',
      durationMinutes: 25,
      bufferMinutes: 5,
      priceCents: 2000, // R$ 20,00
      isActive: true,
    },
  });

  // Create services for Moinhos barbershop
  const service4 = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopMoinhos.id,
      name: 'Corte',
      durationMinutes: 30,
      bufferMinutes: 5,
      priceCents: 3000, // R$ 30,00
      isActive: true,
    },
  });

  const service5 = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopMoinhos.id,
      name: 'Sobrancelha',
      durationMinutes: 15,
      bufferMinutes: 0,
      priceCents: 1800, // R$ 18,00
      isActive: true,
    },
  });

  const service6 = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopMoinhos.id,
      name: 'Barba',
      durationMinutes: 25,
      bufferMinutes: 5,
      priceCents: 2200, // R$ 22,00
      isActive: true,
    },
  });

  console.log('✅ Serviços criados');

  // Create barber-service relationships
  const barberServices = [
    // Centro barbershop
    { barberId: barber1.id, serviceId: service1.id },
    { barberId: barber1.id, serviceId: service3.id },
    { barberId: barber2.id, serviceId: service2.id },
    { barberId: barber2.id, serviceId: service3.id },
    // Moinhos barbershop
    { barberId: barber3.id, serviceId: service4.id },
    { barberId: barber3.id, serviceId: service5.id },
    { barberId: barber3.id, serviceId: service6.id },
    { barberId: barber4.id, serviceId: service4.id },
    { barberId: barber4.id, serviceId: service6.id },
  ];

  for (const bs of barberServices) {
    await prisma.barberService.create({
      data: {
        tenantId: tenant.id,
        barberId: bs.barberId,
        serviceId: bs.serviceId,
      },
    });
  }

  console.log('✅ Relacionamentos barbeiro-serviço criados');

  // Create blocked time example
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const blockedEnd = new Date(tomorrow);
  blockedEnd.setHours(11, 0, 0, 0);

  await prisma.blockedTime.create({
    data: {
      tenantId: tenant.id,
      barberId: barber1.id,
      startsAt: tomorrow,
      endsAt: blockedEnd,
      reason: 'Almoço',
    },
  });

  console.log('✅ Bloqueio de tempo criado');

  // Create appointment example
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 2);
  appointmentDate.setHours(9, 0, 0, 0);

  const appointmentEnd = new Date(appointmentDate);
  appointmentEnd.setMinutes(appointmentEnd.getMinutes() + 30);

  const appointment = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopCentro.id,
      barberId: barber1.id,
      startsAt: appointmentDate,
      endsAt: appointmentEnd,
      customerName: 'Maria Santos',
      customerPhone: '(11) 99999-9999',
      customerEmail: 'maria@email.com',
      status: AppointmentStatus.CONFIRMED,
      notes: 'Primeira vez',
    },
  });

  // Add services to appointment
  await prisma.appointmentService.create({
    data: {
      tenantId: tenant.id,
      appointmentId: appointment.id,
      serviceId: service1.id,
      order: 1,
    },
  });

  await prisma.appointmentService.create({
    data: {
      tenantId: tenant.id,
      appointmentId: appointment.id,
      serviceId: service3.id,
      order: 2,
    },
  });

  // Create appointment for Moinhos
  const appointment2Date = new Date();
  appointment2Date.setDate(appointment2Date.getDate() + 3);
  appointment2Date.setHours(14, 30, 0, 0);

  const appointment2End = new Date(appointment2Date);
  appointment2End.setMinutes(appointment2End.getMinutes() + 15);

  const appointment2 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      barbershopId: barbershopMoinhos.id,
      barberId: barber3.id,
      startsAt: appointment2Date,
      endsAt: appointment2End,
      customerName: 'José Silva',
      customerPhone: '(11) 88888-8888',
      status: AppointmentStatus.CONFIRMED,
    },
  });

  await prisma.appointmentService.create({
    data: {
      tenantId: tenant.id,
      appointmentId: appointment2.id,
      serviceId: service5.id,
      order: 1,
    },
  });

  console.log('✅ Agendamentos de exemplo criados');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Dados criados:');
  console.log(`- Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`- Usuários: ${owner.email} (OWNER), ${staff.email} (STAFF)`);
  console.log(
    `- Barbearias: ${barbershopCentro.name}, ${barbershopMoinhos.name}`
  );
  console.log(`- Barbeiros: 4 barbeiros (2 por barbearia)`);
  console.log(`- Serviços: 6 serviços (3 por barbearia)`);
  console.log(`- Agendamentos: 2 agendamentos de exemplo`);
  console.log('\n🔑 Credenciais de teste:');
  console.log(`- OWNER: owner@acme.com / owner123`);
  console.log(`- STAFF: staff@acme.com / staff123`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
