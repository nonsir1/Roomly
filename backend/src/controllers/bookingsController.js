import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createBooking = async (req, res) => {
  try {
    const { user_id, room_id, start_time, end_time, title } = req.body;

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    // TODO: проверить таймзоны
    const overlapping = await prisma.booking.findFirst({
      where: {
        roomId: room_id,
        AND: [
          { endTime: { gt: startDate } },
          { startTime: { lt: endDate } }
        ]
      }
    });

    if (overlapping) {
      console.log('overlap detected for room:', room_id);
      return res.status(400).json({ detail: 'Room is already booked for this time' });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user_id,
        roomId: room_id,
        startTime: startDate,
        endTime: endDate,
        title
      },
      include: {
        room: {
          include: {
            features: true
          }
        }
      }
    });

    const response = {
      id: booking.id,
      user_id: booking.userId,
      room_id: booking.roomId,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
      title: booking.title,
      room: booking.room ? {
        id: booking.room.id,
        name: booking.room.name,
        description: booking.room.description,
        capacity: booking.room.capacity,
        image_url: booking.room.imageUrl,
        features: booking.room.features
      } : null
    };

    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { user_id, room_id, start_time, end_time, title } = req.body;

    const existingBooking = await prisma.booking.findUnique({
      where: { id: Number(booking_id) }
    });

    if (!existingBooking) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    if (existingBooking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ detail: 'Not authorized to update this booking' });
    }

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    const overlapping = await prisma.booking.findFirst({
      where: {
        roomId: room_id,
        id: { not: Number(booking_id) },
        AND: [
          { endTime: { gt: startDate } },
          { startTime: { lt: endDate } }
        ]
      }
    });

    if (overlapping) {
      return res.status(400).json({ detail: 'Room is already booked for this time' });
    }

    const booking = await prisma.booking.update({
      where: { id: Number(booking_id) },
      data: {
        userId: user_id,
        roomId: room_id,
        startTime: startDate,
        endTime: endDate,
        title
      },
      include: {
        room: {
          include: {
            features: true
          }
        }
      }
    });

    const response = {
      id: booking.id,
      user_id: booking.userId,
      room_id: booking.roomId,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
      title: booking.title,
      room: booking.room ? {
        id: booking.room.id,
        name: booking.room.name,
        description: booking.room.description,
        capacity: booking.room.capacity,
        image_url: booking.room.imageUrl,
        features: booking.room.features
      } : null
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        room: {
          include: {
            features: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    const response = bookings.map(booking => ({
      id: booking.id,
      user_id: booking.userId,
      room_id: booking.roomId,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
      title: booking.title,
      room: booking.room ? {
        id: booking.room.id,
        name: booking.room.name,
        description: booking.room.description,
        capacity: booking.room.capacity,
        image_url: booking.room.imageUrl,
        features: booking.room.features
      } : null
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(booking_id) }
    });

    if (!booking) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ detail: 'Not authorized to delete this booking' });
    }

    await prisma.booking.delete({
      where: { id: Number(booking_id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { skip = 0, limit = 100 } = req.query;

    const bookings = await prisma.booking.findMany({
      skip: Number(skip),
      take: Number(limit),
      include: {
        room: {
          include: {
            features: true
          }
        }
      }
    });

    const response = bookings.map(booking => ({
      id: booking.id,
      user_id: booking.userId,
      room_id: booking.roomId,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
      title: booking.title,
      room: booking.room ? {
        id: booking.room.id,
        name: booking.room.name,
        description: booking.room.description,
        capacity: booking.room.capacity,
        image_url: booking.room.imageUrl,
        features: booking.room.features
      } : null
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const getRoomBookings = async (req, res) => {
  try {
    const { room_id } = req.params;
    const { start_date, end_date } = req.query;

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const bookings = await prisma.booking.findMany({
      where: {
        roomId: Number(room_id),
        startTime: { gte: startDate },
        endTime: { lte: endDate }
      },
      include: {
        room: {
          include: {
            features: true
          }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const response = bookings.map(booking => ({
      id: booking.id,
      user_id: booking.userId,
      room_id: booking.roomId,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
      title: booking.title,
      user: booking.user ? {
        id: booking.user.id,
        email: booking.user.email
      } : null,
      room: booking.room ? {
        id: booking.room.id,
        name: booking.room.name,
        description: booking.room.description,
        capacity: booking.room.capacity,
        image_url: booking.room.imageUrl,
        features: booking.room.features
      } : null
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

