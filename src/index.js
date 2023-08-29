// сторонние пакеты
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Recipe = require('./schemas/Recipe.js');
require('dotenv').config();
// свои импорты
const createRecipe = require('./modules/createRecipe');
const pushRecipe = require('./endpoints/pushRecipe.js');
const getRecipes = require('./endpoints/getRecipes.js');
const searchRecipe = require('./modules/searchRecipe.js');
const healthCheck = require('./endpoints/healthCheck.js');

const token = process.env.token.replace(/'/g, '');
const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 8080;

// Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(token, { polling: true });
const bot = new TelegramBot(process.env.debugToken, { polling: true });

const app = express();
// middleware парсить жсон
app.use(express.json());
// mw для кроссдоменных запросов (для облачного бэка)
app.use(cors());

async function handleChat() {
	bot.removeAllListeners();
	async function greet(chatId) {
		await bot.sendMessage(chatId, 'Wtf do you looking for?');
		await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/c36/1c0/c361c044-f105-45f1-ba01-33626dfc1d57/9.webp', {
			// в данном случае нажатие кнопки вернет ее текст
			reply_markup: {
				inline_keyboard: [
					[{ text: "Добавить рецепт 📝", callback_data: "addRecipe" }],
					[{ text: "Поиск 🔎", callback_data: "searchRecipe" }]
				]
			}
		});
	}

	bot.on("message", async (msg) => {
		const chatId = msg.chat.id;
		if (msg.web_app_data?.length) {
			return await bot.sendMessage(chatId,
				`<b>Список покупок</b>
				${msg.web_app_data.map(el => {
					return `\n${el.name} ${el.quantity || ""} ${el.unit || ""}`
				})}
				`,
				{
					parse_mode: "HTML", reply_markup: {
						inline_keyboard: [
							[{ text: "Добавить рецепт 📝", callback_data: "addRecipe" }],
							[{ text: "Поиск 🔎", callback_data: "searchRecipe" }]
						]
					}
				}
			)
		}
		if (msg.text !== "/start") {
			return await bot.sendMessage(chatId, "Начать общение с ботом: /start", { reply_markup: { inline_keyboard: [[{ text: "Start", callback_data: "start" }]] } });
		}
		greet(chatId);
	})

	bot.on("callback_query", async query => {
		switch (query.data) {
			case "addRecipe":
				bot.removeAllListeners();
				createRecipe(query, bot, handleChat);
				break;
			case "searchRecipe":
				bot.removeAllListeners();
				searchRecipe(query, bot, handleChat);
				break;
			case "start":
				greet(query.message.chat.id);
				break;
		}
		// обязательно отвечаем на запрос
		bot.answerCallbackQuery(query.id);
	});
};

app.get('/', async (req, res) => {
	return res.json('Hello, World!');
})

async function startServer() {
	try {
		await mongoose.connect(DB_URL, { autoIndex: false });
		app.listen(PORT, () => { console.log(`Server started on port ${PORT}!`); });
		handleChat();
		// эндпоинты
		pushRecipe(app);
		getRecipes(app);
		healthCheck(app);
	} catch (e) {
		console.log(e);
	}
}

startServer();
