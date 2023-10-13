const FormRequestModel = require('../models/formrequest');

const createFormRequest = async (req, res) => {
  const { startDate, endDate, isFullDay, reason, status, employee, formType, workShift } = req.body;

  if (!startDate || !endDate || !reason) {
    return res.status(422).json({ success: false, message: 'startDate, endDate, reason are required.' });
  }

  try {
    const newFormRequest = new FormRequestModel({ startDate, endDate, isFullDay, reason, status, employee, formType, workShift });
    await newFormRequest.save();
    res.status(201).json({ success: true, message: `FormRequest added with ID: ${newFormRequest.id}` });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const listFormRequests = async (req, res) => {
  try {
    const results = await FormRequestModel.find();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getFormRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const formRequest = await FormRequestModel.findById(id).populate('employee', 'name email').populate('formType', 'typeName').populate('workShift', 'shiftName startTime endTime');
    if (!formRequest) {
      return res.status(404).json({ success: false, message: 'FormRequest not found.' });
    }
    res.status(200).json({ success: true, data: formRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const updateFormRequest = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedFormRequest = await FormRequestModel.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedFormRequest) {
      return res.status(404).json({ success: false, message: 'FormRequest not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteFormRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFormRequest = await FormRequestModel.findByIdAndDelete(id);
    if (!deletedFormRequest) {
      return res.status(404).json({ success: false, message: 'FormRequest not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  createFormRequest,
  listFormRequests,
  getFormRequest,
  updateFormRequest,
  deleteFormRequest,
};