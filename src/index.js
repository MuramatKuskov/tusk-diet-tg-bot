// сторонние пакеты
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
// свои импорты
const router = require('./routes/index.js');
const handleChat = require('./modules/handleChat.js');

const token = process.env.token.replace(/'/g, '');
// const token = process.env.debugToken;
const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 8080;

// Create a bot that uses 'polling' to fetch new updates
global.TG_BOT = new TelegramBot(token, { polling: true });

const app = express();
// middleware парсить жсон
app.use(express.json());
// mw для кроссдоменных запросов
app.use(cors({
	origin: process.env.FrontURL,
}));
app.use('/api', router);

async function main() {
	try {
		await mongoose.connect(DB_URL, { autoIndex: false });
		app.listen(PORT, () => { console.log(`Server started on port ${PORT}!`); });
		handleChat();
	} catch (e) {
		console.log(e);
	}
}

main();
