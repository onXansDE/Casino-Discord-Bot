const creditmanager = require('../functions/fuc_creditmanager.js');
const Discord = require('discord.js');

module.exports = {
    name: 'setcredits',
    description: '[Dev Only] Set User Credits',
    devOnly: true,
    execute(message, args) {
        var id = message.author.id;
        var channel = message.channel;

        if(args.length === 0) {
            const embed = new Discord.MessageEmbed()
            .setTitle('No User Targeted')
            .setDescription('You need to Mention a target')
            .setColor(16711680)
            channel.send(embed);
            return;
        }

        if(args.length === 1) {

            var touser = message.mentions.users.first();

            const prompt = new Discord.MessageEmbed()
            .setTitle('Enter Amount')
            .setDescription(`Please tell me how many credits i should ${touser.tag} have`)
            .setColor(16750848)
            channel.send(prompt).then(() => {
                const filter = m => id === m.author.id;
                channel.awaitMessages(filter, {
                    time: 20000,
                    max: 1,
                    errors: ['time']
                }).then(messages => {
                    var amount = parseInt(messages.first().content);
                        creditmanager.setCredits(touser.id, amount);
                        const doneembed = new Discord.MessageEmbed()
                        .setTitle('Credits changed')
                        .setDescription(`${touser.tag}\`s balance is now ${amount}`)
                        .setColor(1376000);
                        channel.send(doneembed);
                        return;
                })
                .catch(() => {
                    const abortedembed = new Discord.MessageEmbed()
                        .setTitle('Action Aborted')
                        .setDescription('You didn´t send any input in the given time Nothing has changed')
                        .setColor(16771840);
                    channel.send(abortedembed);
                })
            })
        }

        if(args.length === 2) {
            
            var touser = message.mentions.users.first();
            var amount = parseInt(args[1]);
                creditmanager.setCredits(touser.id, amount);
                const doneembed = new Discord.MessageEmbed()
                .setTitle('Credits changed')
                .setDescription(`${touser.tag}\`s balance is now ${amount}`)
                .setColor(1376000);
                channel.send(doneembed);
                return;
        }
    }
}