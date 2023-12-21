const EmployeeModel = require('../models/employee');
const ShiftRegistrationModel = require('../models/shiftregistration');
const AttendanceModel = require('../models/attendance');
const FormRequestModel = require('../models/formrequest');
const bcrypt = require('bcrypt');
require('dotenv/config');
const { mongoose } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { cloudinaryUploader } = require('../config/cloudinary');

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
          checkIn: { time: 1 },
          checkOut: { time: 1 },
          employee: { isPartTime: 1 },
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
  let { shiftId } = req.params;

  let currentDate = new Date();
  const utcDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - 1, 17, 0, 0));
  currentDate = utcDate.toISOString();

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
            workDate: { $eq: new Date(currentDate) },
            'workShift._id': shiftId === 'null' ? null : new mongoose.Types.ObjectId(shiftId),
          },
        },
        {
          $project: {
            employee: { _id: 1, name: 1 },
            workShift: { shiftName: 1, startTime: 1, endTime: 1 },
            checkIn: { time: { $dateToString: { format: '%H:%M:%S', date: '$checkIn.time', timezone: process.env.TZ } } },
            checkOut: { time: { $dateToString: { format: '%H:%M:%S', date: '$checkOut.time', timezone: process.env.TZ } } },
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

const form = async (req, res) => {
  const data = req.body;
  const userId = req.userId;
  try {
    const createRequest = new FormRequestModel({ ...data, employee: new mongoose.Types.ObjectId(userId) });
    const result = await createRequest.save();
    if (result) {
      res.status(200).json({ success: true });
    } else res.status(400).json({ success: false });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
};

const getRequest = async (req, res) => {
  const employeeId = req.userId;
  try {
    const data = await FormRequestModel.find({ employee: employeeId });
    if (data) {
      res.status(200).json({ success: true, data, total: data.length });
    } else res.status(400).json({ success: false, message: 'Bạn không có dữ liệu' });
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
  form,
  getRequest,
};
