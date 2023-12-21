const express = require('express');
const router = express.Router();
const { uploadAvatar } = require('../middlewares/Uploads');

const EmployeeController = require('../controllers/EmployeeController');
const RoleController = require('../controllers/RoleController');
const WorkShiftController = require('../controllers/WorkShiftController');
const FormRequestController = require('../controllers/FormRequestController');
const AttendanceController = require('../controllers/AttendanceController');
const ShiftScheduleController = require('../controllers/ShiftSchedule');
const UploadController = require('../controllers/UploadController');
const StatisticController = require('../controllers/StatisticController');
const SettingsController = require('../controllers/SettingsController');
const authenticate = require('../middlewares/CheckLogin');

const APIRoute = (app) => {
  // Employees API
  router.get('/employee/part-time/:isPartTime', EmployeeController.listEmployeesPartTime);
  router.get('/employee/:id', EmployeeController.getEmployee);
  router.get('/employee', EmployeeController.listEmployees);
  router.post('/employee', EmployeeController.createEmployee);
  router.put('/employee', EmployeeController.updateEmployee);
  router.patch('/employee', EmployeeController.resetPassword);
  router.delete('/employee/:id', EmployeeController.deleteEmployee);
  router.delete('/employee', EmployeeController.deleteEmployeeMultiple);

  // Upload API
  router.post('/upload/avatar', uploadAvatar.single('avatar'), UploadController.uploadAvatar);
  // Statistic API
  router.get('/statistic/:from/:to/:filterType', StatisticController.getAttendanceInMonth);
  // Settings API
  router.get('/settings', SettingsController.getSettings);
  router.post('/settings', SettingsController.updateSettings);

  // Roles API
  router.get('/role', RoleController.listRole);
  router.get('/role/:id', RoleController.getRole);
  router.post('/role', RoleController.createRole);
  router.put('/role', RoleController.updateRole);
  router.delete('/role', RoleController.deleteRole);

  // Work Shifts
  router.get('/work-shift', WorkShiftController.listWorkShifts);
  router.get('/work-shift/:id', WorkShiftController.getWorkShift);
  router.get('/current-shift', WorkShiftController.getCurrentShift);
  router.post('/work-shift', WorkShiftController.createWorkShift);
  router.put('/work-shift', WorkShiftController.updateWorkShift);
  router.delete('/work-shift', WorkShiftController.deleteWorkShift);

  // Form Requests
  router.get('/form-request', FormRequestController.listFormRequests);
  router.get('/form-request/pending', FormRequestController.listFormRequestsPending);
  router.get('/form-request/:id', FormRequestController.getFormRequest);
  router.post('/form-request', FormRequestController.createFormRequest);
  router.put('/form-request', FormRequestController.updateFormRequest);
  router.delete('/form-request/:id', FormRequestController.deleteFormRequest);

  // Attendances for full-time
  router.get('/attendance', AttendanceController.listAttendances);
  router.get('/attendance/date/:date', AttendanceController.getAttendanceByDate);
  router.get('/attendance/:id', AttendanceController.getAttendance);
  router.post('/attendance', AttendanceController.createAttendance);
  router.put('/attendance/:id', AttendanceController.updateAttendance);
  router.delete('/attendance/:id', AttendanceController.deleteAttendance);

  // Attendances for part-time
  router.get('/shift-schedule/date/:date', ShiftScheduleController.listShiftRegistrations);
  router.get('/shift-schedule/user/:id', ShiftScheduleController.getShiftRegistrationByID);
  router.get('/shift-schedule/:id', ShiftScheduleController.getShiftRegistrationByID);
  router.post('/shift-schedule/schedule', ShiftScheduleController.schedule);
  router.post('/shift-schedule', ShiftScheduleController.createShiftRegistration);
  router.put('/shift-schedule/:id', ShiftScheduleController.updateShiftRegistration);
  router.delete('/shift-schedule/all', ShiftScheduleController.deleteAll);
  router.delete('/shift-schedule/:id', ShiftScheduleController.deleteShiftRegistration);

  return app.use('/api/', authenticate, router);
};
//
module.exports = APIRoute;
