const mysql = require('mysql');

module.exports = class Mysql {
  static connect() {
    // establish connection
    const db = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: 'cumsdbms',
    });
    // connect to database
    db.connect((err) => {
      if (err) {
        throw err;
      }
      console.log('Mysql Connected');
    });
    return db;
  }
};
