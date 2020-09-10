const mysql = require('mysql');
const config = require('../../config.json');
const Discord = require('discord.js');
const creditmanager = require('../functions/fuc_creditmanager.js');
var Chance = require('chance');
var randomstring = require("randomstring");
const timestamp = require('time-stamp');

var bankingdb = mysql.createConnection(
    config.bankingdatabase
);


module.exports = {
    name: 'coinflip',
    description: 'Try your luck by flipping a coin',
    cooldown: 20,
    guildOnly: true,
    async execute(message, args) {

        var seed = randomstring.generate();
        var chance = new Chance(seed);
        var id = message.author.id;
        var channel = message.channel;
        var playedtime = timestamp('YYYY/MM/DD:mm:ss')
        var betamount;

        if (args.length === 0) {
            betamount = 100;
        } else {
            betamount = parseInt(args[0])
            if(betamount === 0) {
                return;
            }
        }
        message.delete();

        bankingdb.query(`SELECT * FROM users WHERE user_dcid=${id}`, function (error, results, fields) {
            if (error) throw error;
            if (results.length === 1) {
                if (results[0].credits >= betamount) {
                    creditmanager.remCredits(id, betamount);
                    const gameemebd = new Discord.MessageEmbed()
                        .setTitle('Coinflip')
                        .setDescription(`Flipping a Coin...`)
                        .addField('User',`${message.author.tag}`)
                        .addField('Your Bet', `${betamount} credits`)
                        .setFooter(`Seed: ${seed} | ${playedtime}`)
                        .setAuthor('Casino');
                    channel.send(gameemebd).then(sentMessage => {
                        var result = chance.integer({
                            min: 0,
                            max: 100
                        });
                        if (result >= 50) {
                            var reward = Math.floor(betamount + (betamount / 3));
                            const resultmessage = new Discord.MessageEmbed()
                                .setTitle('Coinflip')
                                .addField('Your Bet', `${betamount} credits`)
                                .addField('Status', '**WON**')
                                .addField('Rewarded Credits', `${reward}`)
                                .addField('Result', `${result}`)
                                .addField('User',`${message.author.tag}`)
                                .setColor(2752256)
                                .setFooter(`Seed: ${seed} | ${playedtime}`)
                                .setAuthor('Casino');
                            setTimeout(sendMessage, 3000);

                            function sendMessage() {
                                sentMessage.edit(resultmessage).then(messageEdited => {
                                    function deleteMessage() {
                                        messageEdited.delete();
                                        creditmanager.addCredits(message.author, reward, 'Coinflip', 'Game Results', `Value: **${result}**/100\n\nYou win when the value is 50 or above`,'WON','Casino', `Seed: ${seed} | ${playedtime}`);
                                    }
                                    setTimeout(deleteMessage, 30000);
                                });

                            }
                        } else {
                            const resultmessage = new Discord.MessageEmbed()
                                .setTitle('Coinflip')
                                .addField('Your Bet', `${betamount} credits`)
                                .addField('Status', '**LOST**')
                                .addField('Lost Credits', `${betamount}`)
                                .addField('Result', `${result}`)
                                .addField('User',`${message.author.tag}`)
                                .setColor(16711680)
                                .setFooter(`Seed: ${seed} | ${playedtime}`)
                                .setAuthor('Casino');


                            setTimeout(sendMessage, 3000);

                            function sendMessage() {
                                sentMessage.edit(resultmessage).then(messageEdited => {
                                    function deleteMessage() {
                                        messageEdited.delete();
                                        creditmanager.remRCredits(message.author, betamount, 'Coinflip', 'Game Results', `Value: **${result}**/100\n\nYou win when the value is 50 or above`,'LOST','Casino', `Seed: ${seed} | ${playedtime}`);
                                    }
                                    setTimeout(deleteMessage, 30000);
                                });
                            }
                        }
                    })
                }
            }
        });





    }

}