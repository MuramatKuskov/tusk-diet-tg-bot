const mongoose = require('mongoose');

const Recipe = new mongoose.Schema({
	img: { type: String, required: false },
	title: { type: String, required: true },
	ingredients: { type: String, required: true },
	process: { type: String, required: true },
	link: { type: String, required: false },
	tags: { type: String, required: true },
});

module.exports = mongoose.model('Recipe', Recipe);