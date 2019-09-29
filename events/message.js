frame = require('../fab/frame').discordFrame
inventory = require('../fab/inventory')
chars = require('../fab/chars')
stats = require('../fab/stats')
update = require('../fab/update')

module.exports = (client, message, db) => {
  
  console.log('message.js called')
  if(message.content.startsWith('!inventory')){
    (async (message, db, fn) => {
      await frame(message, db, fn)
    })(message, db, inventory)
  }
  if(message.content.startsWith('!chars')){
    (async (message, db, fn) => {
      await frame(message, db, fn)
    })(message, db, chars)
  }
  if(message.content.startsWith('!stats')){
    (async (message, db, fn) => {
      await frame(message, db, fn)
    })(message, db, stats)
  }
  else if (message.content.startsWith('!update')){
    (async (message, db, fn) => {
      await frame(message, db, fn)
    })(message, db, update)
  }
}