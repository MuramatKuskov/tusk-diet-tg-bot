const Recipe = require("../schemas/Recipe");

async function searchRecipe(query, handleChat) {
	const chatId = query.message.chat.id;
	// в этот массив записываются типы блюд для поиска
	let types = [];
	let pipeline = [];

	async function handleCallback(query, nextStep) {
		switch (query.data) {
			case "decline":
				pipeline = [];
				TG_BOT.removeAllListeners();
				await TG_BOT.editMessageText("Параметры поиска сброшены", {
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
				TG_BOT.answerCallbackQuery(query.id);
				break;
			case "skip":
				nextStep(query);
				TG_BOT.answerCallbackQuery(query.id);
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
					TG_BOT.answerCallbackQuery(query.id);
					return getTitle(query);
				};
				const foundRecipe = await Recipe.aggregate(pipeline);
				const answer = foundRecipe.length ?
					`<b>${foundRecipe[0].title.charAt(0).toUpperCase() + foundRecipe[0].title.slice(1)}</b>

					<b><u>Ингредиенты</u></b>
					${foundRecipe[0].ingredients.map((el, i) => {
						return foundRecipe[0].quantities[i] ?
							`\n${el.charAt(0).toUpperCase()}${el.slice(1)} — ${foundRecipe[0].quantities[i]}${foundRecipe[0].units[i]}`
							:
							`\n${el.charAt(0).toUpperCase()}${el.slice(1)}`
					})}
					
					<b><u>Приготовление</u></b>
					${foundRecipe[0].cook}
					${foundRecipe[0].link && `<a href="${foundRecipe[0].link}">Link</a>`}`
					:
					"По указанному запросу ничего не найдено";

				await TG_BOT.editMessageText(answer, {
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
				TG_BOT.answerCallbackQuery(query.id);
				break;
			default:
				if (!types.includes(query.data)) types.push(query.data);
				TG_BOT.answerCallbackQuery(query.id);
				break;
		}
	}

	async function getTitle(recievedQuery) {
		TG_BOT.removeAllListeners();
		const nextStep = getIngredients;
		if (!query.message.sticker && !recievedQuery) {
			await TG_BOT.editMessageText("Введите название блюда", {
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
			await TG_BOT.sendMessage(chatId, 'Введите название блюда', {
				reply_markup: {
					inline_keyboard: [[
						{ text: "Отмена", callback_data: "decline" },
						{ text: "Найти", callback_data: "find" },
						{ text: "Пропустить", callback_data: "skip" }
					]],
				}
			});
		}

		TG_BOT.on("callback_query", async query => {
			handleCallback(query, nextStep)
		});
		TG_BOT.on("message", async msg => {
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
		TG_BOT.removeAllListeners();
		const nextStep = getType;
		if (query) {
			await TG_BOT.editMessageText("Перечислите ингредиенты", {
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
			await TG_BOT.sendMessage(chatId, "Перечислите ингредиенты", {
				reply_markup: {
					inline_keyboard: [[
						{ text: "Отмена", callback_data: "decline" },
						{ text: "Найти", callback_data: "find" },
						{ text: "Пропустить", callback_data: "skip" }
					]],
				}
			});
		}
		TG_BOT.on("callback_query", async query => {
			handleCallback(query, nextStep)
		});
		TG_BOT.on("message", async msg => {
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
		TG_BOT.removeAllListeners();
		if (query) {
			await TG_BOT.editMessageText("Укажите тип блюда (можно выбрать несколько)", {
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
			await TG_BOT.sendMessage(chatId, "Укажите тип блюда (можно выбрать несколько)", {
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
		TG_BOT.on("callback_query", async query => {
			handleCallback(query)
		})
		TG_BOT.on("message", async msg => {
			await TG_BOT.sendMessage(chatId, "Для продолжения нажмите любую кнопку из сообщения выше")
		});
	}

	getTitle();
}

module.exports = searchRecipe;