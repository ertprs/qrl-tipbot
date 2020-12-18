module.exports = {
  name: 'balance',
  description: 'Get a QRL wallet balance',
  args: false,
  aliases: ['?$', 'Bal', 'BAL', 'Balance', 'bal', 'funds'],
  guildOnly: false,
  cooldown: 0,
  usage: ' or \n+balance {QRL_ADDRESS}',
  execute(message, args) {
    const Discord = require('discord.js');
    const walletTools = require('../../qrl/walletTools');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const emojiCharacters = require('../../emojiCharacters');
    const Balance = walletTools.GetBalance;
    const username = `${message.author}`;
    const userName = username.slice(1, -1);


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
        message.delete();
      }
    }
    // check for args and if found give that wallet balance
    if (args.length) {
      // given a user not an address we just fail.
      // FEATURE ADD -
      // Could serve up the users balance if config.bot.admin requested
      if (message.mentions.users.size > 0) {
        errorMessage({ error: 'Invalid entry given...', description: 'Enter an address to query, or simply `+bal` to get your balance.' });
        // ReplyMessage('Invalid entry given...\nEnter an address to query, or simply `+bal` to get your balance.');
        deleteMessage();
        return;
      }
      // wallet address given, look up the given address
      const givenAddress = args[0];
      const checkAddress = isQRLAddress(givenAddress);
      if(!checkAddress) {
        errorMessage({ error: 'Invalid entry given...', description: 'Enter an address to query, or simply `+bal` to get your balance.' });
        // ReplyMessage('invalid! Must be a valid QRL address.');
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
            .setFooter('  .: Tipbot provided by The QRL Contributors :.');
          message.author.send({ embed })
            .then(() => {
              if (message.channel.type === 'dm') return;
              deleteMessage();
              message.channel.stopTyping(true);
              ReplyMessage('\n:moneybag: Balance is in your DM :moneybag:');
            })
            .catch(error => {
              // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
              errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
              // ReplyMessage('it seems like I can\'t DM you! Do you have DMs disabled?');
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
        // console.log('output: ' + JSON.stringify(output));

        const found = output[0].user_found;
        if (!found) {
          errorMessage({ error: 'User Not Found...', description: 'You\'re not found in the System. Try `+add` or `+help`' });
          // ReplyMessage('Your not found in the System. Try `+add` or `+help`');
          return;
        }
        const opt_out = output[0].opt_out;
        if (opt_out) {
          message.channel.stopTyping(true);
          errorMessage({ error: 'User Opted Out...', description: 'You\'ve previously opted out of the tipbot. Please send `+opt-in` to opt back in!' });
          // ReplyMessage('You\'ve previously opted out of the tipbot. Please send `+opt-in` to opt back in!');
          return;
        }
        const user_agree = result[0].user_agree;
        if (!user_agree) {
          message.channel.stopTyping(true);
          errorMessage({ error: 'User Has Not Agreed...', description: 'You must agree to the tipbot terms, type `+terms` to read them and then `+agree`' });
          // ReplyMessage('You must agree to the tipbot terms, type `+terms` to read them and then `+agree`');
          return;
        }
        const UserAddress = result[0].wallet_pub;
        const BalancePromise = Balance(UserAddress);
        // assign this to a promise and get the function into a result
        BalancePromise.then(function(balanceResult) {
          const UserBalance = balanceResult.balance;
          // console.log(UserBalance);
          const res = ((UserBalance / 1000000000).toFixed(9));
          message.channel.stopTyping(true);
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setTitle('Tipbot Balance - ' + res + ' QRL \n*Transactions may take a some time to post. Please be patient*')
            .addField('Balance:', `\`${res} QRL\``, true)
            .addField('QRL Address:', '[' + UserAddress + '](' + config.bot_details.explorer_url + '/a/' + UserAddress + ')')
            // .addField('Transactions may take a some time to post. Please be patient')
            .setFooter('  .: Tipbot provided by The QRL Contributors :.');
          message.author.send({ embed })
            .then(() => {
              if (message.channel.type === 'dm') return;
              message.channel.stopTyping(true);
              // ReplyMessage('\n:moneybag: Balance is in your DM :moneybag:');
            })
            .catch(error => {
              errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
              // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
              // ReplyMessage('it seems like I can\'t DM you! Do you have DMs disabled?');
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