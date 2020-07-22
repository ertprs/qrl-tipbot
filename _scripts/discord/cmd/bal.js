module.exports = {
  name: 'bal',
  description: 'Get a wallet Balance',
  args: false,
  aliases: ['balance', 'funds'],
  guildOnly: false,
  cooldown: 0,
  usage: ' {QRL_ADDRESS}\nWill print the balance of any QRL Address given\nIf no address given check if the user has a qrltipBot address and give that balance',
  execute(message, args) {
    const Discord = require('discord.js');
    const walletTools = require('../../qrl/walletTools');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const emojiCharacters = require('../../emojiCharacters');
    const Balance = walletTools.GetBalance;
    const username = `${message.author}`;
    const userName = username.slice(1, -1);

    function ReplyMessage(content) {
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 1000);
    }
    // test the address to the regex pattern
    function isQRLAddress(addy) {
      let test = false;
      if(/^(Q|q)[0-9a-fA-f]{78}$/.test(addy)) {
        test = true;
      }
      return test;
    }

    function deleteMessage() {
      // Delete the previous message
      if(message.guild != null) {
        message.channel.stopTyping(true);
        message.delete();
      }
    }
    // check for args and if found give that wallet balance
    if (args.length) {
      // given a user not an address we just fail.
      // FEATURE ADD -
      // Could serve up the users balance if config.bot.admin requested
      if (message.mentions.users.size > 0) {
        ReplyMessage('Invalid entry given...\nEnter an address to query, or simply `+bal` to get your balance.');
        deleteMessage();
        message.channel.stopTyping(true);
        return;
      }
      // wallet address given, look up the given address
      const givenAddress = args[0];
      const checkAddress = isQRLAddress(givenAddress);
      if(!checkAddress) {
        ReplyMessage('invalid! Must be a valid QRL address.');
        deleteMessage();
        return;
      }
      else {
        const BalancePromise = Balance(givenAddress);
        // assign this to a promise and get the function into a result
        BalancePromise.then(function(balanceResult) {
          const results = balanceResult.balance;
          const res = ((results / 1000000000).toFixed(9));
          // console.log('res: ' + res + '\nresults: ' + results);
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setTitle('**Address Balance**')
            .setDescription('Details from the balance query.')
            .addField('QRL Address Balance:', `\`${res}\``, true)
            .addField('QRL Address:', '[' + givenAddress + '](' + config.bot_details.explorer_url + '/a/' + givenAddress + ')')
            .setFooter(`TipBot Donation Address: ${config.bot_details.bot_donationAddress}`);
          message.author.send({ embed })
            .then(() => {
              if (message.channel.type === 'dm') return;
              deleteMessage();
              message.channel.stopTyping(true);
              ReplyMessage('\n:moneybag: Balance is in your DM :moneybag:');
            })
            .catch(error => {
              console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
              message.channel.stopTyping(true);
              ReplyMessage('it seems like I can\'t DM you! Do you have DMs disabled?');
              return;
            });
          message.channel.stopTyping(true);
        });
      }
    }
    else {
      // check for user in database
      const checkUser = dbHelper.GetAllUserInfo;
      const checkUserPromise = checkUser({ service: 'discord', service_id: userName });
      checkUserPromise.then(function(result) {
        const output = JSON.parse(JSON.stringify(result));
        // console.log(result);
        const found = output[0].user_found;
        if (found !== 'true') {
          message.channel.stopTyping(true);
          ReplyMessage('Your not found in the System. Try `+add` or `+help`');
          return;
        }
        const opt_out = output[0].opt_out;
        if (opt_out == 'true') {
          message.channel.stopTyping(true);
          ReplyMessage('You\'ve previously opted out of the tipbot. Please send `+opt-in` to opt back in!');
          return;
        }
        const user_agree = result[0].user_agree;
        if (user_agree !== 'true') {
          message.channel.stopTyping(true);
          ReplyMessage('You must agree to the tipbot terms, type `+terms` to read them and then `+agree`');
          return;
        }
        const UserAddress = result[0].wallet_pub;
        const BalancePromise = Balance(UserAddress);
        // assign this to a promise and get the function into a result
        BalancePromise.then(function(balanceResult) {
          const UserBalance = balanceResult.balance;
          console.log(UserBalance);
          const res = ((UserBalance / 1000000000).toFixed(9));
          message.channel.stopTyping(true);
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setTitle('Tipbot Balance - ' + res + ' QRL')
            .addField('Balance:', `\`${res} QRL\``, true)
            .addField('Explorer:', '[explorer.theqrl.org](' + config.bot_details.explorer_url + '/a/' + UserAddress + ')', true)
            .setFooter('Transactions may take a some time to post. Please be patient\nTip the bot! `+tip 1 @' + config.bot_details.bot_name + '`');
          message.author.send({ embed })
            .then(() => {
              if (message.channel.type === 'dm') return;
              message.channel.stopTyping(true);
              // ReplyMessage('\n:moneybag: Balance is in your DM :moneybag:');
            })
              .catch(error => {
                console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                message.channel.stopTyping(true);
                ReplyMessage('it seems like I can\'t DM you! Do you have DMs disabled?');
              });
                message.react(emojiCharacters.q)
                  .then(() => message.react(emojiCharacters.r))
                  .then(() => message.react(emojiCharacters.l))
                  .catch(() => console.error('One of the emojis failed to react.'));
                message.channel.stopTyping(true);
          });
      });
    }
  },
};