//=============================================================================
// ** Imports
//=============================================================================

const config = require("./config");
const MJSoulClient = require("./mjsoul");

//=============================================================================
// ** Main
//=============================================================================

const client = new MJSoulClient(config.mjsoulUrl);
client.run();