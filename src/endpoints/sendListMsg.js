module.exports = (app, bot) => {
	app.post('/sendListMsg', async (req, res) => {
		const { queryId, shoppingList } = req.body;
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			title: 'Список покупок',
			input_message_content: shoppingList.join(",\n"),
			reply_markup: {
				inline_keyboard: [
					[{ text: "Добавить рецепт 📝", callback_data: "addRecipe" }],
					[{ text: "Поиск 🔎", callback_data: "searchRecipe" }]
				]
			}
		})
		res.set('Access-Control-Allow-Origin', process.env.FrontURL);
		return res.json('nice');
	});
}