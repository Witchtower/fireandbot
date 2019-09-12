require('dotenv').config()
const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()
const db = require('better-sqlite3')('fab.db', { verbose: console.log });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})



fs.readdir('./events/', (err, files) => {
    files.forEach(file => {
      const eventHandler = require(`./events/${file}`)
      const eventName = file.split('.')[0]
      client.on(eventName, arg => eventHandler(client, arg, db))
    })
  })

client.login(process.env.BOT_TOKEN)