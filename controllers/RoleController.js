const RoleModel = require('../models/role');

const createRole = async (req, res, next) => {
  const { typeName } = req.body;

  if (!typeName) {
    return res.status(400).json({ success: false, message: 'typeName is required.' });
  }

  if (typeof typeName !== 'string') {
    return res.status(400).json({ success: false, message: 'typeName must be a string.' });
  }

  try {
    const existingRole = await RoleModel.findOne({ typeName });

    if (existingRole) {
      return res.status(400).json({ success: false, message: `${existingRole.typeName} already exists.` });
    }

    const newRole = await RoleModel.create({ typeName });
    res.status(201).json({ success: true, message: `Role added with Type Name: ${newRole.typeName}` });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const listRole = async (req, res) => {
  try {
    const results = await RoleModel.find();
    res.status(200).json({ success: true, data: results, total: results.length });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await RoleModel.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const updateRole = async (req, res) => {
  const { typeName, _id } = req.body.data;

  if (!typeName) {
    return res.status(400).json({ success: false, message: 'typeName is required.' });
  }

  if (typeof typeName !== 'string') {
    return res.status(400).json({ success: false, message: 'typeName must be a string.' });
  }

  try {
    const existingRole = await RoleModel.findOne({ typeName, _id: { $ne: _id } });
    if (existingRole) {
      return res.status(400).json({ success: false, message: 'Role already exists.' });
    }
    const updatedRole = await RoleModel.findByIdAndUpdate(_id, { typeName }, { new: true });
    if (!updatedRole) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }
    res.status(201).json({ success: true, message: 'Update Role successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteRole = async (req, res) => {
  const { id } = req.body;

  try {
    const deletedRole = await RoleModel.findByIdAndDelete(id);
    if (!deletedRole) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }
    res.status(200).json({ success: true, message: `Role deleted with ID: ${id}` });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  createRole,
  listRole,
  getRole,
  updateRole,
  deleteRole,
};
