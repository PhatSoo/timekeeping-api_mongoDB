const express = require('express');
const router = express.Router();

const EmployeeController = require('../controllers/EmployeeController');
const RoleController = require('../controllers/RoleController');
const WorkShiftController = require('../controllers/WorkShiftController');
const FormTypeController = require('../controllers/FormTypeController');
const FormRequestController = require('../controllers/FormRequestController');
const AttendanceController = require('../controllers/AttendanceController');
const WorkDayController = require('../controllers/WorkDayController');
const AuthenticationController = require('../controllers/AuthenticateController');

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
  router.post('/work-shift', WorkShiftController.createWorkShift);
  router.get('/work-shift', WorkShiftController.listWorkShifts);
  router.get('/work-shift/:id', WorkShiftController.getWorkShift);
  router.put('/work-shift/:id', WorkShiftController.updateWorkShift);
  router.delete('/work-shift/:id', WorkShiftController.deleteWorkShift);

  // Form Types
  router.post('/form-type', FormTypeController.createFormType);
  router.get('/form-type', FormTypeController.listFormTypes);
  router.get('/form-type/:id', FormTypeController.getFormType);
  router.put('/form-type/:id', FormTypeController.updateFormType);
  router.delete('/form-type/:id', FormTypeController.deleteFormType);

  // Form Requests
  router.post('/form-request', FormRequestController.createFormRequest);
  router.get('/form-request', FormRequestController.listFormRequests);
  router.get('/form-request/:id', FormRequestController.getFormRequest);
  router.put('/form-request/:id', FormRequestController.updateFormRequest);
  router.delete('/form-request/:id', FormRequestController.deleteFormRequest);

  // Work Days
  router.post('/work-day', WorkDayController.createWorkDay);
  router.get('/work-day', WorkDayController.listWorkDays);
  router.get('/work-day/:id', WorkDayController.getWorkDay);
  router.put('/work-day/:id', WorkDayController.updateWorkDay);
  router.delete('/work-day/:id', WorkDayController.deleteWorkDay);

  // Attendances
  router.post('/attendance', AttendanceController.createAttendance);
  router.get('/attendance', AttendanceController.listAttendances);
  router.get('/attendance/:id', AttendanceController.getAttendance);
  router.put('/attendance/:id', AttendanceController.updateAttendance);
  router.delete('/attendance/:id', AttendanceController.deleteAttendance);

  // Authentication API
  router.post('/login', AuthenticationController.login);

  return app.use('/api/', router);
};

module.exports = APIRoute;
