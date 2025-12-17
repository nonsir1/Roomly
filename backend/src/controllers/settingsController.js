import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    
    const settingsObject = {};
    settings.forEach(setting => {
      if (setting.value === 'true') {
        settingsObject[setting.key] = true;
      } else if (setting.value === 'false') {
        settingsObject[setting.key] = false;
      } else {
        settingsObject[setting.key] = setting.value;
      }
    });
    
    const defaultSettings = {
      enableHourlySlots: false,
      allowMultipleSlots: false
    };
    
    // console.log('settings loaded:', settingsObject);
    res.json({ ...defaultSettings, ...settingsObject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    
    if (!key) {
      return res.status(400).json({ detail: 'Key is required' });
    }
    
    const stringValue = String(value);
    console.log('updating setting:', key, '=', stringValue);
    
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: stringValue },
      create: { key, value: stringValue }
    });
    
    res.json(setting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ detail: 'Settings object is required' });
    }
    
    // TODO: добавить валидацию ключей
    const promises = Object.entries(settings).map(([key, value]) => {
      const stringValue = String(value);
      return prisma.setting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue }
      });
    });
    
    await Promise.all(promises);
    
    const updatedSettings = await prisma.setting.findMany();
    // const result = {};
    const settingsObject = {};
    updatedSettings.forEach(setting => {
      if (setting.value === 'true') {
        settingsObject[setting.key] = true;
      } else if (setting.value === 'false') {
        settingsObject[setting.key] = false;
      } else {
        settingsObject[setting.key] = setting.value;
      }
    });
    
    res.json(settingsObject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

