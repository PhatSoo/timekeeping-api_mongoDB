const EmployeeModel = require('../models/employee');
const utils = require('../utils');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const createEmployee = async (req, res, next) => {
  let { name, email, password, isPartTime, CCCD, sex, role } = req.body;

  if (name === undefined || email === undefined || password === undefined || isPartTime === undefined || CCCD === undefined || sex === undefined || role === undefined) {
    return res.status(422).json({
      success: false,
      message: 'Missing required params',
    });
  }

  if (typeof CCCD !== Number && CCCD.length !== 12) {
    return res.status(422).json({
      success: false,
      message: 'CCCD sai định dạng',
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
    await EmployeeModel.create({ name, email, password: hash, isPartTime, CCCD, sex, role });
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
    const employees = await EmployeeModel.find().populate('role', 'typeName').select(['name', 'CCCD', 'role', 'sex', 'email', 'isPartTime', 'avatar']);
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
    const employees = await EmployeeModel.find({ isPartTime }).populate('role', 'typeName');
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
    const employee = await EmployeeModel.findById(id).populate('role', 'typeName');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const updateEmployee = async (req, res) => {
  const updates = req.body;
  const id = req.body._id;

  if (updates.email && !utils.validateEmail(updates.email)) {
    return res.status(422).json({ success: false, message: 'Email is not validate.' });
  }

  if (updates.phone && updates.phone.length !== 10) {
    return res.status(422).json({ success: false, message: 'Phone is illegal.' });
  }

  try {
    const employee = await EmployeeModel.findById(updates._id);
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

    res.status(201).json({ success: true, message: 'Update Employee successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const resetPassword = async (req, res) => {
  const { id } = req.body;

  try {
    const defaultPassword = '123456789';
    const password = await bcrypt.hash(defaultPassword, 10);

    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(id, { password }, { new: true });
    if (!updatedEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    res.status(201).json({ success: true, message: 'Reset Employee Password successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const existingEmployee = await EmployeeModel.findById(id).select('avatar');

    const deletedEmployee = await EmployeeModel.findByIdAndDelete(id);
    if (!deletedEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (existingEmployee.avatar) {
      fs.unlink(path.join(path.join(process.cwd(), 'uploads/avatars', existingEmployee.avatar)), (err) => {});
    }
    res.status(200).json({ success: true, message: `Employee deleted with ID: ${id}` });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteEmployeeMultiple = async (req, res) => {
  const { data } = req.body;

  try {
    const documentsToDelete = await EmployeeModel.find({ _id: { $in: data } });

    documentsToDelete.forEach(async (document) => {
      if (document.avatar) {
        fs.unlink(path.join(path.join(process.cwd(), 'uploads/avatars', document.avatar)), (err) => {});
      }
    });

    const result = await EmployeeModel.deleteMany({ _id: { $in: data } });

    if (result.deletedCount > 0) {
      res.status(200).json({ success: true, message: `Employees deleted successfully` });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi để xóa' });
    }
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
  resetPassword,
  deleteEmployee,
  deleteEmployeeMultiple,
};
