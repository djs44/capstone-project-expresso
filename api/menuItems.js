const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//check that a menu item exists with the request ID, then attach it to the request object
menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = `SELECT * FROM MenuItem WHERE id = $menuItemId`;
  const value = {$menuItemId: menuItemId};

  db.get(sql, value, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      return res.sendStatus(404);
    }
  });
});


//get all menu items on a given menu by menu ID
menuItemsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM MenuItem WHERE menu_id = $menuId';
  const value = {
    $menuId: req.params.menuId
  };

  db.all(sql, value, (error, menuItems) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menuItems: menuItems});
    }
  });
});


//create and return new menu item
menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId = req.params.menuId;

  if(!name || !inventory || !price || !description) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId
  };

  db.run(sql, values, function(error){
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (error, row) => {
        res.status(201).send({menuItem: row});
      });
    }
  });
});


//update and return existing menu item
menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;


  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  } else {
    const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE id = $menuItemId';
    const values = {
      $name: name,
      $description: description,
      $inventory: inventory,
      $price: price,
      $menuItemId: req.params.menuItemId
    };
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (error, menuItem) => {
          res.status(200).json({menuItem: menuItem});
          });
      }
    })
  }
});

//delete a menu item from an existing menu
menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = 'DELETE FROM MenuItem WHERE id = $menuItemId';
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
