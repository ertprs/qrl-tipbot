module.exports = {
  name: 'info',
  description: 'Information about this bot and the QRL Network.',
  aliases: ['information', 'details', 'stats', 'status', 'state'],
  args: false,
  usage: ' { market|price|value, bot, exchange,  } - gives details about the network, tipbot etc. Add the {verbose} argument to have all deails printed to DM',
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

  function thousandths(number) {
    let splitNumber = number.toString().split('.');
    splitNumber[0] = splitNumber[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return splitNumber.join('.');
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

    const faucetBal = (faucetBalShor.balance / shor).toFixed(9);
    // general bot data
    const botFee = config.wallet.tx_fee;
    const botUrl = config.bot_details.bot_url;
    const explorerURL = config.bot_details.explorer_url;

      // get updated bot wallet balance and faucet wallet balance
      const cgData = JSON.parse(await getCgData());
      const priceChange24h = cgData.market_data.price_change_24h;
      const circulatingSupply = cgData.market_data.circulating_supply;
      const totalSupply = cgData.market_data.total_supply;
      // vcc info
      const vccVolume = cgData.tickers[0].volume;
      const vccIdentifier = cgData.tickers[0].market.name;
      const vccURL = cgData.tickers[0].trade_url;
      const vccLastBTC = cgData.tickers[0].last;
      const vccBidAsk = cgData.tickers[0].bid_ask_spread_percentage;
      // bittrex info from coinGecko
      const bittrexVolume = cgData.tickers[1].volume;
      const bittrexIdentifier = cgData.tickers[1].market.name;
      const bittrexURL = cgData.tickers[1].trade_url;
      const bittrexLastBTC = cgData.tickers[1].last;
      const bittrexBidAsk = cgData.tickers[1].bid_ask_spread_percentage;
      // upbit info
      const upbitVolume = cgData.tickers[2].volume;
      const upbitIdentifier = cgData.tickers[2].market.name;
      const upbitURL = cgData.tickers[2].trade_url;
      const upbitLastBTC = cgData.tickers[2].last;
      const upbitBidAsk = cgData.tickers[2].bid_ask_spread_percentage;
      // upbit Indonesia info
      const upbitIndonesiaVolume = cgData.tickers[3].volume;
      const upbitIndonesiaIdentifier = cgData.tickers[3].market.name;
      const upbitIndonesiaURL = cgData.tickers[3].trade_url;
      const upbitIndonesiaLastBTC = cgData.tickers[3].last;
      const upbitIndonesiaBidAsk = cgData.tickers[3].bid_ask_spread_percentage;

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

    // Market Request
    if (args[0] == 'market' || args[0] == 'markets' || args[0] == 'price' || args[0] == 'value') {
      const embed = new Discord.MessageEmbed()
        .setColor('GREEN')
        .setTitle('**QRL Market Info**')
        .setURL('https://www.coingecko.com/en/coins/quantum-resistant-ledger')
        // .setDescription('Details from the balance query.')
        .addFields(
          { name: 'QRL USD Value:', value: '`\u0024 ' + thousandths(usdValue) + '`' },

          { name: 'Market Cap:', value: '`\u0024 ' + thousandths(usdMarketCap) + '`', inline: true },
          { name: 'Volume', value: '`\u0024 ' + thousandths(usdTotalVolume) + '`', inline: true },
          { name: 'Circulating Supply', value: '`' + thousandths(circulatingSupply.toFixed(0)) + ' / ' + thousandths(totalSupply) + '`' },
          { name: '24hr Low ', value: '`\u0024 ' + thousandths(usdLow24h) + '`', inline: true },
          { name: '24hr High', value: '`\u0024 ' + thousandths(usdHigh24h) + '`', inline: true },
        )
        .setTimestamp()
        .setFooter('.: The QRL Contributors :. \tMarket data provided by Coin Gecko');
      message.reply({ embed })
        .then(() => {
          message.channel.stopTyping(true);
      });
    }

    // Exchange Request
    if (args[0] == 'exchange' || args[0] == 'trade' || args[0] == 'buy' || args[0] == 'sell') {
      const embed = new Discord.MessageEmbed()
        .setColor('GREEN')
        .setTitle('**QRL Exchange Info**')
        .setURL('https://theqrl.org/markets/')
        .setDescription(`Exchange information where you can trade $QRL.

          [:small_blue_diamond: ${bittrexIdentifier}](${bittrexURL})\t\`${bittrexVolume}\`
          [:small_blue_diamond: ${upbitIdentifier}](${upbitURL})\t\`${upbitVolume}\`
          [:small_blue_diamond: ${upbitIndonesiaIdentifier}](${upbitIndonesiaURL})\t\`${upbitIndonesiaVolume}\`
          [:small_blue_diamond: ${vccIdentifier}](${vccURL})\t\`${vccVolume}\`
          [:small_blue_diamond: BITEEU](https://trade.biteeu.com/search)
          [:small_blue_diamond: Bitvoicex](https://bitvoicex.net/markets/qrl_btc)
          [:small_blue_diamond: CoinTiger](https://www.cointiger.com/en-us/#/trade_center?coin=qrl_btc)
          [:small_blue_diamond: SimpleSwap](https://simpleswap.io/coins/quantum-resistant-ledger)
          [:small_blue_diamond: SwapZone](https://swapzone.io/?to=qrl)
          [:small_blue_diamond: StealthEX](https://stealthex.io/coin/qrl)

          For listing inquires email: ***info@theqrl.org***
          *Volume data provided by [Coin Gecko](https://www.coingecko.com/en/coins/quantum-resistant-ledger), not all exchanges are listed on their service.*.
          `)
        .addFields(
        )
        .setTimestamp()
        .setFooter('.: The QRL Contributors :.');
      message.reply({ embed })
        .then(() => {
          message.channel.stopTyping(true);
      });
    }

      // console.log('priceChange24h: ' + priceChange24h);
      // console.log('totalSupply: ' + totalSupply);
      // console.log('circulatingSupply: ' + circulatingSupply);
      // console.log('usdValue: ' + usdValue);
      // console.log('usdATH: ' + usdATH);
      // console.log('usdATHChange: ' + usdATHChange);
      // console.log('usdAthDate: ' + usdAthDate);
      // console.log('usdATL: ' + usdATL);
      // console.log('usdATLChange: ' + usdATLChange);
      // console.log('usdMarketCap: ' + usdMarketCap);
      // console.log('usdTotalVolume: ' + usdTotalVolume);
      // console.log('usdHigh24h: ' + usdHigh24h);
      // console.log('usdLow24h: ' + usdLow24h);
      // console.log('usdPriceChange24h: ' + usdPriceChange24h);
      // console.log('usdMarketCapChange24h: ' + usdMarketCapChange24h);
      // console.log('btcValue: ' + btcValue);
      // console.log('btcATH: ' + btcATH);
      // console.log('btcATHChange: ' + btcATHChange);
      // console.log('btcathDate: ' + btcathDate);
      // console.log('btcATL: ' + btcATL);
      // console.log('btcATLChange: ' + btcATLChange);
      // console.log('btcAthDate: ' + btcAthDate);
      // console.log('btcMarketCap: ' + btcMarketCap);
      // console.log('btcTotalVolume: ' + btcTotalVolume);
      // console.log('btcHigh24h: ' + btcHigh24h);
      // console.log('btcLow24h: ' + btcLow24h);
      // console.log('btcPriceChange24h: ' + btcPriceChange24h);
      // console.log('btcMarketCapChange24h: ' + btcMarketCapChange24h);
    else if (args[0] == 'bot' || args[0] == 'tipbot' || args[0] == 'fee') {
      // serve the bot info here
      // console.log('botFee: ' + botFee);
      // console.log('botUrl: ' + botUrl);
      const nodeBlockHeight = JSON.parse(await getHeight());
      const embed = new Discord.MessageEmbed()
        .setColor('GREEN')
        .setTitle('**QRL Tipbot Info**')
        .setURL(botUrl)
        .setDescription('The tipbot enables sending QRL tips to other discord users. The bot will create an individual address for each bot user with the `+add` command. \n\n:diamond_shape_with_a_dot_inside: All tips are on chain and can be seen in the [QRL Block Explorer](' + explorerURL + '). \n:diamond_shape_with_a_dot_inside: You will need to create a new address and `+transfer` your earned tips to an address you control. Use the [QRL Web Wallet](' + config.wallet.wallet_url + ')\n:diamond_shape_with_a_dot_inside: You can send tips to users that have not signed up and the bot will save them for the user. Once they sign up these tips will be waiting for them.\n')
        .addFields(
          { name: 'Block Height: ', value: '`' + nodeBlockHeight.height + '`', inline: true },
          { name: 'Transaction Fee:', value: '`\u0024 ' + botFee + '`', inline: true },
        )
        .setTimestamp()
        .setFooter('.: The QRL Contributors :.');
      message.reply({ embed })
        .then(() => {
          message.channel.stopTyping(true);
        });

    }
    else {
      ReplyMessage('Use this bot to send and receive tips on the QRL network. +help for more');
    }

    // get block height from node
    // get pool data from a pool
    const poolData = JSON.parse(await getPoolInfo());
    // usd values and AllTime change

    // console.log(JSON.stringify(cgData));
    // console.log(JSON.stringify(poolData));
    // console.log('FaucetWalletPub: ' + FaucetWalletPub);
    // console.log('faucetPayoutInterval: ' + faucetPayoutInterval);
    // console.log('faucetMinPayout: ' + faucetMinPayout);
    // console.log('faucetMaxPayout: ' + faucetMaxPayout);
    // console.log('explorerURL: ' + explorerURL);
    // console.log('faucetBal: ' + faucetBal);
    // console.log('nodeBlockHeight: ' + nodeBlockHeight.height);
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
      // console.log('userBal: ' + userBal);


      const embed = new Discord.MessageEmbed()
        .setColor(0x000000)
        .setTitle('**QRL Tipbot Info**')
        .setURL(botUrl)
        // .setDescription('Details from the balance query.')
        .addFields(
          { name: 'Your Tipbot Wallet Balance:', value: '`' + thousandths(userBal) + ' QRL`' },
          { name: 'Tipbot Balance - BTC:', value: '`\u20BF ' + thousandths(userBTCValue) + '`', inline: true },
          { name: 'Tipbot Balance - USD', value: '`\u0024 ' + thousandths(userUSDValue) + '`', inline: true },
          { name: 'Tipbot QRL Address:', value: '[' + userWalletPub + '](' + config.bot_details.explorer_url + '/a/' + userWalletPub + ')' },
        )
        .addField('QRL / USD', '`1 QRL = \u0024 ' + thousandths(usdValue) + '`', true)
        .setTimestamp()
        .setFooter('.: The QRL Contributors :. \tMarket data provided by Coin Gecko');
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