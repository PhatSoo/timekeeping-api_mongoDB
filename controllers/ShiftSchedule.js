const ShiftRegistration = require('../models/shiftregistration');
// const ShiftAttendanceModel = require('../models/shiftattendance');
const AttendanceModel = require('../models/attendance');
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
  const { date } = req.params;
  const dateTimeZone = `${date}T00:00:00.000+07:00`;
  const day = new Date(dateTimeZone);

  getDay = (d, add) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - d.getUTCDay() + add));

  monday = getDay(day, 1);
  sunday = getDay(day, 7);

  try {
    const shiftRegistration = await ShiftRegistration.find({
      workDate: {
        $gte: monday,
        $lte: sunday,
      },
    })
      .populate('employee', 'name')
      .populate('workShift', 'shiftName');
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

const schedule = async (req, res) => {
  const { num, data } = req.body;

  try {
    let shiftsAssigned = {};
    let scheduledShifts = {}; // Đối tượng để theo dõi các ca làm việc đã được xếp lịch cho mỗi người

    for (let i = 0; i < data.length; i++) {
      let registration = data[i];

      if (!scheduledShifts[registration.employee._id]) {
        scheduledShifts[registration.employee._id] = [];
      }

      for (let j = 0; j < registration.workShift.length; j++) {
        let shift = registration.workShift[j];

        // Kiểm tra xem nhân viên đã được xếp lịch cho ca làm việc này chưa
        if ((!shiftsAssigned[shift._id] || shiftsAssigned[shift._id] < num) && !scheduledShifts[registration.employee._id].includes(shift._id)) {
          // Thêm vào danh sách ca làm việc đã xếp cho nhân viên và danh sách ca làm việc đã được xếp
          scheduledShifts[registration.employee._id].push(shift._id);
          shiftsAssigned[shift._id] = (shiftsAssigned[shift._id] || 0) + 1;

          // Thêm ca làm việc vào danh sách mới
          const newShift = {
            workShift: shift._id,
            employee: registration.employee._id,
            checkInTime: null,
            checkOutTime: null,
            workDate: registration.workDate,
            status: 'NULL',
          };
          // Lưu vào DB
          const attendance = new AttendanceModel(newShift);
          await attendance.save();
          break; // Chỉ xếp lịch cho 1 ca làm việc cho mỗi nhân viên
        }
      }
    }

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
