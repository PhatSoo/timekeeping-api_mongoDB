const ShiftRegistration = require('../models/shiftregistration');
const EmployeeModel = require('../models/employee');
const AttendanceModel = require('../models/attendance');
const WorkShift = require('../models/workshift');
const SettingsModel = require('../models/settings');
const { createShift, shuffleArray } = require('../utils/index');
const { TIME } = require('../utils/constants');

const createShiftRegistration = async (req, res) => {
  const data = req.body;
  const employee = req.userId;

  const date = new Date();
  date.setDate(date.getDate() + 7);

  const currentDateInUTC = new Date(date.toISOString().split('T')[0] + 'T00:00:00.000+07:00');
  getDay = (d, add) => {
    let result = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - d.getUTCDay() + add));
    result.setUTCHours(result.getUTCHours() - 7); // Giảm 7 giờ
    return result;
  };

  const monday = getDay(currentDateInUTC, 1);
  const sunday = getDay(currentDateInUTC, 7);

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
    await ShiftRegistration.deleteMany({
      workDate: {
        $gte: monday,
        $lte: sunday,
      },
      employee,
    });

    await Promise.all(
      data.map(async (item) => {
        const existingShiftRegistration = await ShiftRegistration.findOne({ workDate: item.workDate, employee });

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

    const settings = await SettingsModel.findOne({});
    if (settings && settings.schedule) {
      await SettingsModel.updateOne({ $set: { schedule: false } });
    }

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

  getDay = (d, add) => {
    let result = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - d.getUTCDay() + add));
    result.setUTCHours(result.getUTCHours() - 7); // Giảm 7 giờ
    return result;
  };

  const monday = getDay(day, 1);
  const sunday = getDay(day, 7);

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
  let { num, data, holidays } = req.body;

  data = shuffleArray(data);

  try {
    let shiftsAssignedPerDay = {};
    let scheduledShifts = {};
    let promises = [];

    const holidaysConvert = holidays.map((date) => new Date(`${date} ${TIME}`).toISOString());

    for (let i = 0; i < data.length; i++) {
      let registration = data[i];

      if (holidaysConvert.includes(registration.workDate)) {
        continue;
      }

      // Reset shiftsAssigned for a new day
      if (!shiftsAssignedPerDay[registration.workDate]) {
        shiftsAssignedPerDay[registration.workDate] = {};

        // Reset scheduledShifts for a new day
        scheduledShifts = {};
      }

      let shiftsAssigned = shiftsAssignedPerDay[registration.workDate];

      if (!scheduledShifts[registration.employee._id]) {
        scheduledShifts[registration.employee._id] = [];
      }

      for (let j = 0; j < registration.workShift.length; j++) {
        let shift = registration.workShift[j];

        if ((!shiftsAssigned[shift._id] || shiftsAssigned[shift._id] < num) && !scheduledShifts[registration.employee._id].includes(shift._id)) {
          scheduledShifts[registration.employee._id].push(shift._id);
          shiftsAssigned[shift._id] = (shiftsAssigned[shift._id] || 0) + 1;

          promises.push(createShift(registration, shift));
          break;
        }
      }
    }

    const employeeFullTime = await EmployeeModel.find({ isPartTime: false });

    const settings = await SettingsModel.findOne().select('workDays');
    const workDays = settings.workDays;

    let now = new Date();
    let daysArray = [];

    // Calculate the number of days to next Monday
    let daysToMonday = (1 - now.getUTCDay() + 7) % 7;
    const nextMonday = new Date(now.setUTCDate(now.getUTCDate() + daysToMonday));
    nextMonday.setHours(0, 0, 0, 0);

    // Add each day from Monday to Saturday to the array
    for (let i = 0; i <= workDays.length - 1; i++) {
      let day = parseInt(workDays[i]);
      let date = new Date(nextMonday);
      date.setDate(nextMonday.getDate() + ((day + 7 - nextMonday.getDay()) % 7));
      daysArray.push(date);
    }

    for (let i = 0; i < employeeFullTime.length; i++) {
      let employee = employeeFullTime[i];

      for (let j = 0; j < daysArray.length; j++) {
        let workDate = daysArray[j].toISOString();

        // Kiểm tra xem ngày làm việc có phải là ngày nghỉ không
        if (holidaysConvert.includes(workDate)) {
          continue;
        }
        // Tạo một ca làm việc mới
        const newShift = {
          workShift: null,
          employee: employee._id,
          checkIn: {
            time: null,
            image: null,
            score: null,
          },
          checkOut: {
            time: null,
            image: null,
            score: null,
          },
          workDate: workDate,
          status: 'NULL',
        };

        const attendance = new AttendanceModel(newShift);
        promises.push(attendance.save());
      }
    }

    await Promise.all(promises);

    await SettingsModel.updateOne({}, { schedule: true });

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
