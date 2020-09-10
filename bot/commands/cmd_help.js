
const { MessageEmbed } = require('discord.js');

const {
    prefix
} = require('../../config.json');

module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    cooldown: 5,
    execute(message, args) {
        const {
            commands
        } = message.client;

        

        if (!args.length) {
            const embed = new MessageEmbed();
            embed.setTitle('Help and Infos')
            embed.addField('**Commands**', commands.map(command => command.name).join('\n'), true);
            embed.addField('**Info**', `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`, true);
            embed.setColor(16748827)

            return message.author.send(embed)
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I\'ve sent you a DM with all my commands!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        const embed = new MessageEmbed();
        embed.setTitle(`Command Details`);
        embed.setDescription(`**${prefix}${command.name}**`)
        if (command.aliases) embed.addField('**Aliases:**', command.aliases.join(', '));
        if (command.description) embed.addField('**Description:**', command.description);
        if (command.usage) embed.addField('**Usage**', `${prefix}${command.name} ${command.usage}`);
        embed.addField('**Cooldown**', command.cooldown || 3 + ' second(s)')
        embed.setColor(16748827)

        message.channel.send(embed);


    },
};