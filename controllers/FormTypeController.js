const FormTypeModel = require('../models/formtype');

const createFormType = async (req, res) => {
  const { typeName } = req.body;

  if (!typeName) {
    return res.status(422).json({ success: false, message: 'typeName is required.' });
  }

  if (typeof typeName !== 'string') {
    return res.status(422).json({ success: false, message: 'typeName must be a string.' });
  }

  try {
    const existingFormType = await FormTypeModel.findOne({ typeName });
    if (existingFormType) {
      return res.status(422).json({ success: false, message: 'FormType already exists.' });
    }
    const newFormType = new FormTypeModel({ typeName });
    await newFormType.save();
    res.status(201).json({ success: true, message: `FormType added with ID: ${newFormType.id}` });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const listFormTypes = async (req, res) => {
  try {
    const results = await FormTypeModel.find();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getFormType = async (req, res) => {
  const { id } = req.params;

  try {
    const formType = await FormTypeModel.findById(id);
    if (!formType) {
      return res.status(404).json({ success: false, message: 'FormType not found.' });
    }
    res.status(200).json({ success: true, data: formType });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const updateFormType = async (req, res) => {
  const { id } = req.params;
  const { typeName } = req.body;

  if (!typeName) {
    return res.status(422).json({ success: false, message: 'typeName is required.' });
  }

  if (typeof typeName !== 'string') {
    return res.status(422).json({ success: false, message: 'typeName must be a string.' });
  }

  try {
    const existingFormType = await FormTypeModel.findOne({ typeName, _id: { $ne: id } });
    if (existingFormType) {
      return res.status(422).json({ success: false, message: 'FormType already exists.' });
    }
    const updatedFormType = await FormTypeModel.findByIdAndUpdate(id, { typeName }, { new: true });
    if (!updatedFormType) {
      return res.status(404).json({ success: false, message: 'FormType not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteFormType = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFormType = await FormTypeModel.findByIdAndDelete(id);
    if (!deletedFormType) {
      return res.status(404).json({ success: false, message: 'FormType not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  listFormTypes,
  createFormType,
  getFormType,
  updateFormType,
  deleteFormType,
};
