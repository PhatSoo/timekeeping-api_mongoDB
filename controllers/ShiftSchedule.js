const ShiftRegistration = require('../models/shiftregistration');
const ShiftAttendanceModel = require('../models/shiftattendance');
const WorkShift = require('../models/workshift');

const createShiftRegistration = async (req, res) => {
  const data = req.body;
  const employee = req.userId;

  if (!employee) {
    return res.status(422).json({
      success: false,
      message: 'Bạn chưa đăng nhập',
    });
  }

  if (!Array.isArray(data)) {
    return res.status(422).json({
      success: false,
      message: 'Missing required params',
    });
  }

  try {
    await Promise.all(
      data.map(async (item) => {
        const existingShiftRegistration = await ShiftRegistration.findOne({ workDate: item.workDate });

        if (existingShiftRegistration) {
          // Nếu workDate đã tồn tại, xóa nó trước khi thêm mới
          await ShiftRegistration.deleteMany({ workDate: item.workDate });
        }

        const workShifts = await WorkShift.find({ shiftName: { $in: item.workShift } });
        if (workShifts.length !== item.workShift.length) {
          throw new Error(`Some work shifts not found: ${item.workShift}`);
        }
        const newShiftRegistration = new ShiftRegistration({
          ...item,
          workShift: workShifts.map((shift) => shift._id),
          employee,
        });
        await newShiftRegistration.save();
        return newShiftRegistration;
      })
    );

    res.status(201).json({
      success: true,
      message: 'Bạn đã đăng ký ca làm thành công, nhớ theo dỗi lịch để biết mình được xếp vào ca nào nhé!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const listShiftRegistrations = async (req, res) => {
  try {
    const shiftRegistration = await ShiftRegistration.find().populate('employee', 'name').populate('workShift', 'shiftName');
    res.status(200).json({
      success: true,
      data: shiftRegistration,
      total: shiftRegistration.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const getShiftRegistrationByID = async (req, res) => {
  const { id } = req.params;

  try {
    const shiftRegistration = await ShiftRegistration.findById(id).populate('employee', 'name').populate('workShift', 'shiftName');
    if (!shiftRegistration) {
      return res.status(404).json({ success: false, message: 'Shift registration not found.' });
    }
    res.status(200).json({ success: true, data: shiftRegistration });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const updateShiftRegistration = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedShiftRegistration = await ShiftRegistration.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedShiftRegistration) {
      return res.status(404).json({ success: false, message: 'Shift registration not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteShiftRegistration = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedShiftRegistration = await ShiftRegistration.findByIdAndDelete(id);
    if (!deletedShiftRegistration) {
      return res.status(404).json({ success: false, message: 'Shift registration not found.' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const deleteAll = async (req, res) => {
  try {
    await ShiftRegistration.deleteMany({});
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

const data = [
  {
    _id: '655c7f20b4140fcb2f2e82a9',
    employee: {
      _id: '652919655281b232096b3e98',
      name: 'Hoang Van E',
    },
    workDate: '2023-11-22T00:00:00.000Z',
    workShift: [
      {
        _id: '6528ea8275292954d4e3f3f5',
        shiftName: 'Ca sáng',
      },
    ],
    createdAt: '2023-11-21T09:57:52.036Z',
    updatedAt: '2023-11-21T09:57:52.036Z',
    __v: 0,
  },
  {
    _id: '655c7f20b4140fcb2f2e82ad',
    employee: {
      _id: '652919655281b232096b3e98',
      name: 'Hoang Van E',
    },
    workDate: '2023-11-24T00:00:00.000Z',
    workShift: [
      {
        _id: '6528ea8275292954d4e3f3f5',
        shiftName: 'Ca sáng',
      },
      {
        _id: '652919d55281b232096b3e9e',
        shiftName: 'Ca chiều',
      },
      {
        _id: '654891fb7ab62b993ca966e3',
        shiftName: 'Ca tối',
      },
    ],
    createdAt: '2023-11-21T09:57:52.277Z',
    updatedAt: '2023-11-21T09:57:52.277Z',
    __v: 0,
  },
  {
    _id: '655c7f20b4140fcb2f2e82af',
    employee: {
      _id: '652919655281b232096b3e98',
      name: 'Hoang Van E',
    },
    workDate: '2023-11-26T00:00:00.000Z',
    workShift: [
      {
        _id: '652919d55281b232096b3e9e',
        shiftName: 'Ca chiều',
      },
      {
        _id: '654891fb7ab62b993ca966e3',
        shiftName: 'Ca tối',
      },
    ],
    createdAt: '2023-11-21T09:57:52.292Z',
    updatedAt: '2023-11-21T09:57:52.292Z',
    __v: 0,
  },
];

const schedule = async (req, res) => {
  const { num, data } = req.body;

  try {
    // Tạo một đối tượng để theo dõi ca làm việc đã được gán và số lượng nhân viên đã được gán cho mỗi ca
    let shiftsAssigned = {};

    // Tạo một mảng mới để lưu trữ dữ liệu đã được gán
    let newData = [];

    // Duyệt qua từng đăng ký ca làm việc
    for (let i = 0; i < data.length; i++) {
      let registration = data[i];

      // Duyệt qua từng ca làm việc mà nhân viên này đã đăng ký
      for (let j = 0; j < registration.workShift.length; j++) {
        let shift = registration.workShift[j];

        // Kiểm tra xem ca làm việc này đã được gán cho số lượng nhân viên tối đa chưa
        if (!shiftsAssigned[shift._id] || shiftsAssigned[shift._id] < num) {
          // Nếu chưa, tạo một đối tượng mới theo schema đã cho và thêm nó vào mảng mới
          newData.push({
            workShift: shift._id,
            employee: registration.employee._id,
            checkInTime: null,
            checkOutTime: null,
            workDate: registration.workDate,
            status: 'NULL',
          });

          // Tăng số lượng nhân viên đã được gán cho ca này
          shiftsAssigned[shift._id] = (shiftsAssigned[shift._id] || 0) + 1;

          // Chỉ gán một ca làm việc cho mỗi nhân viên
          break;
        }
      }
    }

    // Lưu ca làm đã xếp vào DB
    for (let i = 0; i < newData.length; i++) {
      const shiftAttendance = new ShiftAttendanceModel(newData[i]);
      await shiftAttendance.save();
    }

    // Trả về mảng mới của các đối tượng đã được gán
    res.status(200).json({ success: true, message: 'Xếp ca làm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  createShiftRegistration,
  listShiftRegistrations,
  getShiftRegistrationByID,
  updateShiftRegistration,
  deleteShiftRegistration,
  deleteAll,
  schedule,
};
