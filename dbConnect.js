const mysql = require('mysql2');
// create the connection to database

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'asdf',
});

module.exports = con;