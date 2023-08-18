const Recipe = require("../schemas/Recipe");

/* async function searchRecipe(chatId, bot, handleChat) {
	await bot.sendMessage(chatId, 'Поиск будет, но не сразу. Афуф');
	handleChat();
} */

async function searchRecipe(query, bot, handleChat) {
	const chatId = query.message.chat.id;
	// в этот массив записываются типы блюд для поиска
	let types = [];
	let pipeline = [];

	async function handleCallback(query, nextStep) {
		switch (query.data) {
			case "decline":
				pipeline = [];
				bot.removeAllListeners();
				await bot.editMessageText("Параметры поиска сброшены", {
					chat_id: chatId,
					message_id: query.message.message_id,
					reply_markup: {
						inline_keyboard: [
							[{ text: "Добавить рецепт 📝", callback_data: "addRecipe" }],
							[{ text: "Поиск 🔎", callback_data: "searchRecipe" }]
						],
					}
				});
				handleChat();
				bot.answerCallbackQuery(query.id);
				break;
			case "skip":
				nextStep(query);
				bot.answerCallbackQuery(query.id);
				break;
			case "find":
				if (types.length) {
					pipeline.push({
						$match: {
							"type": types
						}
					})
				}
				if (!pipeline.length) {
					try {
						await bot.editMessageText("Укажите параметры поиска", {
							chat_id: chatId,
							message_id: query.message.message_id,
						});
					} catch (e) { console.log(e.message); }
					bot.answerCallbackQuery(query.id);
					return getTitle();
				};
				const foundRecipe = await Recipe.aggregate(pipeline);
				const answer = foundRecipe.length ?
					`<b>${foundRecipe[0].title}</b>
					<b><u>Ингредиенты</u></b>
					${foundRecipe[0].ingredients.map((el, i) => {
						return `${el} — ${foundRecipe[0].quantities[i]}${foundRecipe[0].units[i]}`
					})}
					<b><u>Приготовление</u></b>
					${foundRecipe[0].cook}
					${foundRecipe[0].link || ""}`
					:
					"Здесь пока ничего нет";

				await bot.editMessageText(answer, {
					chat_id: chatId,
					message_id: query.message.message_id,
					parse_mode: "HTML",
					reply_markup: {
						inline_keyboard: [
							[{ text: "Добавить рецепт 📝", callback_data: "addRecipe" }],
							[{ text: "Поиск 🔎", callback_data: "searchRecipe" }]
						],
					}
				});
				handleChat();
				bot.answerCallbackQuery(query.id);
				break;
			default:
				if (!types.includes(query.data)) types.push(query.data);
				bot.answerCallbackQuery(query.id);
				break;
		}
	}

	async function getTitle() {
		bot.removeAllListeners();
		const nextStep = getIngredients;
		if (!query.message.sticker) {
			await bot.editMessageText("Введите название блюда", {
				chat_id: chatId,
				message_id: query.message.message_id,
				reply_markup: {
					inline_keyboard: [[
						{ text: "Отмена", callback_data: "decline" },
						{ text: "Найти", callback_data: "find" },
						{ text: "Пропустить", callback_data: "skip" }
					]],
				}
			});
		} else {
			await bot.sendMessage(chatId, 'Введите название блюда', {
				reply_markup: {
					inline_keyboard: [[
						{ text: "Отмена", callback_data: "decline" },
						{ text: "Найти", callback_data: "find" },
						{ text: "Пропустить", callback_data: "skip" }
					]],
				}
			});
		}

		bot.on("callback_query", async query => {
			handleCallback(query, nextStep)
		});
		bot.on("message", async msg => {
			pipeline.push({
				$search: {
					index: 'title',
					autocomplete: {
						path: 'title',
						query: msg.text.toLowerCase()
					}
				}
			});
			nextStep();
		})
	}

	async function getIngredients(query) {
		bot.removeAllListeners();
		const nextStep = getType;
		if (query) {
			await bot.editMessageText("Перечислите ингредиенты", {
				chat_id: chatId,
				message_id: query.message.message_id,
				reply_markup: {
					inline_keyboard: [[
						{ text: "Отмена", callback_data: "decline" },
						{ text: "Найти", callback_data: "find" },
						{ text: "Пропустить", callback_data: "skip" }
					]],
				}
			})
		} else {
			await bot.sendMessage(chatId, "Перечислите ингредиенты", {
				reply_markup: {
					inline_keyboard: [[
						{ text: "Отмена", callback_data: "decline" },
						{ text: "Найти", callback_data: "find" },
						{ text: "Пропустить", callback_data: "skip" }
					]],
				}
			});
		}
		bot.on("callback_query", async query => {
			handleCallback(query, nextStep)
		});
		bot.on("message", async msg => {
			const ingredients = msg.text.split(',').map(el => el.toLowerCase());
			if (!pipeline.length) {
				pipeline.push({
					$search: {
						index: "ingredients",
						text: {
							path: "ingredients",
							query: ingredients
						}
					}
				})
			} else {
				pipeline.push({
					$match: {
						ingredients: { $all: ingredients }
					}
				})
			}
			nextStep();
		})
	}

	async function getType(query) {
		bot.removeAllListeners();
		if (query) {
			await bot.editMessageText("Укажите тип блюда (можно выбрать несколько)", {
				chat_id: chatId,
				message_id: query.message.message_id,
				reply_markup: {
					inline_keyboard: [
						[{ text: "Завтрак", callback_data: "breakfast" }, { text: "Закуска", callback_data: "snack" }, { text: "Напиток", callback_data: "drink" }],
						[{ text: "Основное", callback_data: "main" }, { text: "Салат", callback_data: "salad" }, { text: "Соус", callback_data: "sauce" }],
						[{ text: "Гарнир", callback_data: "garnish" }, { text: "Выпечка", callback_data: "bakery" }, { text: "Другое", callback_data: "other" }],
						[{ text: "Суп", callback_data: "soup" }, { text: "Десерт", callback_data: "dessert" }],
						[{ text: "Отмена", callback_data: "decline" }, { text: "Найти", callback_data: "find" }]
					],
				}
			})
		} else {
			await bot.sendMessage(chatId, "Укажите тип блюда (можно выбрать несколько)", {
				reply_markup: {
					inline_keyboard: [
						[{ text: "Завтрак", callback_data: "breakfast" }, { text: "Закуска", callback_data: "snack" }, { text: "Напиток", callback_data: "drink" }],
						[{ text: "Основное", callback_data: "main" }, { text: "Салат", callback_data: "salad" }, { text: "Соус", callback_data: "sauce" }],
						[{ text: "Гарнир", callback_data: "garnish" }, { text: "Выпечка", callback_data: "bakery" }, { text: "Другое", callback_data: "other" }],
						[{ text: "Суп", callback_data: "soup" }, { text: "Десерт", callback_data: "dessert" }],
						[{ text: "Отмена", callback_data: "decline" }, { text: "Найти", callback_data: "find" }]
					],
				}
			});
		};
		bot.on("callback_query", async query => {
			handleCallback(query)
		})
		bot.on("message", async msg => {
			await bot.sendMessage(chatId, "Для продолжения нажмите любую кнопку из сообщения выше")
		});
	}

	getTitle();
}

module.exports = searchRecipe;