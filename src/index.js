// сторонние пакеты
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Recipe = require('./schemas/Recipe.js');
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
	try {
		await Recipe.create(req.body.recipe);
		return res.json('nice');
	} catch (error) {
		return res.status(500).json(error);
	}
})

app.get('/', (req, res) => {
	try {
		res.json('Server is running...');
	} catch (e) {
		res.status(500).json(e);
	}
});

app.get('/getRecipes', async (req, res) => {
	console.log(req.query);
	try {
		const data = await Recipe.find(req.query);
		return res.json(data);
	} catch (e) {
		console.log(e);
		return res.status(500).json(e);
	}
})

const PORT = 8080;

async function startServer() {
	try {
		await mongoose.connect(DB_URL);
		app.listen(PORT, () => { console.log(`Server started on port ${PORT}!`); });
		// вот так просто получать данные из базы
		//await Recipe.find({ title: 'Банановый брауни' });
	} catch (e) {
		console.log(e);
	}
}

startServer();
start();
