const config = require('../../../_config/config.json');

module.exports = {
  name: 'help',
  description: 'This message...',
  aliases: ['?!', 'commands', 'Help', ''],
  usage: '[command name]',
  cooldown: 1,
  execute(message, args) {
    const Discord = require('discord.js');
    const data = [];
    const messagedata = [];
    const { commands } = message.client;

    // ReplyMessage(' Check your DM\'s');
    function ReplyMessage(content) {
      message.channel.startTyping();
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 1000);
    }

    // errorMessage({ error: 'Can\'t access faucet from DM!', description: 'Please try again from the main chat, this function will only work there.' });
    function errorMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      message.channel.startTyping();
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor(0x000000)
          .setTitle(':warning:  ERROR: ' + content.error)
          .setDescription(content.description)
          .setFooter(footer);
        message.reply({ embed });
        message.channel.stopTyping(true);
      }, 1000);
    }

    if (!args.length) {
      messagedata.push('Here are all of my commands.\n*If you need more help try:* `+help {COMMAND}`\n```diff\n');
      messagedata.push(commands.map(command => config.discord.prefix + command.name + ' - ' + command.description).join('\n'));
      messagedata.push('```');
      return message.reply(messagedata);
    }
    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      errorMessage({ error: 'Not a valid command...', description: 'You have entered an invalid command for help'})
      // message.reply('that\'s not a valid command!');
      return;
    }

    data.push(`\n**Name:** ${command.name}`);

    if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
    if (command.description) data.push(`**Description:** ${command.description}`);
    if (command.usage) data.push(`**Usage:** ${config.discord.prefix}${command.name} ${command.usage}`);

    data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
    ReplyMessage(data, { split: true });
    // message.channel.send(data, { split: true });
  },
};