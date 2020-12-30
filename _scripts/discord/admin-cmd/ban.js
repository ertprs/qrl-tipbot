module.exports = {
  name: 'ban',
  description: 'Print your secret keys to a private message',
  args: false,
  aliases: ['kick' ],
  guildOnly: false,
  usage: '{*alias*: kick}\nCommand will send a DM with TipBot private keys to the user mentioned.',

  execute(message, args) {
  /*
    Take a user name and return the users private keys in DM to the user.
    if args are passed to un-ban then remove the ban in place
  */
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const wallet = require('../../qrl/walletTools');

    const secretKey = wallet.GetSecretKeys;

    // use to send a reply to user with delay and stop typing
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

    function deleteMessage() {
      // Delete the previous message
      if(message.guild != null) {
        message.channel.stopTyping(true);
        message.delete();
      }
    }
    // Get user info.
    async function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        const data = dbHelper.GetAllUserInfo(usrInfo);
        resolve(data);
      });
    }
    // send the ban to the users_info database
    async function banDBWrite(userArgs) {
      return new Promise(resolve => {
        // {user_id: user_id} - id from database not discord suer uuid
        // {user_id: 1}
        // console.log('transactionsDbWrite args:' + JSON.stringify(txArgs));
        const user = userArgs;
        const banInfo = { user_id: user };
        const banEntry = dbHelper.addBan(banInfo);
        resolve(banEntry);
      });
    }
    // remove the ban from the users_info database
    async function removeBanDBWrite(userArgs) {
      return new Promise(resolve => {
        // {user_id: user_id} - id from database not discord suer uuid
        // {user_id: 1}
        // console.log('transactionsDbWrite args:' + JSON.stringify(txArgs));
        const user = userArgs;
        const removeBanInfo = { user_id: user };
        const removeBanEntry = dbHelper.removeBan(removeBanInfo);
        resolve(removeBanEntry);
      });
    }

    async function main() {
      // get the users info
      console.log('args sent: ' + JSON.stringify(args));
      const user = message.mentions.users.first();
      console.log('user: ' + JSON.stringify(user));
      if (user === undefined) {
        return;
      }
      const name = user.username;
      const service_id = user.id;
      console.log('name: ' + name);
      console.log('service_id: ' + service_id);

      const userInfo = await getUserInfo({ service: 'discord', service_id: service_id });

      if (userInfo[0].user_found) {
        const walletPub = userInfo[0].wallet_pub;
        const userSecretKeyPromise = secretKey(walletPub);
        userSecretKeyPromise.then(function(userSecrets) {
          const keys = JSON.parse(userSecrets);
          console.log('keys: ' + JSON.stringify(keys));
          const embed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('**TipBot Secret Keys**')
            .setDescription('You can use these private keys to open your tipbot address in another wallet application. ')
            .addField('**__WARNING: Protect These Keys!__**', ' ***NEVER SHARE THESE KEYS WITH ANYONE FOR ANY REASON!!***')
            .addField('Hexseed: ', '||' + keys.hexseed + '||')
            .addField('Mnemonic: ', '||' + keys.mnemonic + '||')
            .addField('Use the QRL Web Wallet to withdraw funds from your Tipbot account with the secret details above', '__**[QRL Web Wallet Link](' + config.wallet.wallet_url + '/open)**__')
            .setFooter('.: Tipbot provided by The QRL Contributors :.');
          message.author.send({ embed })
            .then(() => {
              if (message.channel.type === 'dm') return;
              ReplyMessage('Details in your DM');
              deleteMessage();
            })
            .catch(error => {
            // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
              errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
              // ReplyMessage('it seems like I can\'t DM you! Enable DM and try again...');
              deleteMessage();
            });
          return;
        });
      }
      else {
        // fail on error
        console.log('userFound: ' + userInfo[0].userFound);
        errorMessage({ error: 'User Not Found...', description: 'The banned user is not in teh tipbot, no keys to send!' });
        const returnArray = [{ check: false }];
        return returnArray;
      }

    }
    main();

  },
};