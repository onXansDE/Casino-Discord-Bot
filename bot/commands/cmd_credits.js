const mysql = require('mysql');
const config = require('../../config.json');
const Discord = require('discord.js');
const creditmanager = require('../functions/fuc_creditmanager.js');


var storedb = mysql.createConnection(
    config.storedatabase
);

var bankingdb = mysql.createConnection(
    config.bankingdatabase
);

module.exports = {
    name: 'credits',
    description: 'Show your credits',
    cooldown: 30,
    execute(message, args) {
        var id = message.author.id;
        var channel = message.channel;

        if (args.length === 0) {
            bankingdb.query(`SELECT * FROM users WHERE user_dcid=${id}`, function (error, results, fields) {
                if (error) throw error;
                if (results.length === 1) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle('Your Balance')
                        .addField('Credits', `${results[0].credits} Credits`)
                        .setColor(65413)
                        .setAuthor('Database Banking');
                    channel.send(embed);
                }
            });
        } else if (args.length === 1) {
            if(message.mentions.users.size === 1) {
                var touser = message.mentions.users.first();

                bankingdb.query(`SELECT * FROM users WHERE user_dcid=${touser.id}`, function (error, results, fields) {
                    if (error) throw error;
                    if (results.length === 1) {
                        const embed = new Discord.MessageEmbed()
                            .setTitle(`${touser.tag}\`s Credits`)
                            .addField('Credits', `${results[0].credits} Credits`)
                            .setColor(65413)
                            .setAuthor('Database Banking');
                        channel.send(embed);
                    }
                });

            }
        }
    },
};