const ShiftRegistration = require('../models/shiftregistration');
const WorkShift = require('../models/workshift');

const createShiftRegistration = async (req, res) => {
  const data = req.body;
  const employee = req.userId;

  if (!employee) {
    return res.status(422).json({
      success: false,
      message: 'Bạn chưa đăng nhập',
    });
  }

  if (!Array.isArray(data)) {
    return res.status(422).json({
      success: false,
      message: 'Missing required params',
    });
  }

  try {
    const updates = await Promise.all(
      data.map(async (item) => {
        const workShift = await WorkShift.findOne({ shiftName: item.workShift });
        if (!workShift) {
          throw new Error(`Work shift not found: ${item.workShift}`);
        }
        return { ...item, workShift: workShift._id, employee };
      })
    );

    // Xóa tất cả các ca làm việc hiện tại của nhân viên
    await ShiftRegistration.deleteMany({ employee: employee._id });

    await ShiftRegistration.insertMany(updates);
    res.status(201).json({
      success: true,
      message: 'Bạn đã đăng ký ca làm thành công, nhớ theo dỗi lịch để biết mình được xếp vào ca nào nhé!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const listShiftRegistrations = async (req, res) => {
  try {
    const shiftRegistration = await ShiftRegistration.find().populate('employee', 'name').populate('workShift', 'shiftName');
    res.status(200).json({
      success: true,
      data: shiftRegistration,
      total: shiftRegistration.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getShiftRegistrationByID = async (req, res) => {
  const { id } = req.params;

  try {
    const shiftRegistration = await ShiftRegistration.findById(id).populate('employee', 'name').populate('workShift', 'shiftName');
    if (!shiftRegistration) {
      return res.status(404).json({ success: false, message: 'Shift registration not found.' });
    }
    res.status(200).json({ success: true, data: shiftRegistration });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const updateShiftRegistration = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedShiftRegistration = await ShiftRegistration.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedShiftRegistration) {
      return res.status(404).json({ success: false, message: 'Shift registration not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteShiftRegistration = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedShiftRegistration = await ShiftRegistration.findByIdAndDelete(id);
    if (!deletedShiftRegistration) {
      return res.status(404).json({ success: false, message: 'Shift registration not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteAll = async (req, res) => {
  try {
    await ShiftRegistration.deleteMany({});
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  createShiftRegistration,
  listShiftRegistrations,
  getShiftRegistrationByID,
  updateShiftRegistration,
  deleteShiftRegistration,
  deleteAll,
};
