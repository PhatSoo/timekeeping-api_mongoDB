const EmployeeModel = require('../models/employee');
const ShiftRegistrationModel = require('../models/shiftregistration');
const ShiftAttendanceModel = require('../models/shiftattendance');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv/config');

const fs = require('fs');
const path = require('path');

const getMe = async (req, res) => {
  const id = req.userId;

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

const updateMe = async (req, res) => {
  const id = req.userId;
  const updates = req.body;

  if (updates.email && !util.validateEmail(updates.email)) {
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
      return res.status(404).json({ status: false, message: 'Không tìm thấy nhân viên.' });
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

const uploadAvatar = async (req, res) => {
  const id = req.userId;

  if (!req.file) {
    res.status(200).json({ success: false, message: 'Chưa chọn ảnh' });
  }

  const file = req.file;

  try {
    // Lấy thông tin về ảnh cũ từ cơ sở dữ liệu
    const employee = await EmployeeModel.findById(id);
    const oldImage = employee.image;

    const result = await EmployeeModel.findByIdAndUpdate(id, { image: file.filename }, { new: true });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Update Failed' });
    }

    // Xóa ảnh cũ khỏi thư mục
    fs.unlink(path.join(path.join(process.cwd(), 'uploads/avatars', oldImage)), (err) => {
      if (err) {
        console.error('Có lỗi xảy ra khi xóa ảnh:', err);
      }
    });

    res.status(204).end();
  } catch (error) {
    console.log('Có lỗi xảy ra khi cập nhật:', error);
  }
};

const getSchedule = async (req, res) => {
  const id = req.userId;

  try {
    const shiftRegistration = await ShiftRegistrationModel.find({ employee: id }).populate('employee', 'name').populate('workShift', 'shiftName');
    if (!shiftRegistration) {
      return res.status(404).json({ success: false, message: 'Shift registration not found.' });
    }
    res.status(200).json({ success: true, data: shiftRegistration });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getAttendance = async (req, res) => {
  const employee = req.userId;
  try {
    const shiftAttendances = await ShiftAttendanceModel.find({ employee }).populate({
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
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  getMe,
  updateMe,
  uploadAvatar,
  getSchedule,
  getAttendance,
};
