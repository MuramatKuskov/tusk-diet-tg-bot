const Recipe = require('../schemas/Recipe');

module.exports = app => {
	app.post('/pushRecipe', async (req, res) => {
		try {
			await Recipe.create(req.body.recipe);
			return res.json('nice');
		} catch (error) {
			return res.status(500).json(error);
		}
	});
}