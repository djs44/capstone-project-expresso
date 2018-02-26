const express = require('express');
const employeesRouter = express.Router();
const timesheetsRouter = require('./timesheets');


const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');



employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1',
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({employees: employees});
      }
    });
});

employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;

  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Employee (name, position, wage) ' +
  'VALUES ($name, $position, $wage)';

  const values = {
                  $name: name,
                  $position: position,
                  $wage: wage
                };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (error, employee) => {
        if (error) {
          next(error);
        } else {
        res.status(201).send({employee: employee});
        }
      });
    }
  });

});

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE id = $employeeId';
  const values = {$employeeId: employeeId};
  db.get(sql, values, (error, employee) => {
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

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);


employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;

  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }
  const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE ' +
  'id = $employeeId';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
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
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (error, deletedEmployee) => {
        res.status(200).json({employee: deletedEmployee});
      });

    }
  })
});






module.exports = employeesRouter;
