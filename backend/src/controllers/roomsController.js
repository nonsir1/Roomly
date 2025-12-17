import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRooms = async (req, res) => {
  try {
    const { skip = 0, limit = 10, search, tags, start_time, end_time } = req.query;

    let where = {};
    // const filters = {};

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.features = {
        every: {
          name: { in: tagArray }
        }
      };
    }

    if (start_time && end_time) {
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);

      const bookedRooms = await prisma.booking.findMany({
        where: {
          AND: [
            { endTime: { gt: startDate } },
            { startTime: { lt: endDate } }
          ]
        },
        select: { roomId: true },
        distinct: ['roomId']
      });

      const bookedRoomIds = bookedRooms.map(b => b.roomId);
      where.id = { notIn: bookedRoomIds };
    }

    let rooms = await prisma.room.findMany({
      where,
      include: {
        features: true
      }
    });

    if (search) {
      const searchLower = search.toLowerCase();
      rooms = rooms.filter(room => room.name.toLowerCase().includes(searchLower));
    }

    // console.log('found rooms:', rooms.length);
    // TODO: добавить сортировку по популярности
    const paginatedRooms = rooms.slice(Number(skip), Number(skip) + Number(limit));

    const response = paginatedRooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      image_url: room.imageUrl,
      features: room.features
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { room_id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: Number(room_id) },
      include: {
        features: true
      }
    });

    if (!room) {
      return res.status(404).json({ detail: 'Room not found' });
    }

    const response = {
      id: room.id,
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      image_url: room.imageUrl,
      features: room.features
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name, description, capacity, image_url, features = [] } = req.body;

    const room = await prisma.room.create({
      data: {
        name,
        description,
        capacity,
        imageUrl: image_url,
        features: {
          connect: features.map(id => ({ id }))
        }
      },
      include: {
        features: true
      }
    });

    const response = {
      id: room.id,
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      image_url: room.imageUrl,
      features: room.features
    };

    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { room_id } = req.params;
    const { name, description, capacity, image_url, features } = req.body;

    const existingRoom = await prisma.room.findUnique({
      where: { id: Number(room_id) },
      include: { features: true }
    });

    if (!existingRoom) {
      return res.status(404).json({ detail: 'Room not found' });
    }

    await prisma.room.update({
      where: { id: Number(room_id) },
      data: {
        features: {
          disconnect: existingRoom.features.map(f => ({ id: f.id }))
        }
      }
    });

    const room = await prisma.room.update({
      where: { id: Number(room_id) },
      data: {
        name,
        description,
        capacity,
        imageUrl: image_url,
        features: features && features.length > 0 ? {
          connect: features.map(id => ({ id }))
        } : undefined
      },
      include: {
        features: true
      }
    });

    const response = {
      id: room.id,
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      image_url: room.imageUrl,
      features: room.features
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { room_id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: Number(room_id) }
    });

    if (!room) {
      return res.status(404).json({ detail: 'Room not found' });
    }

    const activeBookings = await prisma.booking.count({
      where: {
        roomId: Number(room_id),
        endTime: { gte: new Date() }
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        detail: 'Cannot delete room with active bookings' 
      });
    }

    await prisma.room.delete({
      where: { id: Number(room_id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

