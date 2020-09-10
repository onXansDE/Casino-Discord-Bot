const creditmanager = require('../functions/fuc_creditmanager.js');
const Discord = require('discord.js');

module.exports = {
    name: 'removecredits',
    description: '[Dev Only] Remove credits from user',
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
            .setDescription(`Please tell me how many credits i should remove from ${touser.tag}`)
            .setColor(16750848)
            channel.send(prompt).then(() => {
                const filter = m => id === m.author.id;
                channel.awaitMessages(filter, {
                    time: 20000,
                    max: 1,
                    errors: ['time']
                }).then(messages => {
                    var amount = parseInt(messages.first().content);
                    if(amount != 0) {
                        creditmanager.remCredits(touser.id, amount);
                        const doneembed = new Discord.MessageEmbed()
                        .setTitle('Credits removed')
                        .setDescription(`${amount} credits where removed from ${touser.tag}`)
                        .setColor(1376000);
                        channel.send(doneembed);
                        return;
                    }
                    const notembed = new Discord.MessageEmbed()
                        .setTitle('No credits removed')
                        .setDescription(`Value must be greater than 0`)
                        .setColor(16711680);
                        channel.send(notembed);
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

            if(amount != 0) {
                creditmanager.remCredits(touser.id, amount);
                const doneembed = new Discord.MessageEmbed()
                .setTitle('Credits removed')
                .setDescription(`${amount} credits where removed from ${touser.tag}`)
                .setColor(1376000);
                channel.send(doneembed);
                return;
            }

        }
    }
}