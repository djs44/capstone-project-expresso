const express = require('express');
const employeesRouter = express.Router();
const timesheetsRouter = require('./timesheets');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


//check that an employee exists with id parameter, then attach it to request object
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = `SELECT * FROM Employee WHERE id = ${employeeId}`;

  db.get(sql, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      return res.sendStatus(404);
    }
  });
});


//return all current employees
employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({employees: employees});
      }
    });
});

//create new employee, add to database, and return new employee as an object
employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.is_current_employee === 0 ? 0 : 1;



  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';

  const values = {
                  $name: name,
                  $position: position,
                  $wage: wage,
                  $isCurrentEmployee: isCurrentEmployee
                };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE id = last_insert_rowid()`, (error, newEmployee) => {

        res.status(201).json({employee: newEmployee});

      });
    }
  });

});

//return an employee with a given employee ID
employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});


//update an employee already in the database and return with the updated information
employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.is_current_employee === 0 ? 0 : 1;

  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }
  const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE ' +
  'id = $employeeId';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, updatedEmployee) => {
        res.status(200).json({employee: updatedEmployee});
      });

    }
  });
});


//delete an existing employee from the database
employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sql = 'UPDATE Employee SET is_current_employee = $isCurrentEmployee WHERE id = $employeeId';
  const values = {
    $isCurrentEmployee: 0,
    $employeeId: req.params.employeeId
  }

  db.run(sql, values, (error) => {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, deletedEmployee) => {
        res.status(200).json({employee: deletedEmployee});
      });

    }
  })
});


employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);



module.exports = employeesRouter;
