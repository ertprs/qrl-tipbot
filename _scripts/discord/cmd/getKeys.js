module.exports = {
  name: 'getKeys',
  description: 'Print your QRL TipBot private keys to a DM',
  args: false,
  aliases: ['privatekeys', 'keys', 'key', 'secret', 'mnemonic', 'hexseed' ],
  guildOnly: false,
  usage: '{*alias*: privatekeys || keys || key || secret || mnemonic || hexseed}\nCommand will send a DM with TipBot Address private keys. Don\'t share these keys! You must allow Direct Messages from the Tipbot',

  execute(message) {
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const wallet = require('../../qrl/walletTools');
    const secretKey = wallet.GetSecretKeys;
    const username = `${message.author}`;
    const userName = username.slice(1, -1);
    const user_info = { service: 'discord', service_id: userName };
    const GetUserInfoPromise = dbHelper.GetAllUserInfo(user_info);

    function ReplyMessage(content) {
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 1000);
    }

    function deleteMessage() {
      // Delete the previous message
      if(message.guild != null) {
        message.channel.stopTyping(true);
        message.delete();
      }
    }

    GetUserInfoPromise.then(function(userInfo) {
      // set variables from db search
      const found = userInfo[0].user_found;
      const optOut = userInfo[0].opt_out;
      const agree = userInfo[0].user_agree;
      // is user found?
      if (!found) {
        ReplyMessage('Your not found in the System. Try `+add` or `+help`');
        deleteMessage();
        return;
      }
      // check for opt_out status
      if (optOut) {
        ReplyMessage('You have opted out of the tipbot. Please send `+opt-in` to opt back in!');
        deleteMessage();
        return;
      }
      // Check user_agree
      if (!agree) {
        ReplyMessage('You need to agree, please see the `+terms`');
        deleteMessage();
        return;
      }
      else {
        // user passed. Continue with script
        const walletPub = userInfo[0].wallet_pub;
        const userSecretKeyPromise = secretKey(walletPub);
        userSecretKeyPromise.then(function(userSecrets) {
          const keys = JSON.parse(userSecrets);
          // console.log('keys: ' + JSON.stringify(keys));
          const embed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('**TipBot Secret Keys**')
            // .setDescription('')
            .addField('**__WARNING: Protect These Keys!__**', ' ***NEVER SHARE THESE KEYS WITH ANYONE FOR ANY REASON!!***')
            .addField('Hexseed: ', '||' + keys.hexseed + '||')
            .addField('Mnemonic: ', '||' + keys.mnemonic + '||')
            .addField('Use the QRL Web Wallet to withdraw funds from your Tipbot account with the secret details above', '__**[QRL Web Wallet Link](' + config.wallet.wallet_url + '/open)**__')
            .setFooter('.: The QRL TipBot - https://QRL.tips :.');
          message.author.send({ embed })
          .then(() => {
            if (message.channel.type === 'dm') return;
            ReplyMessage('Details in your DM');
            deleteMessage();
          })
          .catch(error => {
            console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
            ReplyMessage('it seems like I can\'t DM you! Enable DM and try again...');
            deleteMessage();
          });
          return;
        });
      }
    });
  },
};