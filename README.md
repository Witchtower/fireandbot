# fireandbot - Discord bot of the Fire and Blood Classic Guild @Razorfen

## Features / HowTo

### Export Bankchar data with Guild Bank Classic AddOn

* open bags and bank with [gbc-addon](https://www.wowinterface.com/downloads/info25187-ClassicGuildBank.html) loaded
* type ```/gbc``` and copy the text
* go to discord channel that the bot can read and type ```!update``` followed by a space and then paste the copied text before pressing enter
* the bot now saves the items and quantity for the bankchar, tells you it did and then starts fetching items names from wowhead classic

### Display inventory

* type ```!inventory``` to display summary of all items held by all bankchars
* type ```!inventory <charname1> <charname2> ...``` to display a summary of items held by specific characters

### Display bankchars

* type ```!chars``` to list bankchars

### Statistics

* type ```!stats``` to see statistics

### Access control via discord

When you add the bot to a server, give it a custom role, and let it only read the channels you want it to read and answer to

We currently have 2 channels, one where people request items, and one that is writeable only by the bot and the 
bankchar owners. If someone wants to update the database with the items he holds on his bankchar, he ```!update```s the
database and after a little while (give the bot some time to fetch item names from wowhead) he calls ```!inventory``` so people can see what's in the bank.

### Planned features

i'm no longer working on this project, don't wait for these updates: they'll probably never come

* track item requests from players to be able to
* display bankchar wise "send x item to <player>" lists

### Maybe somewhere in the far future features

* balance inventory between bankchars to ensure optimal response times

## Installation

Install nodejs, npm, pm2 however you see fit

clone repo

make .env file in cloned folder with contents:

```
BOT_TOKEN=<yourdiscordbottoken>
DATABASE=fab.db
```

create database according to the ```create_db.sql``` file with sqlite3

start bot with pm2

test bot in discord with ```!inventory``` command (the create_db.sql file should insert a testchar with a testitem)

if that works, stop the bot and delete the entries in the database with sqlite3

start the bot again and you're good to go

tell me if something doesn't work/crashes
