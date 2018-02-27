const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});



const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//check whether a timesheet exists with a given ID
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`,
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

//return all timesheets for all current emloyees
timesheetsRouter.get('/', (req, res, next) => {


    db.all('SELECT * FROM Timesheet WHERE employee_id = $employeeId',
    {$employeeId: req.params.employeeId}, (error, timesheets) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({timesheets: timesheets});
      }
    });
});

//create and return new timesheet
timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const date = req.body.timesheet.date;
  const rate = req.body.timesheet.rate;
  const employeeId = req.params.employeeId;

  if(!hours || !rate || !date) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Timesheet (hours, date, rate, employee_id) VALUES ($hours, $date, $rate, $employeeId)';
  const values = {
    $hours: hours,
    $date: date,
    $rate: rate,
    $employeeId: employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE id = last_insert_rowid()`, (error, timesheet) => {
          res.status(201).json({timesheet: timesheet});
      });
    }
  });
});


//update and return an existing timesheet by ID
timesheetsRouter.put('/:timesheetId', (req, res, next) => {

  const hours = req.body.timesheet.hours;
  const date = req.body.timesheet.date;
  const rate = req.body.timesheet.rate;
  const employee_id = req.params.employeeId;

  if (!hours || !date || !rate) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Timesheet SET hours = $hours, date = $date, rate = $rate, employee_id = $employeeId WHERE id = $timesheetId';
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
      db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`,
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

//delete an existing timesheet by ID
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = 'DELETE FROM Timesheet WHERE id = $timesheetId';
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
