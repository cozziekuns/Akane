
# Akane

MJSoul Scraping Bot

## Install  

1. You will need: ``nodejs``, ``npm``. Install them however you need.

2. Install the necessary packages via ``npm install``.

3. Create your own discord bot via the discord developer portal and obtain its Auth Token. Find the [channel ID](https://github.com/Chikachi/DiscordIntegration/wiki/How-to-get-a-token-and-channel-ID-for-Discord) for the discord channel you want the bot to post in, and add both of these values to your ``config.secret.js`` file.

4. Create and login to a dummy Majsoul account via Twitter (must be via Twitter). Open up the developer tools in Google Chrome. Go to the Network tab and refresh the page.

5. Filter only for WS requests, and look at the first binary message. It should have a message like:
![websocket_1](https://puu.sh/FGMNd/86d76441cf.png)
``....lq.Lobby.oauth2Auth... jibberish..numbers``
The first set of jibberish is your oauth token, and the numbers at the end is your user id. Add both of those values to your ``config.secret.js`` file.

6. Find the tournament ID. This can be done by joining your tournament via the dummy majsoul account, and then looking for this websocket message:
![websocket_2](https://puu.sh/FGMJ8/4fa7f975fa.png)
Then, enter the last 6 values (in this case, ``08b417``) into the hex textbox of this decoder: https://protogen.marcgravell.com/decode. Add this decoded value (in this case, 2996) to your ``config.secret.js``  file. 

7. Rename ``config.secret.js`` to ``config.js``

8. Run ``node main.js`` in your favourite terminal.