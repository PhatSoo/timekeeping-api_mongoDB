const WorkShiftModel = require('../models/workshift');

const createWorkShift = async (req, res) => {
  // "22:15:00"
  const { shiftName, startTime, endTime } = req.body;

  if (!shiftName || !startTime || !endTime) {
    return res.status(422).json({ success: false, message: 'shiftName, startTime and endTime are required.' });
  }

  try {
    const existingWorkShift = await WorkShiftModel.findOne({ shiftName });
    if (existingWorkShift) {
      return res.status(422).json({ success: false, message: 'WorkShift already exists.' });
    }
    const newWorkShift = new WorkShiftModel({ shiftName, startTime, endTime });
    await newWorkShift.save();
    res.status(201).json({ success: true, message: `WorkShift added with Shift Name: ${newWorkShift.shiftName}` });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const listWorkShifts = async (req, res) => {
  try {
    const results = await WorkShiftModel.find().sort({ startTime: 1 });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getWorkShift = async (req, res) => {
  const { id } = req.params;

  try {
    const workShift = await WorkShiftModel.findById(id);
    if (!workShift) {
      return res.status(404).json({ success: false, message: 'WorkShift not found.' });
    }
    res.status(200).json({ success: true, data: workShift });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getCurrentShift = async (req, res) => {
  try {
    const shifts = await WorkShiftModel.find();
    const currentDate = new Date();
    const currentTime = currentDate.getHours() + currentDate.getMinutes() / 60;

    const currentShift = shifts.find((shift) => {
      const startTime = new Date('1970-01-01T' + shift.startTime + ':00Z').getUTCHours() - 0.5;
      const endTime = new Date('1970-01-01T' + shift.endTime + ':00Z').getUTCHours() + 0.5;

      if (currentTime >= startTime && currentTime < endTime) {
        return true;
      }
      return false;
    });

    if (currentShift) {
      res.status(200).json({ success: true, data: currentShift });
    } else {
      res.status(422).json({ success: false, message: 'Hiện tại đang không có ca làm việc' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const updateWorkShift = async (req, res) => {
  const { id } = req.params;
  const { shiftName, startTime, endTime } = req.body;

  if (!shiftName && !startTime && !endTime) {
    return res.status(422).json({ success: false, message: 'shiftName, startTime and endTime are required.' });
  }

  if (shiftName && typeof shiftName !== 'string') {
    return res.status(422).json({ success: false, message: 'shiftName must be a string.' });
  }

  if (startTime && typeof startTime !== 'number') {
    return res.status(422).json({ success: false, message: 'startTime must be numbers.' });
  }

  if (endTime && typeof endTime !== 'number') {
    return res.status(422).json({ success: false, message: 'endTime must be numbers.' });
  }

  try {
    const existingWorkShift = await WorkShiftModel.findOne({ shiftName, _id: { $ne: id } });
    if (existingWorkShift) {
      return res.status(422).json({ success: false, message: 'WorkShift already exists.' });
    }
    const updatedWorkShift = await WorkShiftModel.findByIdAndUpdate(id, { shiftName, startTime, endTime }, { new: true });
    if (!updatedWorkShift) {
      return res.status(404).json({ success: false, message: 'WorkShift not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteWorkShift = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedWorkShift = await WorkShiftModel.findByIdAndDelete(id);
    if (!deletedWorkShift) {
      return res.status(404).json({ success: false, message: 'WorkShift not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  createWorkShift,
  listWorkShifts,
  getWorkShift,
  getCurrentShift,
  updateWorkShift,
  deleteWorkShift,
};
