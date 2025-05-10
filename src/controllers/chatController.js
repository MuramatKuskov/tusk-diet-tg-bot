class chatController {
	static async sendRecipe(req, res) {
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
	}

	static async sendList(req, res) {
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
	}
}

module.exports = chatController;