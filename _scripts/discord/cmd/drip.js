module.exports = {
  name: 'drip',
  description: 'Collect some free qrl from the faucet, if there is any to have. Once a day at most please.',
  args: false,
  aliases: ['faucet', 'freeqrl', 'free', 'drop'],
  guildOnly: false,
  usage: ' ',
  // cooldown: 86399,

  execute(message, args) {
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const faucetHelper = require('../../faucet/faucetDB_Helper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    const uuid = `${message.author}`;
    const service_id = uuid.slice(1, -1);
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const checkFaucetPayouts = faucetHelper.checkPayments;
    const getBalance = wallet.GetBalance
    const faucetDrip = faucetHelper.Drip;
    const userInfoArray = [];
    const faucetInfoArray = [];
    // const checkAgree = dbHelper.CheckAgree;
    // const info = JSON.parse(JSON.stringify({ service: 'discord', service_id: UUID }));
    // const found = GetAllUserInfo(info);

    // check for a balance in the faucet wallet first 
    const faucetBalance = function() {
      // using the faucet address check for a balance
      const walletAddress = config.faucet.faucet_wallet_pub;
      getBalance(walletAddress).then(function(balance) {
        // console.log('balance: ' + JSON.stringify(balance));
        return balance;
      })
    }

    console.log('faucetBalance: ' + faucetBalance);


    function dripAmount(min, max) {
      const minAmt = min * 1000000000;
      const maxAmt = max * 1000000000;
      // console.log('min: ' + minAmt + ' max: ' + maxAmt);
      const randomNumber = Math.floor(
        Math.random() * (maxAmt - minAmt) + minAmt
        );
      const num = randomNumber / 1000000000;
      // console.log('Random number ' + num);
      return num;
      // generate a randm number from a range set in the config file.

    }

    async function checkUser(user) {
      return new Promise(resolve => {
        const check_info = { service: 'discord', service_id: user };
        const checkPromise = GetAllUserInfo(check_info);
        // fail from the start
        let checkUserPassed = false;
        checkPromise.then(function(results) {
          // console.log('results: ' + JSON.stringify(results));
          userInfoArray.push(results);
          const user_found = results[0].user_found;
          const opt_out = results[0].opt_out;
          const agree = results[0].user_agree;
          // check if user found
          if (user_found == 'true') {
            // console.log('user found: ' + user_found);

          }
          else{
            // user not found
            // console.log('user is not found');
            userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'not_found' });
            // message.reply('Are you signed up?');
            message.channel.stopTyping(true);
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .setTitle('ERROR: You\'re not signed up...')
              .setDescription('`+add` to sign-up, `+agree` to start using the faucet');
            message.reply({ embed });

            return;
          }
          // check if agreed
          if (agree == 'true') {
            // console.log('user has agreed ' + agree);
            // set checkUserPassed to true and return
            let checkUserPassed = true;
            userInfoArray.push({ checkUserPassed: true });
            // return userInfoArray;
         }
         else {
           // not agreed to terms
           // console.log('need to agree to terms');
           userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'not_agreed' });
           // message.reply('You will need to agree to my `+terms` to use the bot. `+agree`');
           message.channel.stopTyping(true);
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .setTitle('ERROR: You must agree to the terms')
              .setDescription('`+terms` to read the terms and conditions, `+agree` to start using the faucet');
            message.reply({ embed });
           return;
         }
          // check if opt out
          if (opt_out == '0') {
          // console.log('user is not opted out:  ' + opt_out);
          }
          else{
           // user has opted out
           // console.log('User Opted out');
           userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'opted_out' });
           message.reply('I see you have opted out. Please `+opt-in` to recieve faucet funds');
           return;
          }
         resolve(userInfoArray);
         return;
        });
      });
    }

    async function checkFaucet(user_id) {
      return new Promise(resolve => {
        const check_info = { service: 'discord', service_id: user_id };
        const checkFaucetPromise = checkFaucetPayouts(check_info);
        // fail from the start
        let checkUserPassed = false;
        checkFaucetPromise.then(function(results) {
          // console.log('checkFaucetPromise results ' + JSON.stringify(results));
          // faucetInfoArray.push(results);
          resolve(results);
        });
      });
    }

    async function drip(DripArgs) {
      return new Promise(resolve => {
        const drip_info = DripArgs;
        faucetDrip(drip_info).then(function(dripReturn) {
          // console.log(JSON.stringify(dripReturn));
          resolve(dripReturn);
        });
      });
    }

    checkUser(service_id).then(function(checkresults) {
      // console.log('UserChecks ' + JSON.stringify(checkresults));
      // console.log('userInfoArray ' + JSON.stringify(userInfoArray));
      if (!userInfoArray[1].checkUserPassed) {
      	// if the userCheck failed
        const userCheckError = userInfoArray[1].checkUserPassedError;
        // console.log('the user check failed with error:' + userCheckError);
        switch (userCheckError) {
          case 'not_found':
          // console.log('user is not found, error given.' + userCheckError);
          message.reply('Sorry, looks like there is an error. error is `User ' + userCheckError + '`');
          break;
        case 'opted_out':
          // console.log('user is opt_out, error given.' + userCheckError);
          message.reply('Sorry, looks like there is an error. error is `User ' + userCheckError + '`');
          break;
        case 'not_agreed':
          // console.log('user is not agreed to terma, error given.' + userCheckError);
          message.reply('Sorry, looks like there is an error. error is `User ' + userCheckError + '`');
          break;
        default:
          // console.log('Default called in error block. SOmething is wrong');
        }
      }
      checkFaucet(service_id).then(function(faucetCheck) {
        // console.log('faucetCheck results' + JSON.stringify(faucetCheck));
        if (faucetCheck[0].drip_found == true) {
          // console.log('user has been found recently, no drips');
          message.reply('You have pulled from the faucet recently :no_entry_sign: \nPlease come back in  ***' + config.faucet.payout_interval + ' minutes*** from ***' + faucetCheck[1][0].time_stamp + '*** to request more funds.');
          return;
        }
        else if (faucetCheck[0].drip_found == false) {
          // no drip found. Do things here.
          // insert into faucet_payments to request a payment
          const user_id = userInfoArray[0][0].user_id;
          const Drip = dripAmount(config.faucet.min_payout, config.faucet.max_payout);
          // console.log('no drips found. Adding to db and sending a drip');
          const dripInfo = { user_id: user_id, service: 'discord', drip_amt: Drip };
          drip(dripInfo).then(function(ResDrip) {
            //console.log('all done, dripped and returned values\n' + JSON.stringify(ResDrip));
          });
          message.channel.stopTyping(true);
          message.reply(':droplet: ' + Drip + ' Quanta for you. :droplet:\n*Funds take up to 5 min to deposit.*');
        }
      });
    });
  },
};