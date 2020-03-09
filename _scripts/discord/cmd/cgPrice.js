module.exports = {
  name: 'cgPrice',
  description: 'CoinGecko price',
  args: false,
  aliases: ['cgprice', 'price'],
  guildOnly: false,
  cooldown: 5,
  usage: 'ping the CoinGecko API',
  // execute(message, args) {
    /* :::: TODO :::: /*
    :::::::::::::::::::
       - Add a nice chart here to the price query
    */
  execute(message) {
    message.channel.startTyping();
    console.log('price CG called:');
    const Discord = require('discord.js');
    const cg = require('../../coinGecko/price.js');
    const cgPrice = cg.cgPrice;
    const promise = cgPrice();
    promise.then(function(result) {
      const res = result;
      const embed = new Discord.RichEmbed()
        .setColor(0x000000)
        .setFooter('Details from', 'http://i.imgur.com/w1vhFSR.png')
        .setTimestamp()
        .addField('CoinGecko-API Price\n',
          `\`${res}\``);
      message.channel.send({ embed })
        .then(message => message.channel.stopTyping())
        .catch(console.error);
    });
  },
};
