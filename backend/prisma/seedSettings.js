import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSettings() {
  console.log('Инициализация настроек системы...');

  const defaultSettings = [
    { key: 'enableHourlySlots', value: 'false' },
    { key: 'allowMultipleSlots', value: 'false' }
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    });
    console.log(`✓ Настройка "${setting.key}" установлена: ${setting.value}`);
  }

  console.log('Настройки успешно инициализированы!');
}

seedSettings()
  .catch((e) => {
    console.error('Ошибка при инициализации настроек:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

