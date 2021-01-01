module.exports = {
    name: 'tool',
  description: 'info! Print info on wallets.',
  args: true,
  guildOnly: false,
  aliases: ['tool', 'wallet_tool'],
  cooldown: 2,
  usage: ' \nbalance || bal - List Balance in all wallets,\ncount - count of all addresses\ngetWalletInfo - gets the wallet info\nwallet creates a new wallet... ',
  // execute(message, args) {
  execute(message, args) {
    // require the state file to get the state of the node
    const Discord = require('discord.js');
    const walletTools = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    // const list = walletTools.list;
    const count = walletTools.count;
    const balance = walletTools.totalBalance;
    // const encrypt = walletTools.encrypt;
    // const lock = walletTools.lock;
    // const unlock = walletTools.unlock;
    const getNodeInfo = walletTools.GetNodeInfo;
    const getWalletInfo = walletTools.getWalletInfo;
    // const createWallet = walletTools.CreateQRLWallet;
    const admin = config.discord.bot_admin;
    const user = message.author.id;
    // check for admin user, if not admin fail


    if (admin == user) {
      console.log('admin triggered by: ' + user);
      if (args != undefined) {

        /*
        if (args[0] === 'list' || args[0] === 'ls') {

// THIS IS BROKEN AS IT EXCEEDS THE LIMIT FOR A MESSAGE
          // start typing in discord
          // getWalletInfo();
          const { version, address_count, encrypted, locked } = getWalletInfo();
          if (locked !== true) {
            console.log('wallet lock check is good, unlocked');
          }
          else {
            console.log('Wallet Is Locked... Dont proceed');
            console.log(address_count + encrypted + version);
            return locked;
          }
          message.channel.startTyping();
          const promise = list();
          // assign this to a promise and get teh function into a result
          promise.then(function(result) {
            const res = result;
            // console.log(message + ' list Called');
            // console.log(res);
            message.channel.send(message + ' ' + args[0] + '\nOutput:\n' + res);
            // stop typing in discord
            message.channel.stopTyping();
          });
        }
*/
        if (args[0] === 'count' || args[0] === 'cnt') {
          // start typing in discord
          message.channel.startTyping();

          const { version, address_count, encrypted, locked } = getWalletInfo();

          console.error('output... ' + version + address_count + encrypted + locked);
          if (locked !== true) {
            console.log('wallet lock check is good, unlocked');
            // console.log('count called');
            const promise = count();
            // assign this to a promise and get teh function into a result
            promise.then(function(result) {
              const res = result;
              // console.log('QRL Wallet List Called');
              // console.log(res);
              message.channel.send(message + ' ' + args[0] + '\nOutput:\n' + res);
              // stop typing in discord
              message.channel.stopTyping();
            });
          }
          else {
            console.log('Wallet Is Locked... Dont proceed');
            console.log(address_count + encrypted + version);
            return locked;
          }
        }
        else if (args[0] === 'balance' || args[0] === 'bal') {
          // start typing in discord
          message.channel.startTyping();
          // console.log('balance called');
          // from module.exports = {  qrlState : qrlState, }; we import the function qrlState('')
          const promise = balance();
          // assign this to a promise and get teh function into a result
          promise.then(function(result) {
            const res = result;
            // console.log('QRL Wallet Balance Called');
            // console.log(res);
            message.channel.send(message + ' ' + args[0] + '\nOutput:\n' + res);
            // stop typing in discord
            message.channel.stopTyping();
          });
        }
        else if (args[0] === 'state' || args[0] === 'node') {
          // start typing in discord
          message.channel.startTyping();
          // from module.exports = {  qrlState : qrlState, }; // we import the function qrlState('')

          getNodeInfo().then(function(info) {
            // console.log('info: ' + info);
            const parsedInfo = JSON.parse(info);
            // console.log(parsedInfo.version + ', ' + parsedInfo.num_connections + ', ' + parsedInfo.num_known_peers + ', ' + parsedInfo.uptime + ', ' + parsedInfo.block_height + ', ' + parsedInfo.block_last_hash + ', ' + parsedInfo.network_id);
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .setTitle('Tipbot Node State')
              .setDescription('Details from the QRL Node running the tipbot')
              .addField('Version', '```yaml\n' + parsedInfo.version + '```', true)
              .addField('Network ID', '```yaml\n' + parsedInfo.network_id + '```', true)
              .addField('Number of Connections', '```yaml\n' + parsedInfo.num_connections + '```', true)
              .addField('Number of Known Peers', '```yaml\n' + parsedInfo.num_known_peers + '```', true)
              .addField('Node Uptime', '```yaml\n' + parsedInfo.uptime + '```', true)
              .addField('Block Height', '```yaml\n' + parsedInfo.block_height + '```', true)
              .addField('Block Last Hash', '```yaml\n' + parsedInfo.block_last_hash + '```', true)
              .setFooter('  .: Tipbot provided by The QRL Contributors :.');
            message.reply({ embed })
              .then(() => {
                message.channel.stopTyping(true);
              })
              .catch(error => {
                console.error(`Could not send message\n`, error);
                // ReplyMessage('it seems like I can\'t DM you! Do you have DMs disabled?');
              });
          });


          message.channel.stopTyping();
        }
        /*
        else if (args[0] === 'wallet' || args[0] === 'wal') {
          // start typing in discord
          message.channel.startTyping();
          // console.log('balance called');
          // from module.exports = {  qrlState : qrlState, }; we import the function qrlState('')
          const promise = createWallet();
          // assign this to a promise and get teh function into a result
          promise.then(function(result) {
            const res = result;
            // console.log('QRL Wallet Balance Called');
            // console.log(res);
            message.channel.send(message + ' ' + args[0] + '\nWallet Created:\n' + res);
            // stop typing in discord
            message.channel.stopTyping();
          });
        }
        else if (args[0] === 'encrypt' || args[0] === 'crypt') {
          // start typing in discord
          message.channel.startTyping();
          // console.log('encrypt called');
          // from module.exports = {  qrlState : qrlState, }; we import the function qrlState('')
          const promise = encrypt();
          // assign this to a promise and get teh function into a result
          promise.then(function(result) {
            const res = result;
            // console.log('QRL Wallet Balance Called');
            // console.log(res);
            message.channel.send(message + ' ' + args[0] + '\nOutput:\n' + res);
            // stop typing in discord
            message.channel.stopTyping();
          });
          message.channel.stopTyping();
        }
        else if (args[0] === 'lock' || args[0] === 'lk') {
          // start typing in discord
          message.channel.startTyping();
          // console.log('encrypt called');
          // from module.exports = {  qrlState : qrlState, }; we import the function qrlState('')
          const promise = lock();
          // assign this to a promise and get teh function into a result
          promise.then(function(result) {
            const res = result;
            // console.log('QRL Wallet Balance Called');
            // console.log(res);
            message.channel.send(message + ' ' + args[0] + '\nOutput:\n' + res);
            // stop typing in discord
            message.channel.stopTyping();
          });
          message.channel.stopTyping();
        }
        else if (args[0] === 'unlock' || args[0] === 'unlk') {
          // start typing in discord
          message.channel.startTyping();
          // console.log('encrypt called');
          // from module.exports = {  qrlState : qrlState, }; we import the function qrlState('')
          const promise = unlock();
          // assign this to a promise and get teh function into a result
          promise.then(function(result) {
            const res = result;
            // console.log('QRL Wallet Balance Called');
            // console.log(res);
            message.channel.send(message + ' ' + args[0] + '\nOutput:\n' + res);
            // stop typing in discord
            message.channel.stopTyping();
          });
          message.channel.stopTyping();
        }
        */
        else if (args[0] === 'getWalletInfo' || args[0] === 'gwi') {
          // start typing in discord
          message.channel.startTyping();
          // console.log('encrypt called');
          // from module.exports = {  qrlState : qrlState, }; we import the function qrlState('')
          const promise = getWalletInfo();
          // assign this to a promise and get teh function into a result
          promise.then(function(result) {
            const res = result;
            // console.log('QRL Wallet Balance Called');
            // console.log(res);
            message.channel.send(message + '\nOutput:\n' + res);
            // stop typing in discord
            message.channel.stopTyping();
          });
          message.channel.stopTyping();
        }
      }
    }
    else {
      console.log('tool attempt made...');
      console.log('admin\t' + admin);
      console.log('user\t' + user);
    }
  },
};