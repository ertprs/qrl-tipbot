const config = require('../../../_config/config.json');

module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['?!', 'commands', 'Help', ''],
  usage: '[command name]',
  cooldown: 1,
  execute(message, args) {
    const data = [];
    const messagedata = [];
    const { commands } = message.client;

    if (!args.length) {
      messagedata.push('\n```diff\n');
      messagedata.push(commands.map(command => config.discord.prefix + command.name + ' - ' + command.description).join('\n'));
      messagedata.push('```');
      return message.reply(messagedata);
    }
    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      return message.reply('that\'s not a valid command!');
    }

    data.push(`\n**Name:** ${command.name}`);

    if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
    if (command.description) data.push(`**Description:** ${command.description}`);
    if (command.usage) data.push(`**Usage:** ${config.discord.prefix}${command.name} ${command.usage}`);

    data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

    message.channel.send(data, { split: true });
  },
};