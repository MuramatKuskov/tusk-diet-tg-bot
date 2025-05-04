module.exports = (app, bot) => {
	app.post('/sendRecipeMsg', async (req, res) => {
		try {
			const { query_id, recipe } = req.body;

			await bot.answerWebAppQuery(query_id, {
				type: 'article',
				id: Math.floor(Math.random() * Date.now()),
				title: recipe.title,
				input_message_content: {
					message_text: `<b>${recipe.title.charAt(0).toUpperCase() + recipe.title.slice(1)}</b>
			
								<b><u>Ингредиенты</u></b>
								${recipe.ingredients.map((el, i) => {
						return recipe.quantities[i] ?
							`\n${el.charAt(0).toUpperCase()}${el.slice(1)} — ${recipe.quantities[i]}${recipe.units[i]}`
							:
							`\n${el.charAt(0).toUpperCase()}${el.slice(1)}`
					})}
								
								<b><u>Приготовление</u></b>
								${recipe.cook}
								${recipe.link && `<a href="${recipe.link}">Link</a>`}`,
					parse_mode: 'HTML',
				},
			});
			return res.json('Message sent');
		} catch (error) {
			console.error(error);
			return res.status(500).json(error);
		}
	});
}