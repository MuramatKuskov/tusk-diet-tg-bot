const Recipe = require('../schemas/Recipe');

module.exports = app => {
	app.post('/pushRecipe', async (req, res) => {
		try {
			await Recipe.create(req.body.recipe);
			res.set('Access-Control-Allow-Origin', process.env.FrontURL);
			return res.json('nice');
		} catch (error) {
			return res.status(500).json(error);
		}
	});
}