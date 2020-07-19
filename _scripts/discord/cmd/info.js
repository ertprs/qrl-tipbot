const config = require('../../../_config/config.json');


//  const { prefix } = require('../../../config.json');

module.exports = {
  name: 'info',
  description: 'Information about this bot.',
  aliases: ['commands'],
  usage: '[command name]',
  cooldown: 1,
  execute(message) {
  function ReplyMessage(content) {
    setTimeout(function() {
      message.reply(content);
      message.channel.stopTyping(true);
    }, 1000);
  }

  ReplyMessage('TipBot Info -\nIf you would like to support the bot, use the donation addresses below, or simply tip the bot.\n **Faucet Dontaion Address:** `' + config.faucet.faucet_wallet_pub + '`\n**Tipbot Donation Address:** `' + config.bot_details.bot_donationAddress + '`');

  },
};