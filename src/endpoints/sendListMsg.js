module.exports = (app, bot, chatId) => {
	app.get('/sendListMsg', async (req, res) => {
		await bot.sendMessage(chatId, req.body, {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Добавить рецепт 📝", callback_data: "addRecipe" }],
					[{ text: "Поиск 🔎", callback_data: "searchRecipe" }]
				]
			}
		});
		res.set('Access-Control-Allow-Origin', process.env.FrontURL);
		return res.json('nice');
	});
}