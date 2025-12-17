import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createFeature = async (req, res) => {
  try {
    const { name } = req.body;

    const feature = await prisma.feature.create({
      data: { name }
    });

    res.status(201).json(feature);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const getFeatures = async (req, res) => {
  try {
    const features = await prisma.feature.findMany();
    res.json(features);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const updateFeature = async (req, res) => {
  try {
    const { feature_id } = req.params;
    const { name } = req.body;

    const feature = await prisma.feature.findUnique({
      where: { id: Number(feature_id) }
    });

    if (!feature) {
      return res.status(404).json({ detail: 'Feature not found' });
    }

    const updatedFeature = await prisma.feature.update({
      where: { id: Number(feature_id) },
      data: { name }
    });

    res.json(updatedFeature);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const deleteFeature = async (req, res) => {
  try {
    const { feature_id } = req.params;

    // console.log('deleting feature:', feature_id);
    const feature = await prisma.feature.findUnique({
      where: { id: Number(feature_id) }
    });

    if (!feature) {
      return res.status(404).json({ detail: 'Feature not found' });
    }

    await prisma.feature.delete({
      where: { id: Number(feature_id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

