const express = require('express');
const menusRouter = express.Router();
const menuItemsRouter = require('./menuItems');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//check that a menu exists with the given ID, and if so attach it to request object
menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = `SELECT * FROM Menu WHERE id = ${menuId}`;
  db.get(sql, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      return res.sendStatus(404);
    }
  });
});


//return all the menus
menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (error, menus) => {
    res.status(200).json({menus: menus});
  });
});

//create and return new menu
menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }
    const sql = 'INSERT INTO Menu (title) VALUES ($title)';
    const value = {
      $title: title
    };
    db.run(sql, value, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Menu WHERE id = last_insert_rowid()`, (error, menu) => {
            res.status(201).json({menu: menu});

          });
        }
      });
});


//get a menu by menu ID
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

//update and return the title of an existing menu by ID
menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    return res.sendStatus(400);
  }
  const sql = 'UPDATE Menu SET title = $title WHERE id = $menuId';
  const values = {
    $title: title,
    $menuId: req.params.menuId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`,
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

//delete an existing menu
menusRouter.delete('/:menuId', (req, res, next) => {
  //First check whether menu has any items before deleting menu
  const sql = 'SELECT * FROM MenuItem WHERE menu_id = $menuId';
  const value = {$menuId: req.params.menuId};
  db.get(sql, value, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      return res.sendStatus(400);
    } else {
      const sql = 'DELETE FROM Menu WHERE id = $menuId';
      const value = {$menuId: req.params.menuId};
      db.run(sql, value, (error) => {
        return res.sendStatus(204);
      });
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);


module.exports = menusRouter;
