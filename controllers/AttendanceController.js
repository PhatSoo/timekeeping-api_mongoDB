const AttendanceModel = require('../models/attendance');

const createAttendance = async (req, res) => {
  const { checkInTime, checkOutTime, workDate, status, employee } = req.body;

  try {
    const newAttendance = new AttendanceModel({ checkInTime, checkOutTime, workDate, status, employee });
    await newAttendance.save();
    res.status(201).json({ success: true, message: `Attendance added with ID: ${newAttendance.id}` });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const listAttendances = async (req, res) => {
  try {
    const results = await AttendanceModel.find();
    res.status(200).json({ success: true, data: results, total: results.length });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getAttendanceByDate = async (req, res) => {
  const { date } = req.params;
  try {
    const attendance = await AttendanceModel.find({ workDate: new Date(date) });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found.' });
    }
    res.status(200).json({ success: true, data: attendance, total: attendance.length });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getAttendance = async (req, res) => {
  const { id } = req.params;

  try {
    const attendance = await AttendanceModel.findById(id).populate({
      path: 'employee',
      select: 'name email isPartTime CCCD sex employeeType',
      populate: { path: 'employeeType', select: 'typeName' },
    });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found.' });
    }
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const updateAttendance = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedAttendance = await AttendanceModel.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedAttendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteAttendance = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAttendance = await AttendanceModel.findByIdAndDelete(id);
    if (!deletedAttendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  createAttendance,
  listAttendances,
  getAttendanceByDate,
  getAttendance,
  updateAttendance,
  deleteAttendance,
};
