const mysql = require('mysql');
const config = require('../../config.json');
const Discord = require('discord.js');
const timestamp = require('time-stamp');

var bankingdb = mysql.createConnection(
    config.bankingdatabase
);


var time = timestamp('YYYY/MM/DD:mm:ss')


module.exports = {
    addCredits(user, amount, type, title, description, status = "null", author = "Database Banking", footer = `${time}`) {
        userid = user.id;
        bankingdb.query(`SELECT * FROM users WHERE user_dcid=${userid}`, function (error, results, fields) {
            if (error) throw error;
            if (results.length === 1) {
                var newcredits = results[0].credits + amount;
                bankingdb.query(`UPDATE users SET credits=${newcredits} WHERE user_dcid=${userid}`, function (error2, results2, fields2) {
                    if (error2) throw error2;
                    const embed = new Discord.MessageEmbed()
                        .setTitle(`**${title}**`)
                        .setDescription(description)
                        .addField('Type', type, true)
                        .addField('Amount', `**${amount}** Credits`, true)
                        .addField('New Balance', `${newcredits} Credits`, true)
                        .addField('User', user.tag, true)
                        .setColor(2752256)
                        .setAuthor(author)
                        .setFooter(footer);
                    if (status !== null) {
                        embed.addField('Status', `**${status}**`, true);
                    }
                    user.send(embed).catch(error => {
                        console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                        message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                    });
                })
            }
        });
    },

    remCredits(userid, amount) {

        bankingdb.query(`SELECT * FROM users WHERE user_dcid=${userid}`, function (error, results, fields) {
            if (error) throw error;
            if (results.length === 1) {
                var newcredits = results[0].credits - amount;
                if (newcredits < 0) {
                    newcredits = 0;
                }
                bankingdb.query(`UPDATE users SET credits=${newcredits} WHERE user_dcid=${userid}`, function (error2, results2, fields2) {
                    if (error2) throw error2;
                })
            }
        });
    },

    remRCredits(user, amount, type, title, description, status = "null", author = "Database Banking", footer = `${time}`) {
        userid = user.id;
        bankingdb.query(`SELECT * FROM users WHERE user_dcid=${userid}`, function (error, results, fields) {
            if (error) throw error;
            if (results.length === 1) {
                var newcredits = results[0].credits;
                if (error) throw error;
                const embed = new Discord.MessageEmbed()
                    .setTitle(`**${title}**`)
                    .setDescription(description)
                    .addField('Type', type, true)
                    .addField('Amount', `**${amount}** Credits`, true)
                    .addField('New Balance', `${newcredits} Credits`, true)
                    .addField('User', user.tag, true)
                    .setColor(16711680)
                    .setAuthor(author)
                    .setFooter(footer);
                if (status !== null) {
                    embed.addField('Status', `**${status}**`, true);
                }
                user.send(embed).catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });

            }
        });
    },



    setCredits(userid, amount) {
        bankingdb.query(`UPDATE users SET credits=${amount} WHERE user_dcid=${userid}`, function (error, results, fields) {
            if (error) throw error;
        });
    }
}