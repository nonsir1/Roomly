import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req, res) => {
  try {
    // const { page = 1, limit = 50 } = req.query;
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true
      },
      orderBy: { id: 'desc' }
    });

    // console.log('users count:', users.length);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const getUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(user_id) },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(user_id) }
    });

    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: Number(user_id) },
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

export const updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { email, role } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: Number(user_id) }
    });

    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id: Number(user_id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(user_id) }
    });

    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const activeBookings = await prisma.booking.count({
      where: {
        userId: Number(user_id),
        endTime: { gte: new Date() }
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        detail: 'Cannot delete user with active bookings' 
      });
    }

    await prisma.user.delete({
      where: { id: Number(user_id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

