async function createRecipe(chatId, bot, channelID, handleChat) {
	async function handleInput(msg) {
		bot.removeListener("message");
		if (msg.text === "Отменить") {
			await bot.sendMessage(chatId, "Рецепт удален", { reply_markup: { keyboard: [[{ text: "Добавить рецепт" }]] } });
			return handleChat();
		}
		return true;
	}

	async function getTitle() {
		await bot.sendMessage(chatId, "Шаг 1 из 5: Введите название блюда", { reply_markup: { keyboard: [[{ text: "Отменить" }]] } });
		return bot.on("message", async (msg) => {
			if (await handleInput(msg)) return (getIngredients(msg.text));
		});
	}

	async function getIngredients(title) {
		await bot.sendMessage(chatId, `Шаг 2 из 5: Ингредиенты и их количество перечислите через запятую, например: "мука 100г, яйца 2шт"`, { reply_markup: { keyboard: [[{ text: "Отменить" }]] } });
		return bot.on("message", async (msg) => {
			if (await handleInput(msg)) return (getProcess(title, msg.text.split(",").map(el => { return `#${el.trim()}` }).join("\r\n")))
		});
	}

	async function getProcess(title, ingredients) {
		await bot.sendMessage(chatId, `Шаг 3 из 5: Опишите процесс приготовления`, { reply_markup: { keyboard: [[{ text: "Отменить" }]] } });
		return bot.on("message", async (msg) => {
			if (await handleInput(msg)) return getTags(title, ingredients, msg.text);
		});
	}

	async function getTags(title, ingredients, process) {
		await bot.sendMessage(chatId, `Шаг 4 из 5: Введите теги через запятую`, { reply_markup: { keyboard: [[{ text: "Отменить" }]] } });
		return bot.on("message", async (msg) => {
			if (await handleInput(msg)) return getLink(title, ingredients, process, msg.text.split(",").map(str => str.trim().startsWith("#") ? str : `#${str.trim()}`).join(" "));
		})
	}

	async function getLink(title, ingredients, process, tags) {
		await bot.sendMessage(chatId, `Шаг 5 из 5: Прикрепите ссылку на рецепт (опционально)`, { reply_markup: { keyboard: [[{ text: "Skip" }], [{ text: "Отменить" }]] } });
		return bot.on("message", async (msg) => {
			if (await handleInput(msg)) return (pushRecipe(title, ingredients, process, tags, msg.text != "Skip" ? `\r\n<a href="${msg.text}">Ссылка на рецепт</a>\r\n` : ""))
		})
	}

	async function pushRecipe(title, ingredients, process, tags, link) {
		await bot.sendMessage(channelID,
			`<b>${title}</b>
				
				<b><u>Ингредиенты</u></b>
				${ingredients}
				
				<b><u>Приготовление</u></b>
				${process}
				${link}
				${tags}`,
			{ parse_mode: "HTML" });
		await bot.sendMessage(chatId, `Рецепт добавлен`, { reply_markup: { keyboard: [[{ text: "Добавить рецепт" }]] } });
		bot.removeListener("message");
		handleChat();
	}
	getTitle();
}

module.exports = createRecipe;