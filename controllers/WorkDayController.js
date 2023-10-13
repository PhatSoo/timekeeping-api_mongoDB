const WorkDayModel = require('../models/workday');

const createWorkDay = async (req, res) => {
  const { employee, workDate } = req.body;

  if (employee === undefined || !workDate) {
    return res.status(422).json({ success: false, message: 'employee and workDate are required.' });
  }

  try {
    const newWorkDay = new WorkDayModel({ employee, workDate });
    await newWorkDay.save();
    res.status(201).json({ success: true, message: `WorkDay added with ID: ${newWorkDay.id}` });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const listWorkDays = async (req, res) => {
  try {
    const results = await WorkDayModel.find();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getWorkDay = async (req, res) => {
  const { id } = req.params;

  try {
    const workDay = await WorkDayModel.findById(id).populate('employee', 'name email');
    if (!workDay) {
      return res.status(404).json({ success: false, message: 'WorkDay not found.' });
    }
    res.status(200).json({ success: true, data: workDay });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const updateWorkDay = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.employee !== undefined && !Number.isInteger(updates.employee)) {
    return res.status(422).json({ success: false, message: 'employee must be an integer.' });
  }

  try {
    const updatedWorkDay = await WorkDayModel.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedWorkDay) {
      return res.status(404).json({ success: false, message: 'WorkDay not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteWorkDay = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedWorkDay = await WorkDayModel.findByIdAndDelete(id);
    if (!deletedWorkDay) {
      return res.status(404).json({ success: false, message: 'WorkDay not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  createWorkDay,
  listWorkDays,
  getWorkDay,
  updateWorkDay,
  deleteWorkDay,
};
