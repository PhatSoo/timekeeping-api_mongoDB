const ShiftAttendance = require('../models/shiftattendance');
const WorkShift = require('../models/workshift');
const ShiftRegistration = require('../models/shiftregistration');

const createShiftAttendance = async (req, res) => {
  const shiftAttendances = req.body;
  const employee = req.userId;

  if (!Array.isArray(shiftAttendances)) {
    return res.status(422).json({
      success: false,
      message: 'Missing required params',
    });
  }

  try {
    const updates = await Promise.all(
      shiftAttendances.map(async (item) => {
        const workShift = await WorkShift.findOne({ shiftName: item.workShift });
        if (!workShift) {
          throw new Error(`Work shift not found: ${item.workShift}`);
        }
        return { ...item, employee, workShift: workShift._id };
      })
    );

    await ShiftAttendance.insertMany(updates);
    res.status(201).json({
      success: true,
      message: 'Bạn đã đăng ký ca làm thành công, nhớ theo dỗi lịch để biết mình được xếp vào ca nào nhé!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const listShiftAttendances = async (req, res) => {
  try {
    const shiftAttendances = await ShiftAttendance.find().populate({
      path: 'shiftRegistration',
      populate: [
        {
          path: 'employee',
          select: 'name',
        },
        {
          path: 'workShift',
          select: 'shiftName',
        },
      ],
      select: 'workDate',
    });
    res.status(200).json({
      success: true,
      data: shiftAttendances,
      total: shiftAttendances.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getAttendanceByDate = async (req, res) => {
  const { date } = req.params;
  try {
    const attendance = await ShiftAttendance.find({ workDate: new Date(date) });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found.' });
    }
    res.status(200).json({ success: true, data: attendance, total: attendance.length });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getShiftAttendance = async (req, res) => {
  const { id } = req.params;

  try {
    const shiftAttendance = await ShiftAttendance.findById(id).populate('employee', 'name').populate('workShift', 'shiftName');
    if (!shiftAttendance) {
      return res.status(404).json({ success: false, message: 'Shift attendance not found.' });
    }
    res.status(200).json({ success: true, data: shiftAttendance });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const updateShiftAttendance = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedShiftAttendance = await ShiftAttendance.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedShiftAttendance) {
      return res.status(404).json({ success: false, message: 'Shift attendance not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteShiftAttendance = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedShiftAttendance = await ShiftAttendance.findByIdAndDelete(id);
    if (!deletedShiftAttendance) {
      return res.status(404).json({ success: false, message: 'Shift attendance not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteAll = async (req, res) => {
  try {
    await ShiftAttendance.deleteMany({});
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  createShiftAttendance,
  listShiftAttendances,
  getAttendanceByDate,
  getShiftAttendance,
  updateShiftAttendance,
  deleteShiftAttendance,
  deleteAll,
};
