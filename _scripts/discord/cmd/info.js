module.exports = {
  name: 'info',
  description: 'Information about this bot and the QRL Network.',
  aliases: ['information', '??', 'details', 'stats', 'status', 'state'],
  args: false,
  usage: '\n`{alias: ?? | information | details | stats | status | state}`\n`{args: market | exchange {exchange_name} | faucet | bot | user }`\nGives details about the network, QRL Market, tipbot etc. Will also print your current tipbot details to DM',
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
  function deleteMessage() {
    // Delete the previous message
    if(message.guild != null) {
      message.channel.stopTyping(true);
      message.delete();
    }
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
    const splitNumber = number.toString().split('.');
    splitNumber[0] = splitNumber[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return splitNumber.join('.');
  }

  async function main() {
    // look in the database for the user
    const username = `${message.author}`;
    const userName = username.slice(1, -1);
    const userInfo = { service: 'discord', service_id: userName };
    const userData = await dbHelper.GetAllUserInfo(userInfo);
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
    // const botFee = config.wallet.tx_fee;
    const botUrl = config.bot_details.bot_url;
    const explorerURL = config.bot_details.explorer_url;
    // get updated bot wallet balance and faucet wallet balance
    const cgData = JSON.parse(await getCgData());
    const priceChange24hPercent = cgData.market_data.price_change_percentage_24h;
    const circulatingSupply = cgData.market_data.circulating_supply;
    const totalSupply = cgData.market_data.total_supply;
    // vcc info
    const vccVolumeRaw = cgData.tickers[0].volume;
    const vccVolume = thousandths(vccVolumeRaw.toFixed(2));
    const vccIdentifier = cgData.tickers[0].market.name;
    const vccURL = cgData.tickers[0].trade_url;

    // bittrex info from coinGecko
    const bittrexVolumeRaw = cgData.tickers[1].volume;
    const bittrexVolume = thousandths(bittrexVolumeRaw.toFixed(2));
    const bittrexIdentifier = cgData.tickers[1].market.name;
    const bittrexURL = cgData.tickers[1].trade_url;

    // upbit info
    const upbitVolumeRaw = cgData.tickers[2].volume;
    const upbitVolume = thousandths(upbitVolumeRaw.toFixed(2));
    const upbitIdentifier = cgData.tickers[2].market.name;
    const upbitURL = cgData.tickers[2].trade_url;

    // upbit Indonesia info
    const upbitIndonesiaVolumeRaw = cgData.tickers[3].volume;
    const upbitIndonesiaVolume = thousandths(upbitIndonesiaVolumeRaw.toFixed(2));
    const upbitIndonesiaIdentifier = cgData.tickers[3].market.name;
    const upbitIndonesiaURL = cgData.tickers[3].trade_url;

     // USD Market data
    const usdValue = cgData.market_data.current_price.usd;
    const usdATH = cgData.market_data.ath.usd;
    const usdATHChange = cgData.market_data.ath_change_percentage.usd;

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
    const btcATL = cgData.market_data.atl.btc;
    const btcATLChange = cgData.market_data.atl_change_percentage.btc;
    const btcMarketCap = cgData.market_data.market_cap.btc;
    const btcTotalVolume = cgData.market_data.total_volume.btc;
    const btcHigh24h = cgData.market_data.high_24h.btc;
    const btcLow24h = cgData.market_data.low_24h.btc;
    const btcPriceChange24h = cgData.market_data.price_change_24h_in_currency.btc;
    const btcMarketCapChange24h = cgData.market_data.market_cap_change_24h_in_currency.btc;

    // ///////////////////////////////
    // Market Request               //
    // ///////////////////////////////
    if (args[0] == 'market' || args[0] == 'markets' || args[0] == 'price' || args[0] == 'value' || args[0] == '$$') {
      const embed = new Discord.MessageEmbed()
        .setColor('GREEN')
        .setTitle('**QRL Market Info**')
        .setURL('https://www.coingecko.com/en/coins/quantum-resistant-ledger')
        .setDescription('Market information from Coin Gecko for QRL. For information only, *DYOR!*')
        .addFields(
          { name: 'QRL USD Value:', value: '`\u0024' + thousandths(usdValue) + '`', inline: true },
          { name: 'Volume USD / BTC', value: '`\u0024' + thousandths(usdTotalVolume) + ' / \u20BF' + thousandths(btcTotalVolume) + '`', inline: true },
          { name: 'Price Change USD / BTC 24h', value: '`\u0024' + (usdPriceChange24h).toFixed(4) + ' \u20BF' + (btcPriceChange24h).toFixed(9) + ' (%' + (priceChange24hPercent).toFixed(2) + ')`' },
          { name: 'Market Cap:', value: '`\u0024' + thousandths(usdMarketCap) + ' / \u20BF' + thousandths(btcMarketCap) + '`', inline: true },
          { name: 'Market Cap Change 24h: ', value: '`\u0024' + thousandths(usdMarketCapChange24h) + ' / \u20BF' + thousandths(btcMarketCapChange24h) + '`', inline: true },
          { name: '24hr USD Low/High', value: '`\u0024' + thousandths((usdLow24h).toFixed(3)) + ' / \u0024' + thousandths((usdHigh24h).toFixed(3)) + '`' },
          { name: '24hr BTC Low/High', value: '`\u20BF' + thousandths(btcLow24h) + ' / \u20BF' + thousandths(btcHigh24h) + '`' },
          { name: 'All TIme High:', value: '**USD:** `\u0024' + thousandths((usdATH).toFixed(2)) + ' (%' + (usdATHChange).toFixed(2) + ')` **BTC:** `\u20BF' + thousandths((btcATH).toFixed(9)) + ' (%' + (btcATHChange).toFixed(2) + ')`' },
          { name: 'All Time Low', value: '**USD:** `\u0024' + thousandths((usdATL).toFixed(2)) + ' (%' + (usdATLChange).toFixed(2) + ')` **BTC:** `\u20BF' + thousandths((btcATL).toFixed(9)) + ' (%' + (btcATLChange).toFixed(2) + ')`', inline: true },
          { name: 'Circulating / Total Supply', value: '`' + thousandths(circulatingSupply.toFixed(0)) + ' / ' + thousandths(totalSupply) + '`' },
        )
        .setTimestamp()
        .setFooter('.: The QRL Contributors :. Market data provided by Coin Gecko');
      message.reply({ embed })
        .then(() => {
          message.channel.stopTyping(true);
      });
    }
    // ///////////////////////////////
    // Faucet Request               //
    // ///////////////////////////////
    else if (args[0] == 'faucet' || args[0] == 'drip' || args[0] == 'free' || args[0] == 'charity' || args[0] == 'giveaway') {
      const embed = new Discord.MessageEmbed()
        .setColor('GREEN')
        .setTitle('**QRL Faucet Info**')
        .setURL('https://faucet.qrl.tips')
        .setDescription('The QRL Tipbot has a faucet included that will give Quanta away to any user signed up to the tipbot. Faucet details below.')
        .addFields(
          { name: 'Tipbot Faucet Balance:', value: '`' + thousandths(faucetBal) + '`' },
          { name: 'Faucet Payout interval:', value: ':timer: `' + ((faucetPayoutInterval / 60) / 24).toFixed(4) + ' Day(s)`' },
          { name: 'Minimum Faucet Payout', value: ':small_red_triangle_down: ` ' + faucetMinPayout + ' shor`', inline: true },
          { name: 'Maximum Faucet Payout', value: ':small_red_triangle: ` ' + faucetMaxPayout + ' shor`', inline: true },
          { name: 'Faucet Wallet Address', value: '[' + FaucetWalletPub + '](' + config.bot_details.explorer_url + '/a/' + FaucetWalletPub + ')' },
        )
        .setTimestamp()
        .setFooter('Use the address above if you would like to contribute to the faucet .: The QRL Contributors :.');
      message.reply({ embed })
        .then(() => {
          message.channel.stopTyping(true);
      });
    }
    // ///////////////////////////////
    // Exchange Request             //
    // ///////////////////////////////
    else if (args[0] == 'exchange' || args[0] == 'trade' || args[0] == 'buy' || args[0] == 'sell') {
      // #####################
      // Bittrex
      // #####################
      if (args[1] == 'bittrex') {
        const bittrexLastBTC = cgData.tickers[1].last;
        const bittrexBidAsk = cgData.tickers[1].bid_ask_spread_percentage;
        const bittrexConvertedVolumeBtc = cgData.tickers[1].converted_volume.btc;
        const bittrexConvertedVolumeEth = cgData.tickers[1].converted_volume.eth;
        const bittrexConvertedVolumeUsd = cgData.tickers[1].converted_volume.usd;
        const embed = new Discord.MessageEmbed()
          .setColor('GREEN')
          .setTitle('**QRL Bittrex Information**')
          .setURL(bittrexURL)
          .setDescription(`QRL trading information for the [Bittrex](${bittrexURL}) exchange.`)
          .addFields(
          { name: 'Volume:', value: '`' + bittrexVolumeRaw + ' QRL`' },
          { name: 'Converted Volume Usd:', value: '`\u0024 ' + bittrexConvertedVolumeUsd + ' usd`', inline: true },
          { name: 'Converted Volume BTC:', value: '`\u20BF ' + bittrexConvertedVolumeBtc + ' btc`', inline: true },
          { name: 'Converted Volume ETH:', value: '`\u039E ' + bittrexConvertedVolumeEth + ' eth`', inline: true },
          { name: 'Last Trade: ', value: '\u20BF ` ' + bittrexLastBTC + '`', inline: true },
          { name: 'Bid / Ask Spread:', value: '` ' + bittrexBidAsk + ' %`', inline: true },
          )
          .setTimestamp()
          .setFooter('Market Data provided by Coin Gecko - .: The QRL Contributors :. ');
        message.reply({ embed })
          .then(() => {
            message.channel.stopTyping(true);
        });
      }
      // #####################
      // Upbit
      // #####################
      else if (args[1] == 'upbit') {
        const upbitLastBTC = cgData.tickers[2].last;
        const upbitBidAsk = cgData.tickers[2].bid_ask_spread_percentage;
        const upbitConvertedVolumeBtc = cgData.tickers[2].converted_volume.btc;
        const upbitConvertedVolumeEth = cgData.tickers[2].converted_volume.eth;
        const upbitConvertedVolumeUsd = cgData.tickers[2].converted_volume.usd;
        const embed = new Discord.MessageEmbed()
          .setColor('GREEN')
          .setTitle('**QRL upbit Information**')
          .setURL(upbitURL)
          .setDescription(`QRL trading information for the [Upbit](${upbitURL}) exchange.`)
          .addFields(
          { name: 'Volume:', value: '`' + upbitVolumeRaw + ' QRL`' },
          { name: 'Converted Volume Usd:', value: '`\u0024 ' + upbitConvertedVolumeUsd + ' usd`', inline: true },
          { name: 'Converted Volume BTC:', value: '`\u20BF ' + upbitConvertedVolumeBtc + ' btc`', inline: true },
          { name: 'Converted Volume ETH:', value: '`\u039E ' + upbitConvertedVolumeEth + ' eth`', inline: true },
          { name: 'Last Trade: ', value: '\u20BF ` ' + upbitLastBTC + '`', inline: true },
          { name: 'Bid / Ask Spread:', value: '` ' + upbitBidAsk + ' %`', inline: true },
          )
          .setTimestamp()
          .setFooter('Market Data provided by Coin Gecko - .: The QRL Contributors :. ');
        message.reply({ embed })
          .then(() => {
            message.channel.stopTyping(true);
        });
      }
      // #####################
      // Upbit Indonesia
      // #####################
      else if (args[1] == 'upbitIndonesia') {
        const upbitIndonesiaLastBTC = cgData.tickers[3].last;
        const upbitIndonesiaBidAsk = cgData.tickers[3].bid_ask_spread_percentage;
        const upbitIndonesiaConvertedVolumeBtc = cgData.tickers[3].converted_volume.btc;
        const upbitIndonesiaConvertedVolumeEth = cgData.tickers[3].converted_volume.eth;
        const upbitIndonesiaConvertedVolumeUsd = cgData.tickers[3].converted_volume.usd;
        const embed = new Discord.MessageEmbed()
          .setColor('GREEN')
          .setTitle('**QRL Upbit Indonesia Information**')
          .setURL(upbitURL)
          .setDescription(`QRL trading information for the [Upbit Indonesia](${upbitIndonesiaURL}) exchange.`)
          .addFields(
          { name: 'Volume:', value: '`' + upbitIndonesiaVolumeRaw + ' QRL`' },
          { name: 'Converted Volume Usd:', value: '`\u0024 ' + upbitIndonesiaConvertedVolumeUsd + ' usd`', inline: true },
          { name: 'Converted Volume BTC:', value: '`\u20BF ' + upbitIndonesiaConvertedVolumeBtc + ' btc`', inline: true },
          { name: 'Converted Volume ETH:', value: '`\u039E ' + upbitIndonesiaConvertedVolumeEth + ' eth`', inline: true },
          { name: 'Last Trade: ', value: '\u20BF ` ' + upbitIndonesiaLastBTC + '`', inline: true },
          { name: 'Bid / Ask Spread:', value: '` ' + upbitIndonesiaBidAsk + ' %`', inline: true },
          )
          .setTimestamp()
          .setFooter('Market Data provided by Coin Gecko - .: The QRL Contributors :. ');
        message.reply({ embed })
          .then(() => {
            message.channel.stopTyping(true);
        });
      }
      // #####################
      // VCC Exchange
      // #####################
      else if (args[1] == 'vcc') {
        const vccLastBTC = cgData.tickers[0].last;
        const vccBidAsk = cgData.tickers[0].bid_ask_spread_percentage;
        const vccConvertedVolumeBtc = cgData.tickers[0].converted_volume.btc;
        const vccConvertedVolumeEth = cgData.tickers[0].converted_volume.eth;
        const vccConvertedVolumeUsd = cgData.tickers[0].converted_volume.usd;
        const embed = new Discord.MessageEmbed()
          .setColor('GREEN')
          .setTitle('**QRL VCC Information**')
          .setURL(upbitURL)
          .setDescription(`QRL trading information for the [VCC](${upbitIndonesiaURL}) exchange.`)
          .addFields(
          { name: 'Volume:', value: '`' + vccVolumeRaw + ' QRL`' },
          { name: 'Converted Volume Usd:', value: '`\u0024 ' + vccConvertedVolumeUsd + ' usd`', inline: true },
          { name: 'Converted Volume BTC:', value: '`\u20BF ' + vccConvertedVolumeBtc + ' btc`', inline: true },
          { name: 'Converted Volume ETH:', value: '`\u039E ' + vccConvertedVolumeEth + ' eth`', inline: true },
          { name: 'Last Trade: ', value: '\u20BF ` ' + vccLastBTC + '`', inline: true },
          { name: 'Bid / Ask Spread:', value: '` ' + vccBidAsk + ' %`', inline: true },
          )
          .setTimestamp()
          .setFooter('Market Data provided by Coin Gecko - .: The QRL Contributors :. ');
        message.reply({ embed })
          .then(() => {
            message.channel.stopTyping(true);
        });
      }
      // if none with API endpoints then give this message.
      // FIX-ME: Need to integrate withadditional services or direct from exchange
      else if (args[1] == 'biteeu' || args[1] == 'bitvoicex' || args[1] == 'cointiger' || args[1] == 'simpleswap' || args[1] == 'swapzone' || args[1] == 'stealthex') {
        const embed = new Discord.MessageEmbed()
          .setColor('GREEN')
          .setTitle('**QRL Exchange Info**')
          .setURL('https://theqrl.org/markets/')
          .setDescription(`Exchange information where you can trade $QRL.
          [:small_blue_diamond: BITEEU](https://trade.biteeu.com/search)
          [:small_blue_diamond: Bitvoicex](https://bitvoicex.net/markets/qrl_btc)
          [:small_blue_diamond: CoinTiger](https://www.cointiger.com/en-us/#/trade_center?coin=qrl_btc)
          [:small_blue_diamond: SimpleSwap](https://simpleswap.io/coins/quantum-resistant-ledger)
          [:small_blue_diamond: SwapZone](https://swapzone.io/?to=qrl)
          [:small_blue_diamond: StealthEX](https://stealthex.io/coin/qrl)

          For listing inquires email: __info@theqrl.org__
          *Volume data provided by [Coin Gecko](https://www.coingecko.com/en/coins/quantum-resistant-ledger)*
          *Bot Development Needed, Ask how you can help!*
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
      else {
        // give default response with listing info
        const embed = new Discord.MessageEmbed()
          .setColor('GREEN')
          .setTitle('**QRL Exchange Info**')
          .setURL('https://theqrl.org/markets/')
          .setDescription(`Exchange information where you can trade $QRL

          [:small_blue_diamond: ${bittrexIdentifier}](${bittrexURL})\tvolume: \`\u0024${bittrexVolume}\`
          [:small_blue_diamond: ${upbitIdentifier}](${upbitURL})\tvolume: \`\u0024${upbitVolume}\`
          [:small_blue_diamond: ${upbitIndonesiaIdentifier}](${upbitIndonesiaURL})\tvolume: \`\u0024${upbitIndonesiaVolume}\`
          [:small_blue_diamond: ${vccIdentifier}](${vccURL})\tvolume: \`\u0024${vccVolume}\`
          [:small_blue_diamond: BITEEU](https://trade.biteeu.com/search)
          [:small_blue_diamond: Bitvoicex](https://bitvoicex.net/markets/qrl_btc)
          [:small_blue_diamond: CoinTiger](https://www.cointiger.com/en-us/#/trade_center?coin=qrl_btc)
          [:small_blue_diamond: SimpleSwap](https://simpleswap.io/coins/quantum-resistant-ledger)
          [:small_blue_diamond: SwapZone](https://swapzone.io/?to=qrl)
          [:small_blue_diamond: StealthEX](https://stealthex.io/coin/qrl)

          For listing inquires email: __info@theqrl.org__
          *Volume data provided by [Coin Gecko](https://www.coingecko.com/en/coins/quantum-resistant-ledger)*
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
    }
    // ///////////////////////////////
    // Bot Request                  //
    // ///////////////////////////////
    else if (args[0] == 'bot' || args[0] == 'tipbot' || args[0] == 'fee') {
      // get pool data from a pool
      const poolData = JSON.parse(await getPoolInfo());
      const hashrate = getHashRate(poolData.network.difficulty / poolData.config.coinDifficultyTarget) + '/sec';
      // serve the bot info here
      const nodeBlockHeight = JSON.parse(await getHeight());
      const embed = new Discord.MessageEmbed()
        .setColor('GREEN')
        .setTitle('**QRL Tipbot Info**')
        .setURL(botUrl)
        .setDescription('The tipbot enables sending QRL tips to other discord users. The bot will create an individual address for each bot user with the `+add` command. \n\n:small_blue_diamond: All tips are on chain and can be seen in the [QRL Block Explorer](' + explorerURL + '). \n:small_blue_diamond: You will need to create a new address and `+transfer` your earned tips to an address you control. Use the [QRL Web Wallet](' + config.wallet.wallet_url + ')\n:small_blue_diamond: You can send tips to users that have not signed up and the bot will save them for the user. Once they sign up these tips will be waiting for them.\n')
        .addFields(
          { name: 'Block Height: ', value: '`' + nodeBlockHeight.height + '`', inline: true },
          { name: 'Network Hashrate:', value: '`' + hashrate + '`', inline: true },
          { name: 'Mining Difficulty:', value: '`' + hashrate + '`', inline: true },
          // FIX-ME:
          //    add more information about the bot here
          //    including how many accounts signed up, total tips sent, servers and other bot stats.

          // { name: 'Bot Transaction Fees:', value: '`\u0024 ' + botFee + '`', inline: true },
        )
        .setTimestamp()
        .setFooter('.: The QRL Contributors :.');
      message.reply({ embed })
        .then(() => {
          message.channel.stopTyping(true);
        });
    }
    else if (args[0] == 'user' || args[0] == 'me' || args[0] == 'account' || args[0] == 'balance' || args[0] == 'bal') {
      // run through checks and fail if, else serve User info to the user
      // is user found?
      if (found === 'false') {
        console.log('!found');
        // not found, give main message and end
        ReplyMessage('Your not found in the System. Try `+add` or `+help`');
        return;
      }
      // check for opt_out status
      if (optOut === 1) {
        console.log('opt-out');
        // Opt Out, give main message and end
        ReplyMessage('You have opted out of the tipbot. Please send `+opt-in` to opt back in!');
        return;
      }
      if (agree === 'false') {
        console.log('!agree');
        // not Agreed, give main message and end
        ReplyMessage('You need to agree, please see the `+terms`');
        return;
      }
      else {
        deleteMessage();
        // user found and all checks pass Send them a message with tipbot account details
        //
        // FIX-ME
        //
        // Add more details for users here, tips sent, tips received, faucet withdraws etc fro DB
        //
        // if (message.channel.type === 'dm') return;
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
          .setFooter('.: The QRL Contributors :. Market data provided by Coin Gecko');
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
      // get block height from node
      else {
        ReplyMessage('Use this bot to send and receive tips on the QRL network. `+help info` for more commands.');
      }
    }
    main();
  },
};