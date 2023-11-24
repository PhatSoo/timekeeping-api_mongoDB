const EmployeeModel = require('../models/employee');
const utils = require('../utils');
const bcrypt = require('bcrypt');

const createEmployee = async (req, res, next) => {
  let { name, email, password, isPartTime, CCCD, sex, roleId } = req.body;

  if (name === undefined || email === undefined || password === undefined || isPartTime === undefined || CCCD === undefined || sex === undefined || roleId === undefined || phone === undefined) {
    return res.status(422).json({
      success: false,
      message: 'Missing required params',
    });
  }

  if (!utils.validateEmail(email)) {
    return res.status(422).json({
      success: false,
      message: 'Email is not validate',
    });
  }

  try {
    const existingEmployee = await EmployeeModel.findOne({ email });
    if (existingEmployee) {
      return res.status(422).json({ success: false, message: 'Email already exists.' });
    }
    const hash = await bcrypt.hash(password, 10);
    await EmployeeModel.create({ name, email, password: hash, isPartTime, CCCD, sex, roleId, phone });
    res.status(201).json({
      success: true,
      message: 'Create an employee successfully.!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const listEmployees = async (req, res, next) => {
  try {
    const employees = await EmployeeModel.find().populate('roleId', 'typeName');
    res.status(200).json({
      success: true,
      data: employees,
      total: employees.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const listEmployeesPartTime = async (req, res, next) => {
  const { isPartTime } = req.params;
  try {
    const employees = await EmployeeModel.find({ isPartTime }).populate('roleId', 'typeName');
    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await EmployeeModel.findById(id).populate('roleId', 'typeName');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.email && !utils.validateEmail(updates.email)) {
    return res.status(422).json({ success: false, message: 'Email is not validate.' });
  }

  if (updates.CCCD && (typeof updates.CCCD !== 'string' || updates.CCCD.length !== 12)) {
    return res.status(422).json({ success: false, message: 'CCCD is illegal.' });
  }

  if (updates.phone && updates.phone.length !== 10) {
    return res.status(422).json({ success: false, message: 'Phone is illegal.' });
  }

  try {
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên.' });
    }

    if (updates.email) {
      const existingEmployee = await EmployeeModel.findOne({ email: updates.email, _id: { $ne: id } });
      if (existingEmployee) {
        return res.status(422).json({ success: false, message: 'Email already exists.' });
      }
    }

    if (updates.oldPassword && updates.newPassword) {
      const isMatch = await bcrypt.compare(updates.oldPassword, employee.password);
      if (!isMatch) {
        return res.status(422).json({ success: false, message: 'Mật khẩu cũ không chính xác.' });
      }
      if (updates.oldPassword === updates.newPassword) {
        return res.status(422).json({ success: false, message: 'Mật khẩu mới không được giống mật khẩu cũ.' });
      }
      updates.password = await bcrypt.hash(updates.newPassword, 10);
    }

    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEmployee = await EmployeeModel.findByIdAndDelete(id);
    if (!deletedEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  createEmployee,
  listEmployees,
  listEmployeesPartTime,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};
