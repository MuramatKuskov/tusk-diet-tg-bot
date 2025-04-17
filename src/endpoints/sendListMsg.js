module.exports = (app, bot) => {
	app.post('/sendListMsg', async (req, res) => {
		const { queryId, shoppingList } = req.body;
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: Math.floor(Math.random() * Date.now()),
			title: 'Список покупок',
			input_message_content: {
				message_text: shoppingList.map(entry => {
					return `${entry.name} ${entry.quantity || ""} ${entry.unit || ""}`
				}).join(",\n")
			}
		})
		// res.set('Access-Control-Allow-Origin', process.env.FrontURL);
		return res.json('nice');
	});
}