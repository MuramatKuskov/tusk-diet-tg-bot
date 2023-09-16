const mongoose = require('mongoose');

const User = new mongoose.Schema({
	name: String,
	createdRecipes: [String],
	subscriptions: [String],
	favourites: [String],
	shoppingList: String,
	// массив объектов выглядит страшно
	// мб отдельную коллекцию для рейтингов и связывать ссылками?
	ratings: [Object],
});


module.exports = mongoose.model('User', User);