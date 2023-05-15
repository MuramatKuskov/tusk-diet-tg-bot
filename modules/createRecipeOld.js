// Здесь просто код вырезанный из index.js, соответственно для его работы нужно добавить параметры с переменными, которые там остались

function createRecipe(title, ingredients, process, tags) {
	return {
		title,
		ingredients,
		process,
		tags
	}
}

async function addRecipe(chatId) {
	let steps = 1;
	let title, ingredients, process, tags, link;
	await bot.sendMessage(chatId, "Шаг 1 из 5: Введите название блюда", { reply_markup: { keyboard: [[{ text: "Отменить" }]] } });
	bot.on("message", async (msg) => {
		if (msg.text === "Отменить") {
			bot.removeListener("message");
			await bot.sendMessage(chatId, "Рецепт удален", { reply_markup: { keyboard: [[{ text: "Добавить рецепт" }]] } })
			return start();
		}
		if (msg.text === "Добавить рецепт") {
			bot.removeListener("message");
			return addRecipe(chatId)
		}

		switch (steps) {
			case 1:
				steps++;
				title = msg.text;
				await bot.sendMessage(chatId, `Шаг ${steps} из 5: Ингредиенты и их количество перечислите через запятую, например: "мука 100г, яйца 2шт"`);
				break;
			case 2:
				steps++;
				ingredients = msg.text.split(",");
				await bot.sendMessage(chatId, `Шаг ${steps} из 5: Опишите процесс приготовления`);
				break;
			case 3:
				steps++;
				process = msg.text;
				await bot.sendMessage(chatId, `Шаг ${steps} из 5: Введите теги через запятую`);
				break;
			case 4:
				steps++
				tags = msg.text.split(",").map(str => str.trim().startsWith("#") ? str : `#${str.trim()}`);
				await bot.sendMessage(chatId, `Шаг ${steps} из 5: Прикрепите ссылку на рецепт (опционально)`, { reply_markup: { keyboard: [[{ text: "Skip" }]] } });
				break;
			case 5:
				msg.text != "Skip" ? link = `\r\n<a href="${msg.text}">Ссылка на рецепт</a>\r\n` : link = "";
				let newRecipe = createRecipe(title, ingredients, process, tags);
				await bot.sendMessage(channelID,
					`<b>${newRecipe.title}</b>
				
				<b><u>Ингредиенты</u></b>
				${newRecipe.ingredients.map(el => { return `#${el.trim()}` }).join("\r\n")}
				
				<b><u>Приготовление</u></b>
				${newRecipe.process}
				${link}
				${newRecipe.tags.join(" ")}`,
					{ parse_mode: "HTML" })
				await bot.sendMessage(chatId, `Рецепт добавлен`, { reply_markup: { keyboard: [[{ text: "Добавить рецепт" }]] } });
				bot.removeListener("message");
				start();
		}
	})
}

module.exports = addRecipe;