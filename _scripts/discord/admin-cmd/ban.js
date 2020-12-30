module.exports = {
  name: 'ban',
  description: 'Print your secret keys to a private message',
  args: false,
  aliases: ['kick' ],
  guildOnly: false,
  usage: '{*alias*: kick}\nCommand will send a DM with TipBot private keys to the user mentioned.',

  execute(message) {
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

    function toQuanta(number) {
      const shor = 1000000000;
      return number / shor;
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
      // console.log('args sent: ' + JSON.stringify(args));
      const user = message.mentions.users.first();
      // console.log('user: ' + JSON.stringify(user));
      if (user === undefined) {
        errorMessage({ error: 'No user mentioned', description: 'You must mention one user...' });
        return;
      }

      const name = user.username;
      const service_id = '@' + user.id;
      console.log('name: ' + name);
      console.log('service_id: ' + service_id);

      const userInfo = await getUserInfo({ service: 'discord', service_id: service_id });

      if (userInfo[0].user_found) {
        const wallet_bal = userInfo[0].wallet_bal;
        console.log('wallet_bal: ' + wallet_bal);
        // check wallet balance and if flat, ban and quit
        if (wallet_bal === 0) {
          console.log('wallet is empty, no need to send keys...');
          // write to the database that the user is banned

          ReplyMessage('user has no funds in tipbot, yeet away...');
          return;
        }
        const walletPub = userInfo[0].wallet_pub;
        const userSecretKeyPromise = secretKey(walletPub);
        userSecretKeyPromise.then(function(userSecrets) {
          const keys = JSON.parse(userSecrets);
          // console.log('keys: ' + JSON.stringify(keys));
          const embed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('**TipBot Secret Keys**')
            .setDescription('You have been banned from the server. Because of this you cannot use this tipbot service.\n\n \
                Below are the private keys to the tipbot account you held, with a positive balance of `' + toQuanta(wallet_bal) + ' QRL`.\n \
                Please use the [QRL Web Wallet](' + config.wallet.wallet_url + ') to withdraw these funds into an address you own. \
                After one week the funds may be re-claimed by the service and forfeited by the user. \n\n \
                :exclamation: **There is NO support offered**\n \
                :exclamation: **ANY FUNDS LEFT IN THE ADDRESS ARE SUBJECT TO LOSS**\n \
                :exclamation: **This is the last message you will receive from the tipbot** :exclamation: ')
            .addField('**__WARNING: Protect These Keys!__**', ' ***NEVER SHARE THESE KEYS WITH ANYONE FOR ANY REASON!!***')
            .addField('Public Address: ', '`' + walletPub + '`')
            .addField('Hexseed: ', '||' + keys.hexseed + '||')
            .addField('Mnemonic: ', '||' + keys.mnemonic + '||')
            .addField('Use the QRL Web Wallet to withdraw funds from your Tipbot account with the secret details above', '__**[QRL Web Wallet Link](' + config.wallet.wallet_url + '/open)**__')
            .setFooter('.: Tipbot provided by The QRL Contributors :.');
          user.send({ embed })
            .then(() => {
              if (message.channel.type === 'dm') return;
              ReplyMessage('Users keys sent');
            })
            .catch(error => {
            // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
              errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
              // ReplyMessage('it seems like I can\'t DM you! Enable DM and try again...');
            });
          return;
        });
      }
      else {
        // fail on error
        console.log('userFound: ' + userInfo[0].userFound);
        errorMessage({ error: 'User Not Found...', description: 'The banned user is not in the tipbot, no keys to send!' });
        const returnArray = [{ check: false }];
        return returnArray;
      }

    }
    main();

  },
};