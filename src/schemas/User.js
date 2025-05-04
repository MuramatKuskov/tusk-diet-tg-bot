const mongoose = require('mongoose');

const User = new mongoose.Schema({
	tgID: { type: Number, required: true },
	username: { type: String, required: true },
	createdRecipes: { type: [mongoose.Schema.Types.ObjectId], ref: "Recipe", default: [] },
});


module.exports = mongoose.model('User', User);