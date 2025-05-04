const mongoose = require('mongoose');

const Recipe = new mongoose.Schema({
	// use default image from assets on frontend
	img: { type: String, default: "/assets/DishPlaceholder.png" },
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
	author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
	anonymously: { type: Boolean, required: true },
	link: String,
	moderating: { type: Boolean, required: true },
});

//Recipe.index({ title: 'text' }, { default_language: "russian" });

module.exports = mongoose.model('Recipe', Recipe);