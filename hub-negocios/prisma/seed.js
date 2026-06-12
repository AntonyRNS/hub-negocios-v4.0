const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_PROFESSIONS = [
  { name: 'Carpinteiro', description: 'Trabalhos em madeira estrutural e fina.' },
  { name: 'Desenvolvedor Fullstack', description: 'Criação de aplicações web de ponta a ponta.' },
  { name: 'Eletricista', description: 'Instalações elétricas residenciais e comerciais.' },
  { name: 'Encanador', description: 'Reparos hidráulicos e encanamentos gerais.' },
  { name: 'Pintor', description: 'Pintura residencial interna e externa.' },
];

async function main() {
  console.log('Iniciando seed de profissões...');
  for (const prof of DEFAULT_PROFESSIONS) {
    await prisma.profession.upsert({
      where: { name: prof.name },
      update: {},
      create: prof,
    });
  }
  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
