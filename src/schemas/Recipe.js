const mongoose = require('mongoose');

const Recipe = new mongoose.Schema({
	img: { type: String, default: "https://cdn-icons-png.flaticon.com/512/857/857681.png" },
	title: { type: String, required: true },
	origin: String,
	type: { type: [String], required: true },
	ingredients: { type: [String], required: true },
	quantities: [Number],
	units: [String],
	cook: { type: String, required: true },
	difficulty: String,
	time: { type: Number, required: true },
	rating: Number,
	ratingIterator: { type: Number, default: 0 },
	author: { type: String, required: false },
	anonymously: { type: Boolean, required: true },
	link: String,
	moderating: { type: Boolean, required: true },
});

//Recipe.index({ title: 'text' }, { default_language: "russian" });

module.exports = mongoose.model('Recipe', Recipe);