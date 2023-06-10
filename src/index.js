// сторонние пакеты
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Recipe = require('./Recipe.js');
require('dotenv').config();
// свои импорты
const createRecipe = require('./modules/createRecipe');

const token = process.env.token.replace(/'/g, '');
const channelID = process.env.channelID;
const DB_URL = process.env.DB_URL;

// Create a bot that uses 'pollinpushRecipeg' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const app = express();
// middleware парсить жсон
app.use(express.json());
// mw для кроссдоменных запросов (для облачного бэка)
app.use(cors());

async function start() {
	bot.on("message", async (msg) => {
		const chatId = msg.chat.id;
		switch (msg.text) {
			case "/start":
				await bot.sendMessage(chatId, 'Wtf do you looking for?');
				await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/c36/1c0/c361c044-f105-45f1-ba01-33626dfc1d57/9.webp', {
					// в данном случае нажатие кнопки вернет ее текст
					reply_markup: {
						keyboard: [
							[{ text: "Добавить рецепт" }]
						]
					}
				});
				return 0;
			case "Добавить рецепт":
				bot.removeListener("message");
				createRecipe(chatId, bot, channelID, start);
				break;
			default:
				bot.sendMessage(chatId, "Invalid command/text", {
					// в данном случае нажатие кнопки вернет ее текст
					reply_markup: {
						keyboard: [
							[{ text: "Добавить рецепт" }]
						]
					}
				});
				return 0;
		}
	})
}

// обработка входящего запроса
app.post('/pushRecipe', async (req, res) => {
	console.log('post req accepted');
	console.log(req.body);
	const { img, title, ingredients, process, link, tags } = req.body;
	const recipe = await Recipe.create({ img, title, ingredients, process, link, tags });
	res.json(recipe);
	/* const { queryId, newRecipe } = req.body;
	// dataBase.push(newRecipe)
	try {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Успех',
			input_message_content: { message_text: 'Рецепт добавлен' }
		});
		return res.status(200).json({});
	} catch (error) {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Неудача',
			input_message_content: { message_text: 'Не удалось добавить рецепт: ' + error }
		});
		return res.status(500).json({});
	} */
	//res.send("Gotcha");
})

app.get('/smth', async (req, res) => {
	return res.json("Gotcha")
});

app.get('/', (req, res) => {
	try {
		res.json('Server is running...');
	} catch (e) {
		res.status(500).json(e);
	}
});

const PORT = 8080;
async function startServer() {
	try {
		await mongoose.connect(DB_URL);
		app.listen(PORT, () => { console.log(`Server started on port ${PORT}!`); });
	} catch (e) {
		console.log(e);
	}
}

startServer();
start();
