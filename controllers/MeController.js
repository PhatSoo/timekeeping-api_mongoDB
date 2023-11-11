const EmployeeModel = require('../models/employee');
const ShiftRegistrationModel = require('../models/shiftregistration');
const ShiftAttendanceModel = require('../models/shiftattendance');
const AttendanceModel = require('../models/attendance');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv/config');
const { mongoose } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { get_current_time_format } = require('../utils');

// Get info user
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

// Update info user
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

// Upload avatar
const uploadAvatar = async (req, res) => {
  const id = req.userId;

  if (!req.file) {
    res.status(200).json({ success: false, message: 'Chưa chọn ảnh' });
  }

  const file = req.file;

  try {
    // Lấy thông tin về ảnh cũ từ cơ sở dữ liệu
    const employee = await EmployeeModel.findById(id);
    let oldImage = '';

    if (employee.avatar) {
      oldImage = employee.avatar;
    }

    const result = await EmployeeModel.findByIdAndUpdate(id, { avatar: file.filename }, { new: true });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Update Failed' });
    }

    if (oldImage) {
      // Xóa ảnh cũ khỏi thư mục
      fs.unlink(path.join(path.join(process.cwd(), 'uploads/avatars', oldImage)), (err) => {
        if (err) {
          return res.status(404).json({ success: false, message: 'Có lỗi xảy ra khi xóa ảnh: ' + err });
        }
      });
    }

    res.status(204).end();
  } catch (error) {
    return res.status(422).json({ success: false, message: 'Có lỗi xảy ra khi cập nhật: ' + error });
  }
};

// Upload image to attendance
const uploadImage = async (req, res) => {
  const id = req.userId;

  if (!req.file) {
    res.status(200).json({ success: false, message: 'Chưa chọn ảnh' });
  }

  const file = req.file;

  try {
    // Lấy thông tin về ảnh cũ từ cơ sở dữ liệu
    const employee = await EmployeeModel.findById(id);
    let oldImage = '';

    if (employee.image) {
      oldImage = employee.image;
    }

    console.log(oldImage);

    const result = await EmployeeModel.findByIdAndUpdate(id, { image: file.filename }, { new: true });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Update Failed' });
    }

    if (oldImage) {
      // Xóa ảnh cũ khỏi thư mục
      fs.unlink(path.join(path.join(process.cwd(), 'uploads/avatars', oldImage)), (err) => {
        if (err) {
          return res.status(404).json({ success: false, message: 'Có lỗi xảy ra khi xóa ảnh: ' + err });
        }
      });
    }

    res.status(204).end();
  } catch (error) {
    return res.status(422).json({ success: false, message: 'Có lỗi xảy ra khi cập nhật: ' + error });
  }
};

// Get schedule that was employee's chosen
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

// Get shift of current user that was approve
const getAttendance = async (req, res) => {
  const employeeID = req.userId;
  try {
    const employee = await EmployeeModel.findById(employeeID);
    let result = {};
    if (employee.isPartTime) {
      result = await ShiftAttendanceModel.aggregate([
        {
          $lookup: {
            from: 'shift_registrations',
            localField: 'shiftRegistration',
            foreignField: '_id',
            as: 'shiftRegistration',
          },
        },
        { $unwind: '$shiftRegistration' },
        {
          $lookup: {
            from: 'employees',
            localField: 'shiftRegistration.employee',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: '$employee' },
        {
          $lookup: {
            from: 'work_shifts',
            localField: 'shiftRegistration.workShift',
            foreignField: '_id',
            as: 'workShift',
          },
        },
        { $unwind: '$workShift' },
        {
          $match: {
            'employee._id': new mongoose.Types.ObjectId(employeeID),
          },
        },
        {
          $project: {
            shiftRegistration: { workDate: 1 },
            workShift: { shiftName: 1 },
            checkInTime: { $dateToString: { format: '%H:%M:%S', date: '$checkInTime' } },
            checkOutTime: { $dateToString: { format: '%H:%M:%S', date: '$checkOutTime' } },
            status: 1,
          },
        },
      ]);
    } else {
      result = await AttendanceModel.aggregate([
        {
          $lookup: {
            from: 'shift_registrations',
            localField: 'shiftRegistration',
            foreignField: '_id',
            as: 'shiftRegistration',
          },
        },
        { $unwind: '$shiftRegistration' },
        {
          $lookup: {
            from: 'employees',
            localField: 'shiftRegistration.employee',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: '$employee' },
        {
          $lookup: {
            from: 'work_shifts',
            localField: 'shiftRegistration.workShift',
            foreignField: '_id',
            as: 'workShift',
          },
        },
        { $unwind: '$workShift' },
        {
          $match: {
            'employee._id': new mongoose.Types.ObjectId(employeeID),
          },
        },
        {
          $project: {
            shiftRegistration: { workDate: 1 },
            workShift: { shiftName: 1 },
            checkInTime: { $dateToString: { format: '%H:%M:%S', date: '$checkInTime' } },
            checkOutTime: { $dateToString: { format: '%H:%M:%S', date: '$checkOutTime' } },
            status: 1,
          },
        },
      ]);
    }

    res.status(200).json({
      success: true,
      data: shiftAttendances,
      total: shiftAttendances.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

// Get image in db to compare with camera capture
const getImageForCheckAttendance = async (req, res) => {
  const id = req.userId;

  try {
    const employee = await EmployeeModel.findById(id);
    const imageLink = employee.image;

    return res.status(200).json({ success: true, data: imageLink });
  } catch (error) {
    return res.status(422).json({ success: false, message: 'Có lỗi xảy ra khi cập nhật: ' + error });
  }
};

// Get current shift in current day of user login
const getExistingShiftInCurrent = async (req, res) => {
  const id = req.userId;
  // current shift id get from URL
  const { shiftId } = req.params;
  // const currentDate = new Date('2023-11-16T00:00:00.000Z');
  const currentDate = new Date();
  // currentDate.setHours(0, 0, 0, 0);

  try {
    const shifts = (
      await ShiftAttendanceModel.aggregate([
        {
          $lookup: {
            from: 'shift_registrations',
            localField: 'shiftRegistration',
            foreignField: '_id',
            as: 'shiftRegistration',
          },
        },
        { $unwind: '$shiftRegistration' },
        {
          $lookup: {
            from: 'employees',
            localField: 'shiftRegistration.employee',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: '$employee' },
        {
          $lookup: {
            from: 'work_shifts',
            localField: 'shiftRegistration.workShift',
            foreignField: '_id',
            as: 'workShift',
          },
        },
        { $unwind: '$workShift' },
        {
          $match: {
            'employee._id': new mongoose.Types.ObjectId(id),
            'workShift._id': new mongoose.Types.ObjectId(shiftId),
            'shiftRegistration.workDate': currentDate,
          },
        },
        {
          $project: {
            shiftRegistration: 1,
            employee: { _id: 1, name: 1 },
            workShift: { shiftName: 1, startTime: 1, endTime: 1 },
            checkInTime: { $dateToString: { format: '%H:%M:%S', date: '$checkInTime' } },
            checkOutTime: { $dateToString: { format: '%H:%M:%S', date: '$checkOutTime' } },
          },
        },
        {
          $limit: 1,
        },
      ])
    )[0];

    if (!shifts) {
      return res.status(404).json({ success: false, message: 'Bạn không có ca làm trong hôm nay' });
    }

    res.status(200).json({ success: true, data: shifts });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
};

const check = async (req, res) => {
  const { checkType, attendanceId } = req.body;

  try {
    let check = false;
    if (checkType === 'CheckIn') {
      await ShiftAttendanceModel.findByIdAndUpdate(attendanceId, { checkInTime: new Date(), status: 'WORKING' });
      check = true;
    } else {
      await ShiftAttendanceModel.findByIdAndUpdate(attendanceId, { checkOutTime: new Date(), status: 'DONE' });
      check = true;
    }

    if (check) {
      return res.status(200).json({ success: true });
    }

    res.status(200).json({ success: false });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
};

module.exports = {
  getMe,
  updateMe,
  uploadAvatar,
  getSchedule,
  getAttendance,
  uploadImage,
  getImageForCheckAttendance,
  getExistingShiftInCurrent,
  check,
};
