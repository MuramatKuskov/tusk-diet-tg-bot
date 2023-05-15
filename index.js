const TelegramBot = require('node-telegram-bot-api');
const createRecipe = require('./modules/createRecipe');

const token = '6242230676:AAF_ru5tBhmsLdvsO5PTKqm_2MjOGOHqDzw';
const channelID = -1001476634890;
const msgId = 2;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const dataBase = bot.getChat(channelID).then(chat => {
	return JSON.parse(chat.pinned_message.text);
});

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



start();