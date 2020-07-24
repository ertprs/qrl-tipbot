//  const { prefix } = require('../../../config.json');

module.exports = {
  name: 'info',
  description: 'Information about this bot.',
  aliases: ['information', 'details', 'stats', 'status', 'state'],
  args: false,
  usage: ' (optional) verbose - gives details about the network, tipbot etc. Add the {verbose} argument to have all deails printed to DM',
  cooldown: 1,
  execute(message, args) {

  const Discord = require('discord.js');
  const dbHelper = require('../../db/dbHelper');
  const config = require('../../../_config/config.json');
  const wallet = require('../../qrl/walletTools');
  const explorer = require('../../qrl/explorerTools');
  const cgTools = require('../../coinGecko/cgTools');


  function ReplyMessage(content) {
    setTimeout(function() {
      message.reply(content);
      message.channel.stopTyping(true);
    }, 1000);
  }

// /////////////////////////////////////////////

  function getHeight() {
      return new Promise(resolve => {
      const height = wallet.GetHeight();
      resolve(height);
    });
  }

  function getCgData() {
    return new Promise(resolve => {
      const cgdata = cgTools.cgData();
      resolve(cgdata);
    });
  }

  function getPoolInfo() {
    return new Promise(resolve => {
      const poolData = explorer.poolData();
      resolve(poolData);
    });
  }

  function faucetWalletBalance() {
    return new Promise(resolve => {
      const walletBal = wallet.GetBalance;
      // console.log('faucet Address: ' + config.faucet.faucet_wallet_pub);
      resolve(walletBal(config.faucet.faucet_wallet_pub));
    });
  }

  function userWalletBalance(address) {
    return new Promise(resolve => {
      const walletBal = wallet.GetBalance;
      // console.log('faucet Address: ' + config.faucet.faucet_wallet_pub);
      resolve(walletBal(address));
    });
  }

  function getHashRate(hashrate) {
    if (!hashrate) hashrate = 0;
    let i = 0;
    const byteUnits = [' H', ' kH', ' MH', ' GH', ' TH', ' PH' ];
    if (hashrate > 0) {
      while (hashrate > 1000) {
        hashrate = hashrate / 1000;
        i++;
      }
    }
  return parseFloat(hashrate).toFixed(2) + byteUnits[i];
  }


  async function main() {
    
    // look in the database for the user
    const username = `${message.author}`;
    const userName = username.slice(1, -1);
    const userInfo = { service: 'discord', service_id: userName };
    const userData = await dbHelper.GetAllUserInfo(userInfo);
    // console.log(JSON.stringify(userData));
    // parse the user details
    const found = userData[0].userData;
    const optOut = userData[0].opt_out;
    const agree = userData[0].user_agree;
    // multiplier for balance calculations
    const shor = 1000000000;
    // faucet data
    const FaucetWalletPub = config.faucet.faucet_wallet_pub;
    const faucetPayoutInterval = config.faucet.payout_interval;
    const faucetMinPayout = config.faucet.min_payout;
    const faucetMaxPayout = config.faucet.max_payout;
    const faucetBalShor = await faucetWalletBalance();
    
    const faucetBal = (faucetBalShor.balance / shor).toFixed(9)
    // general bot data
    const botFee = config.wallet.tx_fee;
    const botUrl = config.bot_details.bot_url;
    const explorerURL = config.bot_details.explorer_url;

    
    
      // get updated bot wallet balance and faucet wallet balance
      const cgData = JSON.parse(await getCgData());
      const priceChange24h = cgData.market_data.price_change_24h;
      const circulatingSupply = cgData.market_data.circulating_supply;
      const totalSupply = cgData.market_data.total_supply;
      // USD Market data
      const usdValue = cgData.market_data.current_price.usd;
      const usdATH = cgData.market_data.ath.usd;
      const usdATHChange = cgData.market_data.ath_change_percentage.usd;
      const usdAthDate = cgData.market_data.ath_date.usd;
      const usdATL = cgData.market_data.atl.usd;
      const usdATLChange = cgData.market_data.atl_change_percentage.usd;
      const usdMarketCap = cgData.market_data.market_cap.usd;
      const usdTotalVolume = cgData.market_data.total_volume.usd;
      const usdHigh24h = cgData.market_data.high_24h.usd;
      const usdLow24h = cgData.market_data.low_24h.usd;
      const usdPriceChange24h = cgData.market_data.price_change_24h_in_currency.usd;
      const usdMarketCapChange24h = cgData.market_data.market_cap_change_24h_in_currency.usd;
      // BTC market data from CoinGecko
      const btcValue = cgData.market_data.current_price.btc;
      const btcATH = cgData.market_data.ath.btc;
      const btcATHChange = cgData.market_data.ath_change_percentage.btc;
      const btcathDate = cgData.market_data.ath_date.btc;
      const btcATL = cgData.market_data.atl.btc;
      const btcATLChange = cgData.market_data.atl_change_percentage.btc;
      const btcAthDate = cgData.market_data.ath_date.btc;
      const btcMarketCap = cgData.market_data.market_cap.btc;
      const btcTotalVolume = cgData.market_data.total_volume.btc;
      const btcHigh24h = cgData.market_data.high_24h.btc;
      const btcLow24h = cgData.market_data.low_24h.btc;
      const btcPriceChange24h = cgData.market_data.price_change_24h_in_currency.btc;
      const btcMarketCapChange24h = cgData.market_data.market_cap_change_24h_in_currency.btc;
    
    if (args[0] == 'market') {
      const embed = new Discord.MessageEmbed()
        .setColor(0x000000)
        .setTitle('**QRL Market Info**')
        .setURL('https://www.coingecko.com/en/coins/quantum-resistant-ledger')
        // .setDescription('Details from the balance query.')
        .addFields(
          { name: 'QRL USD Value:', value: '`\u0024 ' + usdValue + '`' },

          { name: 'Market Cap:', value: '`\u0024 ' + usdMarketCap + '`', inline: true },
          { name: 'Volume', value: '`\u0024 ' + usdTotalVolume + '`', inline: true },
          { name: '24hr Low / High', value: '`\u0024 ' + usdLow24h + ' / \u0024 ' + usdHigh24h + '`', inline: true },
          { name: 'Circulating Supply', value: '`' + circulatingSupply + '/' + totalSupply + '`', inline: true },
        )
        .setTimestamp()
        .setFooter('Market data provided by Coin Gecko, ');
      message.reply({ embed })
        .then(() => {
          message.channel.stopTyping(true);

      console.log('priceChange24h: ' + priceChange24h)
      console.log('totalSupply: ' + totalSupply)
      console.log('circulatingSupply: ' + circulatingSupply)
      console.log('usdValue: ' + usdValue)
      console.log('usdATH: ' + usdATH)
      console.log('usdATHChange: ' + usdATHChange)
      console.log('usdAthDate: ' + usdAthDate)
      console.log('usdATL: ' + usdATL)
      console.log('usdATLChange: ' + usdATLChange)
      console.log('usdMarketCap: ' + usdMarketCap)
      console.log('usdTotalVolume: ' + usdTotalVolume)
      console.log('usdHigh24h: ' + usdHigh24h)
      console.log('usdLow24h: ' + usdLow24h)
      console.log('usdPriceChange24h: ' + usdPriceChange24h)
      console.log('usdMarketCapChange24h: ' + usdMarketCapChange24h)
      console.log('btcValue: ' + btcValue)
      console.log('btcATH: ' + btcATH)
      console.log('btcATHChange: ' + btcATHChange)
      console.log('btcathDate: ' + btcathDate)
      console.log('btcATL: ' + btcATL)
      console.log('btcATLChange: ' + btcATLChange)
      console.log('btcAthDate: ' + btcAthDate)
      console.log('btcMarketCap: ' + btcMarketCap)
      console.log('btcTotalVolume: ' + btcTotalVolume)
      console.log('btcHigh24h: ' + btcHigh24h)
      console.log('btcLow24h: ' + btcLow24h)
      console.log('btcPriceChange24h: ' + btcPriceChange24h)
      console.log('btcMarketCapChange24h: ' + btcMarketCapChange24h)
    }

    // get block height from node
    const nodeBlockHeight = JSON.parse(await getHeight());
    // get pool data from a pool
    const poolData = JSON.parse(await getPoolInfo());
    // usd values and AllTime change
    

    // console.log(JSON.stringify(cgData));
    // console.log(JSON.stringify(poolData));
    console.log('FaucetWalletPub: ' + FaucetWalletPub)
    console.log('faucetPayoutInterval: ' + faucetPayoutInterval)
    console.log('faucetMinPayout: ' + faucetMinPayout)
    console.log('faucetMaxPayout: ' + faucetMaxPayout)
    console.log('botFee: ' + botFee)
    console.log('botUrl: ' + botUrl)
    console.log('explorerURL: ' + explorerURL)
    console.log('faucetBal: ' + faucetBal)
    console.log('nodeBlockHeight: ' + nodeBlockHeight.height)




    // run through checks and fail if, else serve User info to the user
    // is user found?
    if (found === 'false') {
      console.log('!found');
      // not found, give main message and end
      // ReplyMessage('Your not found in the System. Try `+add` or `+help`');
      return;
    }
    // check for opt_out status
    if (optOut === 1) {
      console.log('opt-out');
      // Opt Out, give main message and end
      // ReplyMessage('You have opted out of the tipbot. Please send `+opt-in` to opt back in!');
      return;
    }
    if (agree === 'false') {
      console.log('!agree');
      // not Agreed, give main message and end
      // ReplyMessage('You need to agree, please see the `+terms`');
      return;
    }
    else {
      // user found and all checks pass
      const userWalletPub = userData[0].wallet_pub;
      const userBalShor = await userWalletBalance(userWalletPub);
      const userBal = (userBalShor.balance / shor).toFixed(9);
      const userBTCValue = (userBal * btcValue).toFixed(9);
      const userUSDValue = (userBal * usdValue).toFixed(3);
      console.log('userBal: ' + userBal)


      const embed = new Discord.MessageEmbed()
        .setColor(0x000000)
        .setTitle('**QRL Tipbot Info**')
        .setURL(botUrl)
        // .setDescription('Details from the balance query.')
        .addFields(
          { name: 'Your Tipbot Wallet Balance:', value: '`' + userBal + ' QRL`' },
          { name: 'Tipbot Balance - BTC:', value: '`\u20BF ' + userBTCValue + '`', inline: true },
          { name: 'Tipbot Balance - USD', value: '`\u0024 ' + userUSDValue + '`', inline: true },
          { name: 'Tipbot QRL Address:', value: '[' + userWalletPub + '](' + config.bot_details.explorer_url + '/a/' + userWalletPub + ')' },
        )
        .addField('QRL / USD', '`1 QRL = \u0024 ' + usdValue + '`',true)
        .setTimestamp()
        .setFooter('Market data provided by Coin Gecko, ');
      message.author.send({ embed })
        .then(() => {
          message.channel.stopTyping(true);
          if (message.channel.type === 'dm') return;
        })
        .catch(error => {
          console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
          message.channel.stopTyping(true);
          ReplyMessage('it seems like I can\'t DM you! Do you have DMs disabled?');
          return;
        });
  }
}

  ReplyMessage('The QRL tipbot is available to all users of this channel. Use this bot to send and receive tips on the QRL network.\nIf you would like to support the bot\'s faucet, use the donation addresses below`\n**Faucet Donation Address:** `' + config.faucet.faucet_wallet_pub + '`');
  main();


/*
  async function getUserInfo() {
    // look in the database for the user
    const username = `${message.author}`;
    const userName = username.slice(1, -1);
    const userInfo = { service: 'discord', service_id: userName };
    const data = await dbHelper.GetAllUserInfo(userInfo);
    // will return array of user data or not found.
    return data;
  }

  async function cgData() {
    const data = await getCgData();
    const array = [];
    array.push({ cgData: data });
    return array;
  }

  async function Height() {
    const data = await getHeight();
    const array = [];
    array.push({ height: data });
    return array;
  }
  async function poolInfo() {
    const data = await getPoolInfo();
    const array = [];
    array.push({ poolInfo: data });
    return array;
  }
  async function faucetBal() {
    const data = await faucetWalletBalance();
    const array = [];
    array.push({ faucetBal: data });
    return array;
  }
// /////////////////////////////////////////////


  getUserInfo().then(function(userInfo) {
    // set variables from db search
    console.log(JSON.stringify(userInfo));
    const found = userInfo[0].user_found;
    const optOut = userInfo[0].opt_out;
    const agree = userInfo[0].user_agree;
    // run through checks and fail if, else serve info to user
    // is user found?
    if (!found) {
      // not found, give main message and end
      // ReplyMessage('Your not found in the System. Try `+add` or `+help`');
      return;
    }
    // check for opt_out status
    if (optOut) {
      // Opt Out, give main message and end
      // ReplyMessage('You have opted out of the tipbot. Please send `+opt-in` to opt back in!');
      return;
    }
    if (!agree) {
      // not Agreed, give main message and end
      // ReplyMessage('You need to agree, please see the `+terms`');
      return;
    }
    else {
      // user found and all checks pass
      const userWalletPub = userInfo[0].wallet_pub;      
      const FaucetWalletPub = config.faucet.faucet_wallet_pub;
      const faucetPayoutInterval = config.faucet.payout_interval;
      const faucetMinPayout = config.faucet.min_payout;
      const faucetMaxPayout = config.faucet.max_payout;
      const botFee = config.wallet.tx_fee;
      const botUrl = config.bot_details.bot_url;
      const explorerURL = config.wallet.explorer_url;
      // get updated bot wallet balance and faucet wallet balance


    }
  });
*/
  },
};