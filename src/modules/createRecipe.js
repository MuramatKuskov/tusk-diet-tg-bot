const Recipe = require("../schemas/Recipe");

async function createRecipe(query, bot, handleChat) {
	const chatId = query.message.chat.id;

	const recipeBlank = () => {
		return ({
			img: "#",
			title: "",
			origin: "",
			type: [],
			ingredients: [],
			quantities: [],
			units: [],
			cook: "",
			difficulty: "",
			time: 10,
			rating: null,
			ratingIterator: 0,
			link: "",
			// author: query.user.username,
			anonymously: false,
			moderating: true,
		})
	}
	const recipe = recipeBlank();
	console.log(query, query?.user);

	async function handleBtns(query, nextStep) {
		switch (query.data) {
			case "skip":
				nextStep();
				break;
			case "decline":
				await bot.editMessageText("Рецепт удален", {
					chat_id: chatId,
					message_id: query.message.message_id,
					reply_markup: {
						inline_keyboard: [
							[{ text: "Добавить рецепт 📝", callback_data: "addRecipe" }],
							[{ text: "Поиск 🔎", callback_data: "searchRecipe" }]
						]
					}
				})
				handleChat();
				break;
			case "hideUsername":
				recipe.anonymously = true;
				pushRecipe()
				break;
			case "showUsername":
				pushRecipe()
		}
		bot.answerCallbackQuery(query.id);
	}

	function setRecipe(params) {
		for (let key in params) {
			// если значение присваивается полю типа string/number, присваиваем прямо
			if (typeof recipe[key] != "object") recipe[key] = params[key];
			// массивы могут заполнятся пошагово (см setIngredients), сохраняем prev
			if (typeof recipe[key] === "object") recipe[key] = [...recipe[key], params[key]]
		}
	}

	async function setTitle() {
		const nextStep = setType;
		if (!query.message.sticker) {
			bot.editMessageText("Шаг 1 из 5(10): Введите название блюда", {
				chat_id: chatId,
				message_id: query.message.message_id,
				reply_markup: {
					inline_keyboard: [
						[{ text: "Отменить", callback_data: "decline" }]
					],
				}
			});
		} else {
			await bot.sendMessage(chatId, "Шаг 1 из 5(9): Введите название блюда", {
				reply_markup: {
					inline_keyboard: [
						[{ text: "Отменить", callback_data: "decline" }]
					]
				}
			});
		}
		bot.on("message", async msg => {
			setRecipe({ title: msg.text.toLowerCase(), author: msg.from.username });
			nextStep();
		});
		bot.on("callback_query", async query => {
			handleBtns(query, nextStep);
		})
	}

	async function setType() {
		bot.removeAllListeners();
		let multipleChoice = false;
		await bot.sendMessage(chatId, "Шаг 2 из 5(10): Укажите тип блюда (можно выбрать несколько)", {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Завтрак", callback_data: "breakfast" }, { text: "Закуска", callback_data: "snack" }, { text: "Напиток", callback_data: "drink" }],
					[{ text: "Основное", callback_data: "main" }, { text: "Салат", callback_data: "salad" }, { text: "Соус", callback_data: "sauce" }],
					[{ text: "Гарнир", callback_data: "garnish" }, { text: "Выпечка", callback_data: "bakery" }, { text: "Другое", callback_data: "other" }],
					[{ text: "Суп", callback_data: "soup" }, { text: "Десерт", callback_data: "dessert" }, { text: "Отменить", callback_data: "decline" }],
				]
			}
		});
		await bot.on("callback_query", async query => {
			if (query.data === "decline") return handleBtns(query);
			if (!recipe.ingredients.includes(query.data)) setRecipe({ type: query.data });
			if (!multipleChoice) setIngredients();
			multipleChoice = true;
		})
	}

	async function setIngredients() {
		bot.removeListener("callback_query");
		await bot.sendMessage(chatId, `Шаг 3 из 5(10): Ингредиенты и их количество перечислите через запятую, например: "мука 100г, яйца 2шт"`, {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Отменить", callback_data: "decline" }]
				]
			}
		});
		bot.on("message", async (msg) => {
			// если юзер ввел ингредиенты, чистим прослушку с предыдущего шага
			bot.removeListener("callback_query");

			// получаем 2-мерный массив вида [["product", "quantity+unit"], ...]
			const rawIngredients = msg.text.split(",").map(el => { return el.trim().split(" ") });
			// разбиваем 2 строку каждого подмассива, получаем массив [["product", +quantity, "unit"], ...]
			rawIngredients.forEach((el, index) => {
				if (rawIngredients[index].length === 1) {
					return rawIngredients[index] = ([
						rawIngredients[index][0].replace(/-/g, " "),
						1,
						""
					])
				}
				if (rawIngredients[index].length > 2) {
					return rawIngredients[index][1] = +rawIngredients[index][1]
				}
				rawIngredients[index] = ([
					rawIngredients[index][0].replace(/-/g, " "),		// "product"
					+/\d+/.exec(el),											// +quantity
					el[1].replace(/\d+/g, '')								// "unit"
				])
			});
			// массив ингредиентов заполняется пошагово
			rawIngredients.forEach(el => {
				if (el[2].length) {
					return setRecipe({ ingredients: el[0].toLowerCase(), quantities: el[1], units: el[2].toLowerCase() })
				}
				setRecipe({ ingredients: el[0].toLowerCase(), quantities: el[1], units: el[2] })
			});
			const duplicates = await Recipe.aggregate([{
				$search: {
					index: 'title',
					autocomplete: {
						path: 'title',
						query: recipe.title
					}
				}
			},
			{
				$match: {
					"type": recipe.type
				}
			},
			{
				$match: {
					ingredients: { $all: recipe.ingredients }
				}
			}])
			if (duplicates.length) {
				await bot.sendMessage(chatId,
					"Рецепт этого же типа, с похожим названием и ингредиентами уже есть в базе. Продолжайте, если уверены, что не дублируете существующий рецепт!"
				)
			}
			setProcess();
		});
		bot.on("callback_query", async query => {
			handleBtns(query);
		})
	}

	async function setProcess() {
		bot.removeAllListeners();
		await bot.sendMessage(chatId, `Шаг 4 из 5(10): Опишите процесс приготовления`, {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Отменить", callback_data: "decline" }]
				]
			}
		});
		bot.on("message", async (msg) => {
			setRecipe({ cook: msg.text });
			setTime();
		});
		bot.on("callback_query", async query => {
			handleBtns(query);
		})
	}

	async function setTime() {
		bot.removeAllListeners();
		await bot.sendMessage(chatId, `Шаг 5 из 5(10): Введите время приготовления в минутах, например: 25`, {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Отменить", callback_data: "decline" }]
				]
			}
		});
		bot.on("message", async (msg) => {
			setRecipe({ time: +/\d+/.exec(msg.text) });
			setImg();
		});
		bot.on("callback_query", async query => {
			handleBtns(query);
		})
	}

	async function setImg() {
		bot.removeAllListeners();
		await bot.sendMessage(chatId, "Картинки пока не обрабатываются, этот шаг пропускаем")
		await bot.sendMessage(chatId, `Шаг 6 из 5(10): Прикрепите изображение`, {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Пропустить", callback_data: "skip" }],
					[{ text: "Отменить", callback_data: "decline" }]
				]
			}
		});
		// ожидается сообщение с картинкой
		bot.on("message", async (msg) => {
			if (msg.photo) {
				setRecipe({ img: "" })
				nextStep();
			}
		});
		bot.on("callback_query", async query => {
			handleBtns(query, setOrigin);
		})
	}

	async function setOrigin() {
		bot.removeAllListeners();
		await bot.sendMessage(chatId, `Шаг 7 из 5(10): Введите страну происхождения блюда`, {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Пропустить", callback_data: "skip" }],
					[{ text: "Отменить", callback_data: "decline" }]
				]
			}
		});
		bot.on("message", async (msg) => {
			setRecipe({ origin: msg.text.toLowerCase() });
			nextStep();
		})
		bot.on("callback_query", async query => {
			handleBtns(query, setDifficulty);
		})
	}

	async function setDifficulty() {
		bot.removeAllListeners();
		await bot.sendMessage(chatId, `Шаг 8 из 5(10): Укажите сложность приготовления`, {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Отменить", callback_data: "decline" }],
					[{ text: "Пропустить", callback_data: "skip" }]
				]
			}
		});
		bot.on("message", async (msg) => {
			setRecipe({ difficulty: msg.text.toLowerCase() });
			nextStep();
		});
		bot.on("callback_query", async query => {
			handleBtns(query, setLink);
		})
	}

	async function setLink() {
		bot.removeAllListeners();
		await bot.sendMessage(chatId, `Шаг 9 из 5(10): Прикрепите ссылку на рецепт`, {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Отменить", callback_data: "decline" }],
					[{ text: "Пропустить", callback_data: "skip" }]
				]
			}
		});
		bot.on("message", async (msg) => {
			setRecipe({ link: msg.text });
			nextStep();
		})
		bot.on("callback_query", async query => {
			handleBtns(query, setAuthorship);
		})
	}

	async function setAuthorship() {
		bot.removeAllListeners();
		await bot.sendMessage(chatId, `Шаг 10 из 5(10): Показать/скрыть Username на странице рецепта?`, {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Отменить", callback_data: "decline" }],
					[{ text: "Показать", callback_data: "showUsername" }],
					[{ text: "Скрыть", callback_data: "hideUsername" }],
				]
			}
		});
		bot.on("callback_query", async query => {
			handleBtns(query);
		})
	}

	async function pushRecipe() {
		bot.removeAllListeners();
		await Recipe.create(recipe);
		await bot.sendMessage(chatId,
			`<b>${recipe.title}</b>
				
				<b><u>Ингредиенты</u></b>
				${recipe.ingredients}
				
				<b><u>Приготовление</u></b>
				${recipe.cook}
				${recipe.link ? `<a href=${recipe.link}>Link</a>` : ""}
				`,
			{ parse_mode: "HTML" });
		await bot.sendMessage(chatId, `Рецепт добавлен`, {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Добавить рецепт 📝", callback_data: "addRecipe" }],
					[{ text: "Поиск 🔎", callback_data: "searchRecipe" }]
				]
			}
		});
		handleChat();
	}

	setTitle();
}

module.exports = createRecipe;