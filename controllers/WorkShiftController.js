const WorkShiftModel = require('../models/workshift');

const createWorkShift = async (req, res) => {
  const { shiftName, startTime, endTime } = req.body;

  if (!shiftName || !startTime || !endTime) {
    return res.status(422).json({ success: false, message: 'shiftName, startTime and endTime are required.' });
  }

  if (typeof shiftName !== 'string' || typeof startTime !== 'number' || typeof endTime !== 'number') {
    return res.status(422).json({ success: false, message: 'shiftName must be a string. startTime and endTime must be numbers.' });
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
    const results = await WorkShiftModel.find();
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

const updateWorkShift = async (req, res) => {
  const { id } = req.params;
  const { shiftName, startTime, endTime } = req.body;

  if (!shiftName || !startTime || !endTime) {
    return res.status(422).json({ success: false, message: 'shiftName, startTime and endTime are required.' });
  }

  if (typeof shiftName !== 'string' || typeof startTime !== 'number' || typeof endTime !== 'number') {
    return res.status(422).json({ success: false, message: 'shiftName must be a string. startTime and endTime must be numbers.' });
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
  updateWorkShift,
  deleteWorkShift,
};
