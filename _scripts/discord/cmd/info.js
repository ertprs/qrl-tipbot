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

  ReplyMessage('QRL TipBot Info -\nTipbot for giving away QRL. Setup an account now with `+add` and start tipping.\n\nIf you would like to contribute and support the bot, donation addresses below, or simply tip the bot.\n Faucet Dontaion Address:\n' + config.faucet.faucet_wallet_pub + '\nTipbot Donation Address:\n' + config.bot_details.bot_donationAddress);

  },
};