[1mdiff --git a/src/modules/createRecipe.js b/src/modules/createRecipe.js[m
[1mindex 2b0dc8e..434eb99 100644[m
[1m--- a/src/modules/createRecipe.js[m
[1m+++ b/src/modules/createRecipe.js[m
[36m@@ -114,7 +114,7 @@[m [masync function createRecipe(query, bot, handleChat) {[m
 	}[m
 [m
 	async function setIngredients() {[m
[31m-		await bot.sendMessage(chatId, `Шаг 3 из 5(10): Перечислите ингредиенты следующим образом: "Растительное-масло, мука 100г, яйца 2 шт, соль 0.25 ч.л."`, {[m
[32m+[m		[32mawait bot.sendMessage(chatId, `Шаг 3 из 5(10): Перечислите ингредиенты следующим образом: "Помидоры-в-собственном-соку, растительное-масло, яйца 2шт, соль 0.25 ч.л."`, {[m
 			reply_markup: {[m
 				inline_keyboard: [[m
 					[{ text: "Отменить", callback_data: "decline" }][m
[36m@@ -247,7 +247,7 @@[m [masync function createRecipe(query, bot, handleChat) {[m
 [m
 	async function setOrigin() {[m
 		bot.removeAllListeners();[m
[31m-		await bot.sendMessage(chatId, `Шаг 7 из 5(10): Введите страну происхождения блюда`, {[m
[32m+[m		[32mawait bot.sendMessage(chatId, `Шаг 7 из 5(10): Введите страну/регион происхождения блюда`, {[m
 			reply_markup: {[m
 				inline_keyboard: [[m
 					[{ text: "Пропустить", callback_data: "skip" }],[m
