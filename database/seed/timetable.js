const mysql = require('mysql');
const env = require('dotenv');
env.config();
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'cumsdbms',
});
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Mysql Connected');
});
// Database query promises
const zeroParamPromise = (sql) => {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

const queryParamPromise = (sql, queryParam) => {
  return new Promise((resolve, reject) => {
    db.query(sql, queryParam, (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};
const startTime = ['10:00:00', '11:00:00', '12:00:00', '13:00:00'];
const endTime = ['11:00:00', '12:00:00', '13:00:00', '14:00:00'];
// Currently implemented only for 1st semester, 2021 joining year students of all departments
// Assumed only one subject per teacher but can be generalized with an extra 2D array
async function generateTimeTable() {
  try {
    await new Promise((r) => setTimeout(r, 2000)); // wait for mysql connection
    await zeroParamPromise('TRUNCATE TABLE time_table');
    console.log('Time Table Truncated');
    const classesData = await zeroParamPromise('select * from class');
    let departmentsData = await zeroParamPromise(
      'select dept_id from department'
    );
    for (let i = 0; i < departmentsData.length; ++i) {
      departmentsData[i] = departmentsData[i].dept_id;
    }
    // time table for all departments and 3 sections each
    const timeTable = new Array(departmentsData.length * 3);
    for (let day = 0; day < 5; ++day) {
      console.log(day);
      // Four time slots for each class
      for (let i = 0; i < timeTable.length; ++i) {
        timeTable[i] = new Array(4);
      }
      console.table(timeTable);
      for (const classData of classesData) {
        const dept = (
          await queryParamPromise('select dept_id from course where c_id = ?', [
            classData.c_id,
          ])
        )[0].dept_id;
        const section = classData.section - 1;
        const row = departmentsData.indexOf(dept) * 3 + section;
        console.log(dept, section, row);
        let col = Math.floor(Math.random() * timeTable[row].length);
        while (timeTable[row][col] !== undefined) {
          col = Math.floor(Math.random() * timeTable[row].length);
        }
        timeTable[row][col] = classData.class_id;
        await queryParamPromise('insert into time_table set ?', {
          c_id: classData.c_id,
          st_id: classData.st_id,
          start_time: startTime[col],
          end_time: endTime[col],
          section,
          day: day,
        });
      }
      console.table(timeTable);
    }
  } catch (err) {
    throw err;
  } finally {
    process.exit();
  }
}
generateTimeTable();
