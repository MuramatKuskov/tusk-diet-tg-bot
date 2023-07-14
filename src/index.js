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

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const app = express();
// middleware парсить жсон
app.use(express.json());
// mw для кроссдоменных запросов (для облачного бэка)
app.use(cors());

async function handleChat() {
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
				createRecipe(chatId, bot, channelID, handleChat);
				break;
			default:
				bot.sendMessage(chatId, "Invalid command/text", {
					// в данном случае нажатие кнопки отправит боту ее текст
					reply_markup: {
						keyboard: [
							[{ text: "Добавить рецепт" }]
						]
					}
				});
				return 0;
		}
	})
};

app.post('/pushRecipe', async (req, res) => {
	try {
		await Recipe.create(req.body.recipe);
		return res.json('nice');
	} catch (error) {
		return res.status(500).json(error);
	}
});

app.get('/getRecipes', async (req, res) => {
	//console.log(req.query);
	try {
		const pipeline = [];

		if (req.query.title) {
			pipeline.push({
				$search: {
					index: 'title',
					autocomplete: {
						path: 'title',
						query: req.query.title
					}
				}
			})
		};

		if (req.query.type) {
			pipeline.push({
				$match: {
					type: req.query.type
				}
			})
		}

		if (req.query.ingredients) {
			pipeline.push({
				$match: {
					ingredients: req.query.ingredients
				}
			})
		}

		/* if (req.query.project) {
			pipeline.push({
				$project: {
					title: 1,
					_id: 1,
					rating: 1,
				}
			})
		} */

		let data;
		if (!pipeline.length) {
			data = await Recipe.find().limit(10);
		} else {
			data = await Recipe.aggregate(pipeline);
		}

		return res.json(data);
	} catch (e) {
		console.log(e);
		return res.status(500).json(e);
	}
});

const PORT = 8080;

async function startServer() {
	try {
		await mongoose.connect(DB_URL, { autoIndex: false });
		app.listen(PORT, () => { console.log(`Server started on port ${PORT}!`); });
		handleChat();
	} catch (e) {
		console.log(e);
	}
}

startServer();
