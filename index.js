const path = require('path')
const fs = require('fs')
const url = require('url')
const https = require('https')
const config = require('config')
const TelegramBot = require('node-telegram-bot-api')
const speech = require('@google-cloud/speech')

//=================================//

const voicePath = path.join(__dirname, '/voices')

const token = config.get('botToken')

//=================================//

const bot = new TelegramBot(token, {polling: true})

const client = new speech.SpeechClient();

//=================================//

bot.on('voice', msg => {

	const chatId = msg.chat.id
	const messageId = msg.message_id

	bot.deleteMessage(chatId, messageId)
	bot.sendSticker(chatId, 'CAACAgIAAx0CRKn0SgACoh5fXhZghfXoKBKacdFkLirxFaUSPAACSQIAAladvQoqlwydCFMhDhsE')

	bot.downloadFile(msg.voice.file_id, voicePath)
	.then(async fileName => {
		
		const file = fs.readFileSync(fileName)
		// fs.unlink(fileName, () => {})
		const audioBytes = file.toString('base64')
		
		const request = {

			config: {
				encoding: "LINEAR16",
				sampleRateHertz: 16000,
				languageCode: "uk-UA",
			},
			audio: {
				content: audioBytes
			}

		}

		const [response] = await client.recognize(request)
		const transcription = response.results
			.map(result => result.alternatives[0].transcript)
			.join('\n')

		// console.log([response])
	
	})

})

//bot.on('sticker', msg => {
//
//    console.log(msg);
//
//})