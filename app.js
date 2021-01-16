const path = require('path');
const env = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const Mysql = require('./mysql/mysql');

env.config();
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const studentRoutes = require('./routes/student');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use('/staff', staffRoutes);
app.use('/student', studentRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

// Connect to database from Mysql class
const db = Mysql.connect();

// run this root for the first time to create a database named cumsdbms
app.get('/create-db', (req, res) => {
  let sql = 'CREATE DATABASE cumsdbms';
  db.query(sql, (err, result) => {
    if (err) throw err;

    console.log(result);
  });
  res.send('Database Connected..');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started @ ${PORT}`);
});
