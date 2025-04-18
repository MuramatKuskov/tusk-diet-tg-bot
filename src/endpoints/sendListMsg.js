module.exports = (app, bot) => {
	app.post('/sendListMsg', async (req, res) => {
		const { query_id, shoppingList } = req.body;
		await bot.answerWebAppQuery(query_id, {
			type: 'article',
			id: Math.floor(Math.random() * Date.now()),
			title: 'Список покупок',
			input_message_content: {
				message_text: shoppingList.map(entry => {
					return `${entry.name} ${entry.quantity || ""} ${entry.unit || ""}`
				}).join(",\n")
			}
		});
		return res.json('nice');
	});
}