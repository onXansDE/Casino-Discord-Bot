module.exports = {
    name: 'reload',
    description: 'Reloads a command (Command is limited to the bot developers)',
    execute(message, args) {

        if(message.author.id != 354653619393527808) return message.reply(`This command is limited to the bot developers`);

        if (!args.length) return message.channel.send(`You didn't pass any command to reload, ${message.author}!`);
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName) ||
            message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        delete require.cache[require.resolve(`./cmd_${command.name}.js`)];

        if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

        try {
            const newCommand = require(`./cmd_${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            message.channel.send(`Command \`${command.name}\` was reloaded!`);
        } catch (error) {
            console.log(error);
            message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
        }
    },
};