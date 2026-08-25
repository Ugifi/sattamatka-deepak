const db = require('./config/db');

db.query("SELECT id, name, close_time, game_category FROM games WHERE id IN (80,81,82,83,84,85,86,87,88,89,90,91)")
  .then(([r]) => {
    console.log(JSON.stringify(r, null, 2));
    process.exit();
  })
  .catch(e => console.log(e.message));