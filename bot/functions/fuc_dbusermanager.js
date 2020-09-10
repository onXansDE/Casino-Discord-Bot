const mysql = require('mysql');
const config = require('../../config.json');


var bankingdb = mysql.createConnection(config.bankingdatabase);

module.exports = {
    saveuser(user) {
        bankingdb.query(`INSERT INTO users (user_name ,user_dcid) VALUES ('${user.user.username}', ${user.id})`, function (error, results, fields) {
            if (error) throw error;
            console.log(results[0]);
        });
    }
}