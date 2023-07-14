const mongoose = require('mongoose');

const Recipe = new mongoose.Schema({
	img: { type: String, required: false },
	title: { type: String, required: true },
	type: { type: Array, required: true },
	ingredients: { type: Array, required: true },
	cook: { type: String, required: true },
	time: { type: Number, required: true },
	link: { type: String, required: false },
	tags: { type: String, required: false },
	author: { type: String, required: false },
	moderating: { type: Boolean, required: true },
});

//Recipe.index({ title: 'text' }, { default_language: "russian" });

module.exports = mongoose.model('Recipe', Recipe);