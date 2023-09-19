const mongoose = require('mongoose');

const User = new mongoose.Schema({
	name: { type: String, required: true },
	createdRecipes: { type: [String], default: [] },
	subscriptions: { type: [String], default: [] },
	favourites: { type: [String], default: [] },
	shoppingList: { type: String, default: "" },
	// массив объектов выглядит страшно
	// мб отдельную коллекцию для рейтингов и связывать ссылками?
	ratings: { type: [Object], default: [] },
});


module.exports = mongoose.model('User', User);