//============================================================================
// ** Imports
//============================================================================

const Discord = require('discord.js');

const config = require('./config');

//============================================================================
// ** Discord Client
//============================================================================

class DiscordClient {

  constructor(mjsoul) {
    this.mjsoul = mjsoul;

    this.client = new Discord.Client();

    this.client.once('ready', () => console.log('Ready!'));
    this.client.on('message', this.onMessage.bind(this));

    this.client.login(config.discordAuthToken);
  }

  //--------------------------------------------------------------------------
  // * Event Handlers
  //--------------------------------------------------------------------------

  onMessage(message) { 
    if (message.channel.id !== config.discordChannelId) {
      return;
    }
  
    if (!config.authorizedUsernames.includes(message.author.username)) {
      return;
    }
  
    const body = message.content.split(' ');
  
    switch (body[0]) {
      case '!bot_ping':
        this.sendPing(message.channel);
        break;
      case '!game_list':
        this.processFetchGameList(body, message.channel);
        break;
      case '!parse_hanchan':
        this.mjsoul.processHanchan(body[1], message.channel);
        break;
      default:
        break;
    }
  }

  //---------------------------------------------------------------------------
  // * Event Logic
  //---------------------------------------------------------------------------

  sendPing(channel) {
    channel.send('Pong!');
  }

  processFetchGameList(body, channel) {
    const recentGames = (body[1] ? body[1] : 5);
  
    this.mjsoul.send(
      'fetchCustomizedContestGameRecords',
      { unique_id: config.tournamentId },
      data => { 
        data.record_list.slice(0, recentGames).forEach(game => {
          const usernames = game.accounts.map(account => account.nickname);
          const uuid = game.uuid;
  
          channel.send(`UUID: ${uuid}\nPlayers: ${usernames}`);
        }); 
      },
    );
  }

}

//============================================================================
// ** Exports
//============================================================================

module.exports = DiscordClient;