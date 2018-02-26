const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});


const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const value = {
    $menuId: req.params.menuId
  }
  db.all(sql, value, (error, menuItems) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menuItems: menuItems});
    }
  });
});

menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menu_id = req.params.menuId;

  if (!name || !description || !inventory || !price || !menu_id) {
    return res.sendStatus(400);
  } else {
    const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) ' +
    'VALUES ($name, $description, $inventory, $price, $menu_id)';
    const values = {
      $name: name,
      $description: description,
      $inventory: inventory,
      $price: price,
      $menu_id: menu_id
    };
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (error, menuItem) => {
          if (error) {
            next(error);
          } else {
            res.status(201).json({menuItem: menuItem});
          }
        });
      }
    })
  }
});

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = "SELECT * FROM MenuItem WHERE MenuItem.id = $menuId";
  const values = {
    $menuId: menuItemId
  };
  db.get(sql, values, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      next();
    } else {
      return res.sendStatus(404);
    }
  });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menu_id = req.params.menuId;

  if (!name || !description || !inventory || !price || !menu_id) {
    return res.sendStatus(400);
  } else {
    const sql = 'UPDATE MenuItem SET name = $name, description = $description, ' +
    'inventory = $inventory, price = $price, menu_id = $menu_id WHERE MenuItem.id = $menuItemId';
    const values = {
      $name: name,
      $description: description,
      $inventory: inventory,
      $price: price,
      $menu_id: menu_id,
      $menuItemId: req.params.menuItemId
    };
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (error, menuItem) => {
          if (error) {
            next(error);
          } else {
            res.status(200).json({menuItem: menuItem});
          }
        });
      }
    })
  }
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = {
    $menuItemId: req.params.menuItemId
  }
  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      return res.sendStatus(204);
    }
  });
});



module.exports = menuItemsRouter;
