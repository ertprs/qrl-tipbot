'use strict';

const fs = require('fs');
// require discord.js
const Discord = require('discord.js');
// Require the config file. Create it from the example
const config = require('../../_config/config.json');
const client = new Discord.Client();
// tells where to find the config files
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(`${config.bot_details.bot_dir}/Social/Discord/cmd`).filter(file => file.endsWith('.js'));
// for each file, assign values and command name
for (const file of commandFiles) {
  const command = require(`${config.bot_details.bot_dir}/Social/Discord/cmd/${file}`);
  client.commands.set(command.name, command);
}

const { Discord, Users } = require('./dbObjects');

// define cooldowns const
const cooldowns = new Discord.Collection();
// define mainUsers const
const mainUsers = new Discord.Collection();

// start the bot
client.on('ready', () => {
  console.log(`Discord Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity('Tipping $$ QRL $$');
});

// check for messages and if recieved with the prefix, do stuff
client.on('message', message => {
  // check for the prefix defined in the config file and if the author is a bot
  if (!message.content.startsWith(config.discord.prefix) || message.author.bot) return;
  
  mainUsers.add(message.author.id, 1);
  // process the message
  const args = message.content.slice(config.discord.prefix.length).split(/ +/);
  // shift everything to lower case to match commandName
  const commandName = args.shift().toLowerCase();
  // log everthing with ${config.discord.prefix} if needed
  console.log(message.content);
  //  if (!client.commands.has(commandName)) return;
  //    const command = client.commands.get(commandName);
  // check the command given to the commandNames and aliases
  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  // if not found return
  if (!command) return;
  // check that the user is not calling something in DM that they shouldn't
  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('I can\'t execute that command inside DMs!');
  }
  // check for the variable set in the cmd file for args length. if not fail with error
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    // help if not used properly with instructions
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${config.discord.prefix}${command.name} ${command.usage}\``;
    }
    // send the reply from above to the channel sent from
    return message.channel.send(reply);
  }
  // cooldown period check,
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }
  // check the user has not exceeded the cooldown period
  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  // execute the cmd found in the file defined
  try {
    // iterate through ${command} found in ./cmd/ dir
    command.execute(message, args);
  }
  // if error, catch and fail with message
  catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});
// login to the discord client with token found in the config file
client.login(config.discord.token);

