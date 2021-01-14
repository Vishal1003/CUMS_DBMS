const express = require('express');
const mysql = require('mysql');

const app = express();

const db = mysql.createConnection({
  host: 'localhost', // IP address if website
  user: 'root',
  password: 'mysql',
  database: 'cums_dbms',
  port: 3306,
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log('MYSQL connected...');
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Home Page</h1>');
});

app.listen(5000, () => {
  console.log('Server started');
});
