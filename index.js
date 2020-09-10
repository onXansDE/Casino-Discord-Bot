const Discord = require('discord.js');
const config = require('./config.json');
const prefix = config.prefix;
const token = config.token;
const fs = require('fs');
const dbusermanager = require('./bot/functions/fuc_dbusermanager');

var mysql = require('mysql');
var prettySeconds = require('pretty-seconds');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

var bankingconnection = mysql.createConnection(
    config.bankingdatabase
);
bankingconnection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected to bank as id ' + bankingconnection.threadId);
})

const commandFiles = fs.readdirSync('./bot/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./bot/commands/${file}`);
    client.commands.set(command.name, command);
}



client.once('ready', () => {
    console.log('Ready!');
    bankingconnection.query('CREATE TABLE IF NOT EXISTS users (user_id INT AUTO_INCREMENT PRIMARY KEY, user_name VARCHAR(255) NOT NULL,user_dcid VARCHAR(255) NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, credits BIGINT NOT NULL DEFAULT 0, user_moneyearned INT, user_moneyspend INT)');
    bankingconnection.query('CREATE TABLE IF NOT EXISTS users_steam (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, user_steamid VARCHAR(255) NOT NULL UNIQUE, verified INT NOT NULL DEFAULT 0)');
});


client.on('message', message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if(command.devOnly && message.author.id !== config.owner) {
        return message.reply('That command is limited to the bot owner');
    }

    if(command.disabled) return message.reply('That command is currently disabled!')

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if(command.dmOnly && message.channel.type !== 'dm') {
        message.reply('I can only execute that command inside DM`s');
        message.delete();
        message.author.send('Talk to me here about more private stuff')
        .catch(error => {
            message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
        });
        return;
    }

    if (command.args && !args.length) {
        return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        let reply = `You didn't provide any arguments, ${message.author}!`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);

    }


    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id) && message.author.id !== config.owner) {
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.channel.send(`please wait ${prettySeconds(timeLeft)} before reusing the \`${command.name}\` command.`).then(sentmessage => {
                    function deleteMessage() {
                        sentmessage.delete();
                        message.delete();
                    }
                    setTimeout(deleteMessage, 3000);
                })
            }
        }
    }



    try {
        command.execute(message, args);
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.on('guildMemberAdd', member => {
    if(!member.user.bot) {
        bankingconnection.query(`SELECT * FROM users WHERE user_dcid=${member.id}`, function (error, results, fields) {
            if (error) throw error;
            if (results.length === 0) {
                dbusermanager.saveuser(member);
            }
          });
    }
})

module.exports = {
    client
}


client.login(token);