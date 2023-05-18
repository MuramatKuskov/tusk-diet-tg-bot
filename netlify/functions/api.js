const express = require('express');
const cors = require('cors');
const app = express();
const bot = require('../../src/index');

// middleware парсить жсон
app.use(express.json());
// mw для кроссдоменных запросов (для облачного бэка)
app.use(cors());
// обработка входящего запроса
app.post('/web-data', async (req, res) => {
	const { queryId, newRecipe } = req.body;
	// dataBase.push(newRecipe)
	try {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Успех',
			input_message_content: { message_text: 'Рецепт добавлен' }
		});
		return res.status(200).json({});
	} catch (error) {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Неудача',
			input_message_content: { message_text: 'Не удалось добавить рецепт: ' + error }
		});
		return res.status(500).json({});
	}
})

const PORT = 8080;
app.listen(PORT, () => { console.log('Server started!'); });