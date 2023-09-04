module.exports = (app, bot) => {
	app.post('/sendListMsg', async (req, res) => {
		const { queryId, shoppingList } = req.body;
		console.log(queryId);
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: Math.floor(Math.random() * Date.now()),
			title: 'Список покупок',
			input_message_content: {
				message_text: shoppingList.join(",\n")
			},
			reply_markup: {
				inline_keyboard: [
					[{ text: "Добавить рецепт 📝", callback_data: "addRecipe" }],
					[{ text: "Поиск 🔎", callback_data: "searchRecipe" }]
				]
			}
		})
		console.log('done');
		res.set('Access-Control-Allow-Origin', process.env.FrontURL);
		return res.json('nice');
	});
}