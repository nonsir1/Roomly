import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roomTypes = [
  {
    name: 'Конференц-зал',
    count: 3,
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
    capacities: [15, 20, 25, 30],
    description: 'Большой зал для конференций и презентаций.'
  },
  {
    name: 'Будка для созвонов',
    count: 25,
    image: 'https://images.wsj.net/im-401372/?width=700&height=467',
    capacities: [1, 2],
    description: 'Тихое место для звонков и сосредоточенной работы.'
  },
  {
    name: 'Комната для встреч',
    count: 10,
    image: 'https://davitamebel.ru/upload/medialibrary/c33/6c5ph5y9hft8fsd1arzna00lxpmxlma7.jpg',
    capacities: [4, 6, 8],
    description: 'Уютная комната для переговоров небольших групп.'
  },
  {
    name: 'Брейншторм',
    count: 7,
    image: 'https://www.nayada.ru/upload/s1/files/nodus_items/0004/2248/attaches/p2.jpg',
    capacities: [6, 8, 10],
    description: 'Креативное пространство для генерации идей.'
  }
];

const featuresList = [
  'Проектор',
  'Маркерная доска',
  'TV',
  'Кондиционер',
  'Кофемашина',
  'Звукоизоляция',
  'Apple TV',
  'Видеосвязь'
];

async function seed() {
  console.log('Starting seed...');

  const existingFeatures = await prisma.feature.findMany();

  let allFeatures;
  if (existingFeatures.length === 0) {
    console.log('Creating features...');
    allFeatures = [];
    for (const name of featuresList) {
      const feature = await prisma.feature.create({
        data: { name }
      });
      allFeatures.push(feature);
    }
  } else {
    console.log('Features already exist.');
    allFeatures = existingFeatures;
  }

  console.log('Clearing old rooms...');
  await prisma.room.deleteMany();

  console.log('Creating specific rooms...');
  let totalCreated = 0;

  for (const rType of roomTypes) {
    for (let i = 0; i < rType.count; i++) {
      const name = `${rType.name} ${i + 1}`;
      const capacity = rType.capacities[Math.floor(Math.random() * rType.capacities.length)];

      const featureCount = Math.floor(Math.random() * 4) + 1;
      const shuffled = [...allFeatures].sort(() => 0.5 - Math.random());
      const selectedFeatures = shuffled.slice(0, featureCount);

      await prisma.room.create({
        data: {
          name,
          description: rType.description,
          capacity,
          imageUrl: rType.image,
          features: {
            connect: selectedFeatures.map(f => ({ id: f.id }))
          }
        }
      });

      totalCreated++;
    }
  }

  console.log(`Successfully created ${totalCreated} rooms!`);
  await prisma.$disconnect();
}

seed().catch(error => {
  console.error('Error seeding database:', error);
  prisma.$disconnect();
  process.exit(1);
});

