const mysql = require('mysql');
const config = require('../../config.json');
const animation = require('../values/val_horsestates.json');
const Discord = require('discord.js');
const creditmanager = require('../functions/fuc_creditmanager.js');
var Chance = require('chance');
var randomstring = require("randomstring");
const timestamp = require('time-stamp');

var bankingdb = mysql.createConnection(
    config.bankingdatabase
);


module.exports = {
    name: 'horserace',
    description: 'Try your luck by starting a horserace',
    cooldown: 20,
    guildOnly: true,
    async execute(message, args) {

        var seed = randomstring.generate();
        var chance = new Chance(seed);
        var id = message.author.id;
        var channel = message.channel;
        var playedtime = timestamp('YYYY/MM/DD:mm:ss')
        var betamount;
        var Horse;
        var STATUS;
        var win = false;

        if (args.length === 0) {
            betamount = 100;
            Horses = 'Select a horse';
        } else {
            betamount = parseInt(args[0])
            if (betamount === 0) {
                return;
            }
        }

        message.delete();

        bankingdb.query(`SELECT * FROM users WHERE user_dcid=${id}`, function (error, results, fields) {
            if (error) throw error;
            if (results.length === 1) {
                if (results[0].credits >= betamount) {
                    STATUS = 'Waiting for input';
                    creditmanager.remCredits(id, betamount);
                    const gameemebd = new Discord.MessageEmbed()
                        .setTitle('Horserace')
                        .setDescription(`1: 🏇========================================\n\n2: 🏇========================================\n\n3: 🏇========================================\n\n4: 🏇========================================\n\n5: 🏇========================================`)
                        .addField('User', `${message.author.tag}`)
                        .addField('Your Bet', `${betamount} Credits on horse ${Horses}`)
                        .addField('Status', `**${STATUS}**`)
                        .setFooter(`Seed: ${seed} | ${playedtime}`)
                        .setAuthor('Casino');
                    channel.send(gameemebd).then(sentMessage => {
                        sentMessage.react('1️⃣');
                        sentMessage.react('2️⃣');
                        sentMessage.react('3️⃣');
                        sentMessage.react('4️⃣');
                        sentMessage.react('5️⃣');
                        const filter = (reaction, user) => {
                            return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
                        };
                        sentMessage.awaitReactions(filter, {
                            max: 1,
                            time: 20000,
                            errors: ['time']
                        }).then(collected => {
                            const reaction = collected.first();

                            if (reaction.emoji.name === '1️⃣') {
                                Horses = 1;
                            } else if (reaction.emoji.name === '2️⃣') {
                                Horses = 2;

                            } else if (reaction.emoji.name === '3️⃣') {
                                Horses = 3;

                            } else if (reaction.emoji.name === '4️⃣') {
                                Horses = 4;

                            } else if (reaction.emoji.name === '5️⃣') {
                                Horses = 5;

                            }
                            console.log(Horses);
                            sentMessage.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                            STATUS = 'Starting...';
                            const gameemebd = new Discord.MessageEmbed()
                                .setTitle('Horserace')
                                .setDescription(`1: 🏇========================================\n\n2: 🏇========================================\n\n3: 🏇========================================\n\n4: 🏇========================================\n\n5: 🏇========================================`)
                                .addField('User', `${message.author.tag}`)
                                .addField('Your Bet', `${betamount} Credits on horse ${Horses}`)
                                .addField('Status', `**${STATUS}**`)
                                .setFooter(`Seed: ${seed} | ${playedtime}`)
                                .setAuthor('Casino');


                            sentMessage.edit(gameemebd);

                            var Horse = new Array(5).fill(0);
                            var winhorse;

                            function intervalFunc() {
                                STATUS = 'Running...';
                                const updateEmbed = new Discord.MessageEmbed()
                                    .setTitle('Horserace')
                                    .addField('User', `${message.author.tag}`)
                                    .addField('Your Bet', `${betamount} Credits on horse ${Horses}`)
                                    .addField('Status', `**${STATUS}**`)
                                    .setFooter(`Seed: ${seed} | ${playedtime}`)
                                    .setAuthor('Casino');
                                for (i = 0; i < 5; i++) {
                                    var currrand = chance.bool();
                                    if (currrand) {
                                        Horse[i]++;
                                        if (Horse[i] === 40) {
                                            winhorse = i + 1;
                                            if (Horses - 1 === i) {
                                                win = true;
                                            }
                                            endGame();
                                            return;
                                        }
                                    }
                                }

                                updateEmbed.setDescription(`1: ${animation[Horse[0]]}\n\n2: ${animation[Horse[1]]}\n\n3: ${animation[Horse[2]]}\n\n4: ${animation[Horse[3]]}\n\n5: ${animation[Horse[4]]}`)
                                sentMessage.edit(updateEmbed);
                            }

                            function endGame() {
                                clearInterval(interval);
                                const finalemed = new Discord.MessageEmbed()
                                    .setTitle('Horserace')
                                    .addField('User', `${message.author.tag}`)
                                    .addField('Your Bet', `${betamount} Credits on horse ${Horses}`)
                                    .setFooter(`Seed: ${seed} | ${playedtime}`)
                                    .setAuthor('Casino')
                                    .setDescription(`1: ${animation[Horse[0]]}\n\n2: ${animation[Horse[1]]}\n\n3: ${animation[Horse[2]]}\n\n4: ${animation[Horse[3]]}\n\n5: ${animation[Horse[4]]}`);

                                if (win) {
                                    STATUS = 'WON';
                                    finalemed.addField('Reward', `${betamount * 5}`)
                                    finalemed.setColor(2752256)
                                } else {
                                    STATUS = 'LOST';
                                    finalemed.addField('Lost', `${betamount} Credits`)
                                    finalemed.setColor(16711680)
                                }

                                finalemed.addField('Status', `**${STATUS}**`)

                                sentMessage.edit(finalemed).then(finalMessage => {

                                    finalMessage.react('✅');


                                    setTimeout(deleteMessage, 30000)

                                    function deleteMessage() {

                                        if (win) {
                                            creditmanager.addCredits(message.author, betamount * 5, 'Horserace', 'Game Results', `1: ${animation[Horse[0]]}\n\n2: ${animation[Horse[1]]}\n\n3: ${animation[Horse[2]]}\n\n4: ${animation[Horse[3]]}\n\n5: ${animation[Horse[4]]}\n\nBet: ${betamount} on horse ${Horses}\n\nWin Horse: ${winhorse}`, 'WON', 'Casino', `Seed: ${seed} | ${playedtime}`);
                                        } else {
                                            creditmanager.remRCredits(message.author, betamount, 'Horserace', 'Game Results', `1: ${animation[Horse[0]]}\n\n2: ${animation[Horse[1]]}\n\n3: ${animation[Horse[2]]}\n\n4: ${animation[Horse[3]]}\n\n5: ${animation[Horse[4]]}\n\nBet: ${betamount} on horse ${Horses}\n\nWin Horse: ${winhorse}`, 'LOST', 'Casino', `Seed: ${seed} | ${playedtime}`);
                                        }
                                        //TODO: SEND MESSAGE TO ALL REACTED USERS
                                        const userReactions = finalMessage.reactions.cache;
                                        for(const reaction of userReactions) {
                                            console.log();   
                                        }
                                        sentMessage.delete();


                                    }
                                })
                            }
                            const interval = setInterval(intervalFunc, 1000);
                        }).catch(() => {
                            const abortedembed = new Discord.MessageEmbed()
                                .setTitle('Action Aborted')
                                .setDescription('You didn´t send any input in the given time')
                                .setColor(16771840);
                            channel.send(abortedembed).them(sentAbort => {
                                function deleteAbort() {
                                    sentMessage.delete()
                                    sentAbort.delete()
                                }
                                setTimeout(deleteAbort, 5000)
                            })
                        })
                    })
                } else {
                    const embed = new Discord.MessageEmbed()
                    .setTitle('Not enough Credits')
                    .setDescription(`You are missing ${betamount - results[0].credits} Credits for this transaction`)
                    .setColor(16771840)
                }
            }
        });





    }

}