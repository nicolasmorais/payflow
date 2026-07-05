import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pagflow.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@pagflow.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log(`Admin user created/updated: ${admin.email}`);

  // Create default configurations
  const configuracoes = [
    { chave: 'empresa_nome', valor: 'PagFlow' },
    { chave: 'empresa_logo', valor: '' },
    { chave: 'dias_entrega', valor: 'segunda,terca,quarta,quinta,sexta' },
    { chave: 'horarios_disponiveis', valor: '08:00,09:00,10:00,11:00,14:00,15:00,16:00,17:00' },
    { chave: 'prazo_minimo_agendamento', valor: '1' },
    { chave: 'mensagem_confirmacao', valor: 'Seu pedido foi confirmado! Entraremos em contato para mais detalhes.' },
    { chave: 'pixel_taboola', valor: '' },
    { chave: 'pixel_meta', valor: '' },
    { chave: 'pixel_google_analytics', valor: '' },
    { chave: 'pixel_google_ads', valor: '' },
    { chave: 'favicon', valor: '' },
    { chave: 'tema', valor: 'light' },
  ];

  for (const config of configuracoes) {
    await prisma.configuracao.upsert({
      where: { chave: config.chave },
      update: {},
      create: config,
    });
    console.log(`Configuration created/updated: ${config.chave}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
