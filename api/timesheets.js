const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});



const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = {$employeeId: employeeId};
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      next();
    } else {
      return res.sendStatus(404);
    }
  });
});


timesheetsRouter.get('/', (req, res, next) => {


    db.all('SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId',
    {$employeeId: req.params.employeeId}, (error, timesheets) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({timesheets: timesheets});
      }
    });
});

timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const date = req.body.timesheet.date;
  const rate = req.body.timesheet.date;
  const employee_id = req.params.employeeId;
  const sql = 'INSERT INTO Timesheet (hours, date, rate, employee_id) ' +
  'VALUES ($hours, $date, $rate, $employeeId)';
  const values = {
    $hours : hours,
    $date : date,
    $rate : rate,
    $employeeId : employee_id
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (error, timesheet) => {
        if (error) {
          next(error);
        } else {
          res.status(200).json({timesheet: timesheet});
        }
      })
    }
  });
});

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
    (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      next();
    } else {
      return res.sendStatus(404);
    }
  });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {

  const hours = req.body.timesheet.hours;
  const date = req.body.timesheet.date;
  const rate = req.body.timesheet.rate;
  const employee_id = req.params.employeeId;

  if (!hours || !date || !rate) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Timesheet SET hours = $hours, date = $date, rate = $rate, employee_id = $employeeId ' +
  'WHERE Timesheet.id = $timesheetId';
  const values = {
    $hours: hours,
    $date: date,
    $rate: rate,
    $employeeId: employee_id,
    $timesheetId: req.params.timesheetId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
        (error, timesheet) => {
          if (error) {
            next(error);
          } else {
            res.status(200).json({timesheet: timesheet});
          }

      });
    }
  });

});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {
    $timesheetId: req.params.timesheetId
  };
  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      return res.sendStatus(204);
    }
  });
});



module.exports = timesheetsRouter;
