module.exports = {
  name: 'bal',
  description: 'Get a wallet Balance',
  args: false,
  aliases: ['balance', 'funds'],
  guildOnly: false,
  cooldown: 0,
  usage: ' {QRL_ADDRESS}\nWill print the balance of any QRL Address given\nIf no address given check if the user has a qrltipBOt address and give that balance',
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
    // check for args and if found give that wallet balance
    if (args.length) {
      // Delete tthe prevoius message
      if(message.guild != null) {
        message.channel.stopTyping(true);
        message.delete();
      }
      // given a user not an address we just fail. Could serve up the users balance if config.bot.admin requested
      if (message.mentions.users.size > 0) {
        message.channel.stopTyping(true);
        return;
      }
      // wallet address given, look up the given address
      const givenAddress = args[0];
      const checkAddress = isQRLAddress(givenAddress);
      if(!checkAddress) {
        ReplyMessage('invalid! Must be a valid QRL address.');
        return;
      }
      else {
        const BalancePromise = Balance(givenAddress);
        // assign this to a promise and get the function into a result
        BalancePromise.then(function(balanceResult) {
          const results = balanceResult.balance;
          const res = results / 1000000000;
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setTitle('**Address Balance**')
            .setDescription('Details from the balance query.')
            .addField('QRL Address Balance:', `\`${res.toPrecision(9)}\``, true)
            .addField('QRL Address:', '[' + givenAddress + '](' + config.bot_details.explorer_url + '/a/' + givenAddress + ')')
            .setFooter(`TipBot Donation Address: ${config.bot_details.bot_donationAddress}`);
          message.author.send({ embed })
            .then(() => {
              if (message.channel.type === 'dm') return;
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
      const checkUser = dbHelper.CheckUser;
      const checkUserPromise = checkUser({ service: 'discord', user_id: userName });
      checkUserPromise.then(function(result) {
        const output = JSON.parse(JSON.stringify(result));
        const found = output.user_found;
        if (found !== 'true') {
          message.channel.stopTyping(true);
          ReplyMessage('Your not found in the System. Try `+add` or `+help`');
          return;
        }
        // check for the user_found value returned from the promise
        else {
          const user_id = result.user_id;
          const optOutCheck = dbHelper.CheckUserOptOut({ service: 'discord', user_id: result.user_id });
          optOutCheck.then(function(optout) {
            if (optout.opt_out == 'true') {
              ReplyMessage('You\'ve previously opted out of the tipbot. Please send `+opt-in` to opt back in!');
              message.channel.stopTyping(true);
            }
            else {
              const get_user_pub = dbHelper.GetUserWalletPub;
              const getPubPromise = get_user_pub({ user_id: user_id });
              getPubPromise.then(function(address) {
                const UserAddress = address.wallet_pub;
                // get the users balance from the network
                const UserBalance = Balance(UserAddress);
                UserBalance.then(function(balanceResult) {
                  const balint = balanceResult.balance;
                  const balInt = balint / 1000000000;
                  console.log('balint: ' + balint + '\nbalInt: ' + balInt)
                  return balInt;
                }).then(function(new_bal) {
                  console.log('new_bal: ' + new_bal);
                  console.log('new_bal.toPrecision(9): ' + new_bal.toPrecision(10));
                  const update_wal_bal = dbHelper.updateWalletBal;
                  update_wal_bal({ user_id: user_id, new_bal: new_bal }).then(function(UpdateBalance) {
                    message.channel.stopTyping(true);
                    const embed = new Discord.MessageEmbed()
                      .setColor(0x000000)
                      .setTitle('Tipbot Balance - ' + new_bal + ' QRL')
                      .addField('Balance:', `\`${new_bal} QRL\``, true)
                      .addField('Explorer:', '[explorer.theqrl.org](' + config.bot_details.explorer_url + '/a/' + UserAddress + ')', true)
                      .setFooter('Transactions may take a some time to post. Please be patient');
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
                    return UpdateBalance;
                  });
                  message.channel.stopTyping(true);
                });
              });
            }
          });
        }
      });
    }
  },
};