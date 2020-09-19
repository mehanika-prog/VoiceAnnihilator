const path = require('path')
const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')
const speech = require('@google-cloud/speech')
const sqlite3 = require('sqlite3').verbose()

//=================================//

const voicePath = path.join(__dirname, '/voices')
const dbPath = path.join(__dirname, '/databases', '/va3000.sqlite3')

//=================================//

const bot = new TelegramBot(process.env. TELEGRAM_BOT_TOKEN, {polling: true})

const client = new speech.SpeechClient();

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, err => {

	if (err) console.log(err.message);

});

//=================================//

bot.onText(/\/start/, msg => {

	if (msg.chat.type === 'private') {

		const chatId = msg.from.id
		const is_bot = msg.from.is_bot
		const first_name = msg.from.first_name
		const last_name = msg.from.last_name
		const username = msg.from.username
		let language_code = msg.from.language_code

		switch (language_code) {

			case 'en': language_code = 'en-US'; break
			case 'sk': language_code = 'sk-SK'; break
			case 'ru': language_code = 'ru-RU'; break
			case 'uk': language_code = 'uk-UA'; break
			default: language_code = 'ru-RU'; break

		}

		db.get('SELECT * FROM Users WHERE id = ?', chatId, (err, row) => {

			if (row) {

				

			}else{

				db.run('INSERT INTO Users (id, is_bot, voice_to_text, first_name, last_name, username, language_code) VALUES (?, ?, 0, ?, ?, ?, ?)', 

						chatId, is_bot, first_name, last_name, username, language_code, (err) => {

							if (err) console.log(err)

							bot.sendMessage(chatId, 'HI =)')

						}

				)

			}

		})

	}

})

bot.onText(/\/cl/, msg => {

	if (msg.chat.type === 'private') {

		const chatId = msg.from.id
		// const is_bot = msg.from.is_bot
		// const first_name = msg.from.first_name
		// const last_name = msg.from.last_name
		// const username = msg.from.username
		// let language_code = msg.from.language_code

		bot.sendMessage(chatId, 'Please select a language.', {

			reply_markup: {

				inline_keyboard: [

					{
						text: 'English',
						callback_data: 'en-US'	
					},
					{
						text: 'Slovenčina',
						callback_data: 'sk-SK'	
					},
					{
						text: 'Русский',
						callback_data: 'ru-RU'	
					},
					{
						text: 'Українська',
						callback_data: 'uk-UA'	
					}

				]

			}

		})

	}

})

bot.on('voice', msg => {

	const user_id = msg.from.id
	const chatId = msg.chat.id
	const messageId = msg.message_id

	bot.deleteMessage(chatId, messageId)

	db.get('SELECT voice_to_text, language_code FROM Users WHERE id = ?', user_id, (err, row) => {

		if (row){

			if (row.voice_to_text) {

				bot.downloadFile(msg.voice.file_id, voicePath)
				.then(async fileName => {
					
					const file = fs.readFileSync(fileName)
					const audioBytes = file.toString('base64')
					
					const request = {
			
						config: {
							encoding: "OGG_OPUS",
							sampleRateHertz: 16000,
							languageCode: row.language_code,
						},
						audio: {
							content: audioBytes
						}
			
					}
			
					const [response] = await client.recognize(request)
					const transcription = response.results
						.map(result => result.alternatives[0].transcript)
						.join('\n')
			
					bot.sendMessage(chatId, `${msg.from.first_name} ${msg.from.last_name} say:\n\n${transcription}`)
			
					fs.unlink(fileName, () => {})
				
				})

			}else{
	
				bot.sendSticker(chatId, 'CAACAgIAAx0CRKn0SgACoh5fXhZghfXoKBKacdFkLirxFaUSPAACSQIAAladvQoqlwydCFMhDhsE')
	
			}

		}else{
	
			bot.sendSticker(chatId, 'CAACAgIAAx0CRKn0SgACoh5fXhZghfXoKBKacdFkLirxFaUSPAACSQIAAladvQoqlwydCFMhDhsE')

		}

	})

})

bot.on('sticker', msg => {

	if (msg.chat.type === 'private') bot.sendMessage(msg.chat.id, `${JSON.stringify(msg)}`)

})