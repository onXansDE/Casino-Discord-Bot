const mysql = require('mysql');
const config = require('../../config.json');
const dbusermanager = require('../functions/fuc_dbusermanager.js');


var bankingdb = mysql.createConnection(config.bankingdatabase);

module.exports = {
    name: 'registerusers',
    description: 'List all of my commands or info about a specific command.',
    guildOnly: true,
    devOnly: true,

    execute(message, args) {
        var id = message.author.id;
        var channel = message.channel;

        channel.guild.members.cache.forEach(member => {
            if(!member.user.bot) {
            bankingdb.query(`SELECT * FROM users WHERE user_dcid=${member.id}`, function (error, results, fields) {
                if (error) throw error;
                if (results.length === 0) {
                    dbusermanager.saveuser(member);
                }
        
              });
            }
        }); 
    }
    
}