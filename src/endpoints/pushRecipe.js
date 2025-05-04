const Recipe = require('../schemas/Recipe');
const User = require('../schemas/User');

module.exports = app => {
	app.post('/pushRecipe', async (req, res) => {
		try {
			const recipe = await Recipe.create(req.body.recipe);
			await User.updateOne({ _id: req.body._id }, { $push: { createdRecipes: recipe._id } });
			return res.json('nice');
		} catch (error) {
			return res.status(500).json(error);
		}
	});
}