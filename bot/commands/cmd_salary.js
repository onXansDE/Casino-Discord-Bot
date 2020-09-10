const mysql = require('mysql');
const config = require('../../config.json');
const Discord = require('discord.js');
const creditmanager = require('../functions/fuc_creditmanager.js');
const timestamp = require('time-stamp');

var bankingdb = mysql.createConnection(
    config.bankingdatabase
);


module.exports = {
    name: 'salary',
    description: 'Claim your credits',
    cooldown: 28800,
    async execute(message, args) {
        var id = message.author.id;
        var channel = message.channel;
        var playedtime = timestamp('YYYY/MM/DD:mm:ss')

        var firstcredits;
        message.delete();

        bankingdb.query(`SELECT * FROM users WHERE user_dcid=${id}`, function (error, results, fields) {
            if (error) throw error;
            if (results.length === 1) {
                const embed = new Discord.MessageEmbed()
                    .setTitle('Claimed Rewards')
                    .addField('Credits', `${results[0].credits} **+${config.dailyamount}** Credits`)
                    .setColor(65413)
                    .setAuthor('Database Banking');
                channel.send(embed).then(messageEdited => {
                    function deleteMessage() {
                        messageEdited.delete();
                        const resultlogm = new Discord.MessageEmbed()
                        .setAuthor('Database banking')
                        .setTitle('Balance Change')
                        .setDescription('Type: Salary')
                        .addField('Result', `Amount: **${config.dailyamount}** Credits`)
                        .setColor(2752256)
                        .setFooter(`${playedtime}`)
                        message.author.send(resultlogm)
                    }
                    setTimeout(deleteMessage, 10000);
                });
            }
        });


        creditmanager.addCredits(id, config.dailyamount);
    },
};