const mysql = require('mysql'); 
var db_username = (process.env.DB_USERNAME || 'root')
var db_pass = (process.env.DB_PASS || '');

const con = mysql.createConnection({
  host: "localhost",
  user: db_username,
  password:db_pass
});

module.exports = con;