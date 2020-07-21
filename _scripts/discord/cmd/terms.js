module.exports = {
  name: 'terms',
  description: 'Prints the Terms and Conditions for using the TipBot',
  args: false,
  aliases: ['term', 'legal', 'conditions', 'rules'],
  guildOnly: false,
  usage: ' \n## Add your user to the QRL TipBot, creates an address and allows tipping.',
  cooldown: 0,
  execute(message) {
    message.reply(' Check your DM\'s')
    message.author.send(` 
            __**TipBot Terms and Conditions**__

Use of this TipBot and any function it may provide to you, as the user, is at your risk. By using this service you agree to not hold liable, for any reasons, the owner, operators, or any affiliates of the QRL TipBot, qrl.tips or any other party associated with this service.

:small_orange_diamond: By using this service, you agree to not abuse or misuse the service and will follow the rules listed below. 
:small_orange_diamond: Abuse of this service may result in a ban from the service and if warranted legal action may be taken. 
:small_orange_diamond: By using this service you agree to share information about your social media account used for signup to the TipBot service including but not limited to, service user name(s), service user ID(s), all interactions and messages with the bot, and any other public information available through the social media API services.
:small_orange_diamond: At no point will this information be sold or used for any purpose other than this TipBot service, and is only stored for the purpose of managing your accounts.
:small_orange_diamond: The Tip Bot will never share any Private Keys with the user. 
:small_orange_diamond: All funds must be withdrawn to a user controlled account. 
:small_orange_diamond: Any funds left on the bot may be lost at any time, and the user agrees that this is an acceptable loss. 
:small_orange_diamond: Funds shall be withdrawn from the bot regularly into user controlled wallets.
:small_orange_diamond: Users will not store large amounts of funds in any tipbot wallet

**You assume all risk by using this service**

                    `);
                    message.author.send(`
           :exclamation: __**RULES**__ :exclamation:

:exclamation: *All tips are final once sent. Tips will never be refunded or returned to a user, for any reason.*
:exclamation: *This service is for tipping or giving small amounts of QRL to other users.*
:exclamation: *You agree to not store or trade currency or for any other reason than tipping users.*
:exclamation: *You will not store large amounts of QRL in this address at any time.*
:exclamation: *You take full responsibility for transferring funds out of the Tipbot, using the \`+transfer\` function into wallets you control.*
:exclamation: *You will not use this bot if it will in any way break any law, in any jurisdiction. \`+opt-out\` to disable your account.*
:exclamation: *You will not use this bot in any way that is not intended or identified in these rules.*
:exclamation: *Any tips sent to a user that has not signed up will be saved by the bot for that user. Failure of the user to collect tips in this time may result in a loss of funds for that user and they will not be returned to the sender. These lost tips will fund the faucet and cover any operational costs that may incur.*
:exclamation: *Any abuse of the service will result in a ban, and if warranted legal action may be taken accordingly. Funds will not be returned to banned users.*

**You must \`+agree\` with these terms to use the bot!**
                    `);
    if(message.guild != null) {
      message.delete();
    }
  },


};