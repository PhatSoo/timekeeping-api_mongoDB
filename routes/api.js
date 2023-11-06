const express = require('express');
const router = express.Router();

const EmployeeController = require('../controllers/EmployeeController');
const RoleController = require('../controllers/RoleController');
const WorkShiftController = require('../controllers/WorkShiftController');
const FormTypeController = require('../controllers/FormTypeController');
const FormRequestController = require('../controllers/FormRequestController');
const AttendanceController = require('../controllers/AttendanceController');
const ShiftSchedule = require('../controllers/ShiftSchedule');
const ShiftAttendanceController = require('../controllers/ShiftAttendanceController');
const WorkDayController = require('../controllers/WorkDayController');
const authenticate = require('../middlewares/CheckLogin');

const APIRoute = (app) => {
  // Employees API
  router.get('/employee', EmployeeController.listEmployees);
  router.get('/employee/:id', EmployeeController.getEmployee);
  router.post('/employee', EmployeeController.createEmployee);
  router.put('/employee/:id', EmployeeController.updateEmployee);
  router.delete('/employee/:id', EmployeeController.deleteEmployee);

  // Roles API
  router.get('/role', RoleController.listRole);
  router.get('/role/:id', RoleController.getRole);
  router.post('/role', RoleController.createRole);
  router.put('/role/:id', RoleController.updateRole);
  router.delete('/role/:id', RoleController.deleteRole);

  // Work Shifts
  router.get('/work-shift', WorkShiftController.listWorkShifts);
  router.get('/work-shift/:id', WorkShiftController.getWorkShift);
  router.post('/work-shift', WorkShiftController.createWorkShift);
  router.put('/work-shift/:id', WorkShiftController.updateWorkShift);
  router.delete('/work-shift/:id', WorkShiftController.deleteWorkShift);

  // Form Types
  router.get('/form-type', FormTypeController.listFormTypes);
  router.get('/form-type/:id', FormTypeController.getFormType);
  router.post('/form-type', FormTypeController.createFormType);
  router.put('/form-type/:id', FormTypeController.updateFormType);
  router.delete('/form-type/:id', FormTypeController.deleteFormType);

  // Form Requests
  router.get('/form-request', FormRequestController.listFormRequests);
  router.get('/form-request/:id', FormRequestController.getFormRequest);
  router.post('/form-request', FormRequestController.createFormRequest);
  router.put('/form-request/:id', FormRequestController.updateFormRequest);
  router.delete('/form-request/:id', FormRequestController.deleteFormRequest);

  // Work Days ????
  router.get('/work-day', WorkDayController.listWorkDays);
  router.get('/work-day/:id', WorkDayController.getWorkDay);
  router.post('/work-day', WorkDayController.createWorkDay);
  router.put('/work-day/:id', WorkDayController.updateWorkDay);
  router.delete('/work-day/:id', WorkDayController.deleteWorkDay);

  // Attendances for full-time
  router.get('/attendance', AttendanceController.listAttendances);
  router.get('/attendance/:id', AttendanceController.getAttendance);
  router.post('/attendance', AttendanceController.createAttendance);
  router.put('/attendance/:id', AttendanceController.updateAttendance);
  router.delete('/attendance/:id', AttendanceController.deleteAttendance);

  // Attendances for part-time
  router.get('/shift-schedule', ShiftSchedule.listShiftRegistrations);
  router.get('/shift-schedule/:id', ShiftSchedule.getShiftRegistrationByID);
  router.get('/shift-schedule/user/:id', ShiftSchedule.getShiftRegistrationByID);
  router.post('/shift-schedule', ShiftSchedule.createShiftRegistration);
  router.put('/shift-schedule/:id', ShiftSchedule.updateShiftRegistration);
  router.delete('/shift-schedule/all', ShiftSchedule.deleteAll);
  router.delete('/shift-schedule/:id', ShiftSchedule.deleteShiftRegistration);

  // Attendances for part-time
  router.get('/shift-attendance', ShiftAttendanceController.listShiftAttendances);
  router.get('/shift-attendance/:id', ShiftAttendanceController.getShiftAttendance);
  router.post('/shift-attendance', ShiftAttendanceController.createShiftAttendance);
  router.put('/shift-attendance/:id', ShiftAttendanceController.updateShiftAttendance);
  router.delete('/shift-attendance/all', ShiftAttendanceController.deleteAll);
  router.delete('/shift-attendance/:id', ShiftAttendanceController.deleteShiftAttendance);

  return app.use('/api/', authenticate, router);
};

module.exports = APIRoute;
