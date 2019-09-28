fab = require('../fab')

module.exports = (client, message, db) => {
  
  console.log('message.js called')
  if(message.content.startsWith('!wasnda')){
    (async (message, db) => {
      await fab.wasnda(message, db)
    })(message, db)
  }
  else if (message.content.startsWith('!itisknown')){
    (async (message, db) => {
      await fab.itisknown(message, db)
    })(message, db)
    
  } else if (message.content.startsWith('!letitbeknown')){
    (async (message, db) => {
      await fab.letitbeknown(message, db)
    })(message, db)
  }
}