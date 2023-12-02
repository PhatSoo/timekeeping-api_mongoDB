const EmployeeModel = require('../models/employee');
const ShiftRegistrationModel = require('../models/shiftregistration');
// const ShiftAttendanceModel = require('../models/shiftattendance');
const AttendanceModel = require('../models/attendance');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv/config');
const { mongoose } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { get_current_time_format } = require('../utils');
const { compare2Images } = require('../middlewares/Compare2Faces');

// Get info user
const getMe = async (req, res) => {
  const id = req.userId;

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
    let result = {};

    // const asd = await AttendanceModel.find({ employee: employee._id });
    // return res.status(200).json(asd);

    result = await AttendanceModel.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $lookup: {
          from: 'work_shifts',
          localField: 'workShift',
          foreignField: '_id',
          as: 'workShift',
        },
      },
      { $unwind: { path: '$workShift', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          'employee._id': new mongoose.Types.ObjectId(employeeID),
        },
      },
      {
        $project: {
          workDate: 1,
          workShift: { shiftName: 1 },
          checkInTime: 1,
          checkOutTime: 1,
          // checkInTime: { $dateToString: { format: '%H:%M:%S', date: '$checkInTime' } },
          // checkOutTime: { $dateToString: { format: '%H:%M:%S', date: '$checkOutTime' } },
          status: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: result,
      total: result.length,
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

  const currentDate = new Date();
  currentDate.setUTCHours(0, 0, 0, 0);

  try {
    const shifts = (
      await AttendanceModel.aggregate([
        {
          $lookup: {
            from: 'employees',
            localField: 'employee',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: '$employee' },
        {
          $lookup: {
            from: 'work_shifts',
            localField: 'workShift',
            foreignField: '_id',
            as: 'workShift',
          },
        },
        { $unwind: { path: '$workShift', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            'employee._id': new mongoose.Types.ObjectId(id),
            workDate: currentDate,
            'workShift._id': shiftId === 'null' ? null : new mongoose.Types.ObjectId(shiftId),
          },
        },
        {
          $project: {
            employee: { _id: 1, name: 1 },
            workShift: { shiftName: 1, startTime: 1, endTime: 1 },
            checkInTime: { $dateToString: { format: '%H:%M:%S', date: '$checkInTime', timezone: process.env.TZ } },
            checkOutTime: { $dateToString: { format: '%H:%M:%S', date: '$checkOutTime', timezone: process.env.TZ } },
            status: 1,
          },
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
  const employeeID = req.userId;

  try {
    const currentEmployee = await EmployeeModel.findById(employeeID).select('avatar');
    const employeeImage = currentEmployee.avatar;
    const captureImage = req.file.path;
    const result = await compare2Images(employeeImage, captureImage);
    console.log(result);
    // let check = false;
    // if (checkType === 'CheckIn') {
    //   await AttendanceModel.findByIdAndUpdate(attendanceId, { checkInTime: new Date(), status: 'WORKING' });
    //   check = true;
    // } else {
    //   await AttendanceModel.findByIdAndUpdate(attendanceId, { checkOutTime: new Date(), status: 'DONE' });
    //   check = true;
    // }

    if (result) {
      if (checkType === 'CheckIn') {
        await AttendanceModel.findByIdAndUpdate(attendanceId, { checkInTime: new Date(), status: 'WORKING' });
      } else {
        await AttendanceModel.findByIdAndUpdate(attendanceId, { checkOutTime: new Date(), status: 'DONE' });
      }
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
