const express = require('express');
const menusRouter = express.Router();
const menuItemsRouter = require('./menuItems');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (error, menus) => {
    res.status(200).json({menus: menus});
  });
});

menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.status(400).send();
  } else {
    const sql = 'INSERT INTO Menu (title) VALUES ($title)';
    const value = {
      $title: title
    };
    db.run(sql, value, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (error, menu) => {
          if (error) {
            next(error);
          } else {
            res.status(201).json({menu: menu});
          }
        });
      }
    });
  }
});

menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const value = {
    $menuId: req.params.menuId
  };

  db.get(sql, value, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.status(404).send();
    }
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;
  const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
  const values = {
    $title: title,
    $menuId: req.params.menuId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
      (error, menu) => {
        if (error) {
          next(error);
        } else {
          res.status(200).json({menu: menu});
        }
      });
    }
  });
});

menusRouter.delete('/:menuId', (req, res, next) => {
  const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
  const values = {
    $menuId: req.params.menuId
  };
  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      return res.sendStatus(204);
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);





module.exports = menusRouter;
