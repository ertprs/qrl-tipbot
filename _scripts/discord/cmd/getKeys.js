module.exports = {
  name: 'getKeys',
  description: 'Print your QRL TipBot private keys',
  args: false,
  aliases: ['privatekeys', 'keys', 'secret', 'mnemonic', 'hexseed' ],
  guildOnly: false,
  usage: ' \n## Command will send a DM with TipBot Address private keys.',

  execute(message) {
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');


    const chalk = require('chalk');
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
      //console.log(JSON.stringify(userInfo))
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
            const keys = JSON.stringify(JSON.parse(userSecrets))
            console.log(keys)
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .setTitle('**TipBot Secret Info**')
              .setDescription('Protect these keys, they give anyone access to all of your funds!')
              .addField('Use the QRL Wallet to withdraw funds:', '[QRL Web Wallet](' + config.wallet.wallet_url + ')')
              // figure out how to attach the qr image here...
              .addField('For all of my commands:\t', '`+help`');
            message.author.send({ embed })
            message.author.send(`User Private Keys: ${keys}`);
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