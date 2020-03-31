#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"


'use strict';
const fs = require('fs');
const chalk = require('chalk');
const Discord = require('discord.js');

// check for config file where we expect it
fs.access('../../_config/config.json', error => {
  if (!error) {
    // The check succeeded
    // console.log('Config Found!');
  }
  else {
  // The check failed
    // console.log('Config NOT Found!');
    return;
  }
});

// Require the config file. Create it from the example
const config = require('../../_config/config.json');

global.config = config;

const client = new Discord.Client();

// tells where to find the command config files
client.commands = new Discord.Collection();
// Read in the commands we listen for. FInd these in the ./cmd/ dir below this file
const commandFiles = fs.readdirSync(`${config.discord.cmd_dir}`).filter(file => file.endsWith('.js'));
// for each file, assign values and command name
for (const file of commandFiles) {
  // this looks in the config file for the discord.cmd_dir setting
  const command = require(`${config.discord.cmd_dir}/${file}`);
  client.commands.set(command.name, command);
}
// define cooldowns const
const cooldowns = new Discord.Collection();
// start the bot
const now = new Date();
const nownow = now.toDateString();
client.on('ready', () => {
  //console.log('client.users ' + JSON.stringify(client.users.cache));
  //console.log('client.cache ' + JSON.stringify(client.channels.cache));
  //console.log('client.guild ' + JSON.stringify(client.guilds.cache));
  console.log(chalk`
{cyan ==========================================}
{cyan Discord TipBot Started at: {grey {dim ${nownow}}}}
  {blue {cyan {bold !}} Connected to {grey ${client.guilds.cache.size}} guilds }
  {blue {cyan {bold !}} Connected to {grey ${client.users.cache.size}} users } 
  {blue {cyan {bold !}} Connected to {grey ${client.channels.cache.size}} channels }
{cyan ==========================================}
    `);
  client.user.setActivity('Tipping $$ QRL $$');
});


// attempt to open the prefix
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


// check for messages and if received with the prefix, do stuff
client.on('message', message => {

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(config.discord.prefix)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);


  // check that the message starts with our prefix called out in the config file
  //if (!message.content.startsWith(config.discord.prefix) || message.author.bot) return;
  //const args = message.content.slice(config.discord.prefix.length).split(/ +/);

  const commandName = args.shift().toLowerCase();
  // log everthing with ${config.discord.prefix} to console
  console.log(message.content);
  //  if (!client.commands.has(commandName)) return;
  //    const command = client.commands.get(commandName);
  const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('I can\'t execute that command inside DMs!');
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments ${message.author}!`;
    // help if not used properly
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${config.discord.prefix}${command.name} ${command.usage}\``;
    }
    // send the reply from above
    return message.channel.send(reply);
  }
  // cooldown period
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

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

  try {
    // iterate through ${command} found in ./cmd/ dir
    command.execute(message, args);
  }
  catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }

});

client.login(config.discord.token);

