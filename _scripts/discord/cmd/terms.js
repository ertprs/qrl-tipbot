module.exports = {
  name: 'terms',
  description: 'Prints the Terms and Conditions for using the TipBot',
  args: false,
  aliases: ['term', 'legal', 'conditions', 'rules'],
  guildOnly: false,
  usage: ' \n## Add your user to the QRL TipBot, creates an address and allows tipping.',
  cooldown: 0,
  execute(message) {
    if(message.guild != null) {
      message.delete();
    }
    message.author.send(` 
            __**TipBot Terms and Conditions**__
Use of this TipBot and any function it may provide to you, as the user, is at your risk. By using this service you agree to hold Tipbot, it's operators and all parties involved at no financial responsibility for any loss or perceived loss you may incur by using this service. By using this service you agree to not hold liable, for any reasons the owner, operators or any affiliates of the QRL TipBot, qrl.tips or any other party associated with this service. By using this service, you agree to not abuse or misuse the service. Abuse of this service may result in a ban from the service and if warrented legal action may be taken. By using this service you as the user agree to share information about your social media aaccount that was used to sign up to the service. At no point will this information be sold or used for any purpose other than this TipBot service.

**You take all risk by using this service and agree to not hold liable the owners and operators for any reason**

    `);
    message.author.send(`
            :exclamation: __**RULES**__ :exclamation:
:small_orange_diamond: *This service is for tipping or giving small amounts of QRL to other users, You agree to not use this to trade currency or for any other reason*
:small_orange_diamond: *You will not store large amounts of QRL in this address*
:small_orange_diamond: *Any balance that is larger than you are willing to lose, you take responsibility for transfering out of the tipbot, using the \`+transfer\` function*
:small_orange_diamond: *You will not break any law, in any jurisdiction by using this bot in any way that is not intended or identified in these rules *
:small_orange_diamond: *Any tips sent to a user that has not signed up will be saved for that user for a length of time determined by the bot owner. Failure of the user to collect tips in this time may result in a loss of funds for that user.*
:small_orange_diamond: *Tips will never be refunded or returned to a user, for any reason. A tip is final once sent.*
:small_orange_diamond: *Any abuse of the service will result in a ban and if warranted legal action.*

__**IF YOU AGREE TO THESE TERMS**__ \`+agree\`
__**IF YOU DO NOT AGREE TO THESE TERMS**__ \`+opt-out\`
    `)
  },


};