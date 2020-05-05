//============================================================================
// ** Imports
//============================================================================

const fs = require("fs");
const { v1: uuidv1 } = require('uuid');

const MJSoul = require("mjsoul");

const DiscordClient = require("./discord");
const config = require("./config");

//=============================================================================
// ** MJsoulClient
//=============================================================================

class MJSoulClient {

  //--------------------------------------------------------------------------
  // * Initialization Methods
  //--------------------------------------------------------------------------

  constructor(url) {
    this.discordClient = new DiscordClient(this);

    this.mjsoul = new MJSoul({ 'url': url });
    this.mjsoul.on(
      'NotifyCustomContestSystemMsg',
      this.handleNotifyContestSystemMsg.bind(this),
    );

    setInterval(this.sendPing.bind(this), 15000);
  }

  run() {
    this.mjsoul.open(this.onOpen.bind(this));
  }

  //--------------------------------------------------------------------------
  // * Login and Authentication Logic
  //--------------------------------------------------------------------------

  onOpen() {
    this.mjsoul.send(
      'oauth2Auth', 
      { type: 10, code: config.oauthToken, uid: config.userId },
      this.onConnect.bind(this),
    );
  };

  onConnect(data) {
    const accessToken = data['access_token'];
  
    this.mjsoul.send(
      'oauth2Login',
      { 
        type: 10,
        access_token: accessToken,
        reconnect: false,
        device: {
          device_type: 'pc',
          os: '',
          os_version: '',
          browser: 'windows',
        },
        random_key: uuidv1(),
        client_version: '0.6.252',
        currency_platforms: 2,
      },
      this.onLogin.bind(this),
    );
  }
  
  onLogin(data) {
    console.log(data);
  
    this.mjsoul.send('loginBeat', { contract: uuidv1() }, () => { 
      this.mjsoul.send('heatbeat', { no_operation_counter: 0 }, () => {

        this.mjsoul.send(
          'enterCustomizedContest', 
          { unique_id: config.tournamentId }, 
          () => {
            this.mjsoul.send(
              'joinCustomizedContestChatRoom',
              { unique_id: config.tournamentId },
            );
          });

      });
    });
  }

  //--------------------------------------------------------------------------
  // * Event Handlers
  //--------------------------------------------------------------------------

  handleNotifyContestSystemMsg(data) {
    console.log(data);  
  
    if (data.type !== 2 || !data.uuid) {
      return;
    }
  
    const channel = this.discordClient.channels.resolve(
      config.discordChannelId,
    );
  
    // Set a 15s delay between the game finishing and the logs being parsed.
    setTimeout(
      this.processHanchan.bind(this, data.uuid, channel),
      15000,
    );
  }  

  //--------------------------------------------------------------------------
  // * Parsing Helper Methods
  //--------------------------------------------------------------------------
  
  processHanchan(uuid, channel) {
    if (fs.existsSync('./logs/' + uuid + '.json')) {
      channel.send('Game already parsed.');
      return;
    }
  
    this.mjsoul.send(
      'fetchGameRecord',
      { game_uuid: uuid },
      data => {
        console.log(data);
        const usernames = data.head.accounts.map(account => account.nickname);
        
        const processLogData = (logData) => {
          const events = parser.parseLog(logData);
          this.saveParsedLog(channel, data.head.uuid, events, usernames);
        }
  
        if (data.data_url.length > 5) {
          MJSoul.record.parseById(data.head.uuid, processLogData);
        } else {
          processLogData(MJSoul.record.parse(data.data));
        }
      }
    );
  }

  saveParsedLog(channel, uuid, events, usernames) {
    const filename = './logs/' + uuid + '.json';
    const message = { players: usernames, events: events };
  
    const sendToDiscord = (err) => {
      if (err) {
        console.log(err);
        throw err;
      }
    
      channel.send(`Finished parsing game uuid: ${uuid} for ${usernames}.`);
    }
  
    fs.writeFile(filename, JSON.stringify(message), sendToDiscord);
  }

  //--------------------------------------------------------------------------
  // * Healthcheck
  //--------------------------------------------------------------------------

  sendPing() {
    this.mjsoul.send(
      'heatbeat',
      { no_operation_counter: 0 }, 
      data => console.log(data),
    );
  }

}

//=============================================================================
// ** Exports
//=============================================================================

module.exports = MJSoulClient;