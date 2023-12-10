const AttendanceModel = require('../models/attendance');

const getAttendanceInMonth = async (req, res) => {
  const { date } = req.params;
  const [year, month, _] = date.split('-');
  const startDate = new Date(year, month - 1, 1); // Bắt đầu từ ngày đầu tiên của tháng
  const endDate = new Date(year, month, 0); // Kết thúc là ngày cuối cùng của tháng
  endDate.setDate(endDate.getDate() + 1); // Tăng thêm 1 ngày để bao gồm cả ngày kết thúc

  try {
    const attendanceInMonth = await AttendanceModel.aggregate([
      {
        $match: {
          workDate: { $gte: startDate, $lt: endDate },
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
          from: 'work_shifts', // Thay 'workshifts' bằng tên collection của bạn cho workShift
          localField: 'attendances.workShift',
          foreignField: '_id',
          as: 'attendances.workShift',
        },
      },
      {
        $unwind: '$attendances.workShift',
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
          employee: { name: '$employee.name', email: '$employee.email' },
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
