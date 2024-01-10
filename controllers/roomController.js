const { Room, Hotel } = require("../models/db");
const { createActivityLog } = require("../utils/activityLog");

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({});

    const { userId, client } = req.user;

    const action = `View all rooms`;
    const details = `User viewed all rooms`;

    await createActivityLog(userId, client, action, details);

    res.send(rooms);
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch rooms" });
  }
};

const getRoomsByHotel = async (req, res) => {
  const { hotelId } = req.params;
  try {
    const rooms = await Room.findAll({
      where: { hotelId: hotelId },
      include: {
        model: Hotel,
      },
    });

    if (rooms.length > 0) {
      const { userId, client } = req.user;

      const action = `View hotel rooms`;
      const details = `User viewed all hotel rooms hotel : ${hotelId}`;

      await createActivityLog(userId, client, action, details);

      res.json(rooms);
    } else {
      res
        .status(404)
        .json({ status: 404, message: "Rooms not found for this hotel" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch rooms: " + error });
  }
};

const getAvailableRoomsByHotel = async (req, res) => {
  const { hotelId, status } = req.query;
  try {
    const rooms = await Room.findAll({
      where: { hotelId, status },
      include: {
        model: Hotel,
      },
      raw: true,
    });

    if (rooms.length > 0) {
      const { userId, client } = req.user;
      const action = `View Available rooms`;
      const details = `User viewed available rooms hotel : ${hotelId}`;
      await createActivityLog(userId, client, action, details);
      res.json(rooms);
    } else {
      res
        .status(404)
        .json({ status: 404, message: "Rooms not found for this hotel" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch rooms: " + error });
  }
};

const getRoomById = async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.findByPk(id);
    if (room) {
      const { userId, client } = req.user;
      const action = `View room`;
      const details = `User viewed room roomId  : ${id}`;
      await createActivityLog(userId, client, action, details);
      res.json(room);
    } else {
      res.status(404).json({ status: 404, message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch room" });
  }
};

const createRoom = async (req, res) => {
  const { roomNumber, type, capacity, pricePerNight, hotelId, status } =
    req.body;
  try {
    const existingRoom = await Room.findOne({ where: { roomNumber } });
    if (existingRoom) {
      return res
        .status(400)
        .json({ status: 400, message: "Room number already exists" });
    }
    const newRoom = await Room.create({
      roomNumber,
      type,
      capacity,
      pricePerNight,
      hotelId,
      status,
      // Add other fields as needed
    });

    const { userId, client } = req.user;

    const action = `Create new room`;
    const details = `User created room : ${JSON.stringify(newRoom)}`;

    await createActivityLog(userId, client, action, details);

    res.status(201).json(newRoom);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to create room" + error });
  }
};

const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { roomNumber, type, capacity, pricePerNight, status } = req.body;
  try {
    const room = await Room.findByPk(id);
    if (room) {
      await room.update({
        roomNumber,
        type,
        capacity,
        pricePerNight,
        status,
        // Add other fields as needed
      });
      const { userId, client } = req.user;

      const action = `Update Room`;
      const details = `Affected room  : ${room.id}`;

      await createActivityLog(userId, client, action, details);
      res.json({ message: "Room updated successfully" });
    } else {
      res.status(404).json({ status: 404, message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to update room" });
  }
};

const deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.findByPk(id);
    if (room) {
      await room.destroy();
      const { userId, client } = req.user;

      const action = `Delete Room`;
      const details = `Affected room roomId: ${id}`;

      await createActivityLog(userId, client, action, details);
      res.json({ message: "Room deleted successfully" });
    } else {
      res.status(404).json({ status: 404, message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to delete room" });
  }
};

module.exports = {
  getAllRooms,
  getRoomsByHotel,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRoomsByHotel,
};
