const AttendanceModel = require('../models/attendance');

const getAttendanceInMonth = async (req, res) => {
  const { from, to, filterType } = req.params;

  let start, end;

  if (filterType === 'date') {
    const [day1, month1, year1] = from.split('-');
    const [day2, month2, year2] = to.split('-');
    start = new Date(year1, month1 - 1, day1);
    end = new Date(year2, month2 - 1, day2);
  } else {
    const [month1, year1] = from.split('-');
    const [month2, year2] = to.split('-');
    start = new Date(year1, month1 - 1, 1);
    end = new Date(year2, month2);
  }

  try {
    const attendanceInMonth = await AttendanceModel.aggregate([
      {
        $match: {
          workDate: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: '$employee',
          attendances: { $push: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employeeDetails',
        },
      },
      {
        $unwind: '$employeeDetails',
      },
      {
        $unwind: '$attendances',
      },
      {
        $lookup: {
          from: 'work_shifts',
          localField: 'attendances.workShift',
          foreignField: '_id',
          as: 'attendances.workShift',
        },
      },
      {
        $unwind: { path: '$attendances.workShift', preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: '$_id',
          employee: { $first: '$employeeDetails' },
          attendances: { $push: '$attendances' },
        },
      },
      {
        $project: {
          _id: 0,
          employee: { name: '$employee.name', email: '$employee.email', _id: '$employee._id' },
          attendances: 1,
        },
      },
    ]);
    res.status(200).json({ success: true, data: attendanceInMonth, total: attendanceInMonth.length });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
};

module.exports = {
  getAttendanceInMonth,
};
