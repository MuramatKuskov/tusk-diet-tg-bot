const User = require('../schemas/User');

function handleChat() {
	TG_BOT.removeAllListeners();

	TG_BOT.on("message", async (msg) => {
		const chatId = msg.chat.id;
		if (msg.text !== "/start") {
			return await TG_BOT.sendMessage(chatId, "Начать общение с ботом: /start", { reply_markup: { inline_keyboard: [[{ text: "Start", callback_data: "start" }]] } });
		}

		const username = msg.from.username || (
			msg.from.last_name ?
				msg.from.first_name + msg.from.last_name :
				msg.from.first_name
		);

		User.aggregate([
			{
				$match: {
					tgID: +msg.from.id
				}
			},
			{
				$project: {
					tgID: 0,
					__v: 0,
				}
			}
		]).then(data => {
			if (!data.length) {
				User.create({ tgID: +msg.from.id, username: username })
			}
		});

		greet(chatId);
	});

	TG_BOT.on("callback_query", async query => {
		switch (query.data) {
			case "addRecipe":
				TG_BOT.removeAllListeners();
				createRecipe(query, handleChat);
				break;
			case "searchRecipe":
				TG_BOT.removeAllListeners();
				searchRecipe(query, handleChat);
				break;
			case "start":
				greet(query.message.chat.id);
				break;
		}
		TG_BOT.answerCallbackQuery(query.id);
	});
}

async function greet(chatId) {
	await TG_BOT.sendMessage(chatId, 'Yo, chief! Ready to cook? 🍳');
	await TG_BOT.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/c36/1c0/c361c044-f105-45f1-ba01-33626dfc1d57/9.webp', {
		// в данном случае нажатие кнопки вернет ее текст
		reply_markup: {
			inline_keyboard: [
				[{ text: "Добавить рецепт 📝", callback_data: "addRecipe" }],
				[{ text: "Поиск 🔎", callback_data: "searchRecipe" }]
			]
		}
	});
}

module.exports = handleChat;