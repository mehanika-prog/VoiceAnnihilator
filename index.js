const TelegramBot = require('node-telegram-bot-api')

const token = '1384093348:AAEheFAHfeFQu-goUxKTq0qOI0WVZSZZjuU'

const bot = new TelegramBot(token, {polling: true})

bot.on('voice', msg => {

    const chatId = msg.chat.id
    const messageId = msg.message_id
    bot.deleteMessage(chatId, messageId)
    bot.sendSticker(chatId, 'CAACAgIAAx0CRKn0SgACoh5fXhZghfXoKBKacdFkLirxFaUSPAACSQIAAladvQoqlwydCFMhDhsE')

})

//bot.on('sticker', msg => {
//
//    console.log(msg);
//
//})