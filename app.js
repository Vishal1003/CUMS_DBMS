const path = require('path');
const env = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');


env.config();
const app = express();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'cumsdbms'
});

db.connect((err) => {
  if(err){
    throw err;
  }
  console.log("Mysql Connected")
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('<h1>Home Page</h1>');
});


// run this root for the first time to create a database named cumsdbms
app.get('/create-db', (req, res) => {
  let sql = 'CREATE DATABASE cumsdbms';
  db.query(sql, (err, result) => {
    if(err)
      throw err;
    
    console.log(result);
  });
  res.send('Database Connected..');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started @ ${PORT}`);
});
