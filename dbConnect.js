const mysql = require('mysql');
const allTable = [];
// create the connection to database
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: ''
});
module.exports = con;
// let xx = 0;
// const objectifyRawPacket = row => ({ ...row });
// con.promise().query("SHOW DATABASES")
//   .then(([rows, fields]) => {
//     console.log(1)
//     rows = rows.map(objectifyRawPacket);
//     return rows;
//   })
//   .then((rows) => {
//     console.log(2)
//     rows.forEach(element => {
//       con.promise().query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE (TABLE_SCHEMA = '${element.Database}') ORDER BY TABLE_NAME`)
//         .then(([res, fields]) => {
//           res = res.map(objectifyRawPacket);
//           var data = {
//             element,
//             res
//           }
//           console.log("hello")
//           allTable.push(data);
//           xx++;
//         })
//     })

//   })
//   .catch(console.log)
//   .then(() => { con.end() });