const Recipe = require("../schemas/Recipe");

module.exports = app => {
	app.get('/getRecipes', async (req, res) => {
		try {
			const pipeline = [];

			if (req.query.title) {
				pipeline.push({
					$search: {
						index: 'title',
						autocomplete: {
							path: 'title',
							query: req.query.title
						}
					}
				})
			};

			if (!req.query.title && req.query.ingredients) {
				pipeline.push({
					$search: {
						index: "ingredients",
						text: {
							path: "ingredients",
							query: req.query.ingredients.split(',')
						}
					}
				})
			}

			if (req.query.type && req.query.type != "all") {
				pipeline.push({
					$match: {
						type: req.query.type
					}
				})
			}

			if (req.query.title && req.query.ingredients) {
				pipeline.push({
					$match: {
						ingredients: { $all: req.query.ingredients.split(',') }
					}
				})
			}

			if (req.query.skip) {
				pipeline.push({
					$skip: +req.query.skip
				})
			}

			if (req.query.limit) {
				pipeline.push({
					$limit: +req.query.limit
				})
			}

			/* if (req.query.project) {
				pipeline.push({
					$project: {
						title: 1,
						_id: 1,
						rating: 1,
					}
				})
			} */

			const data = await Recipe.aggregate(pipeline);
			console.log(data, pipeline);

			return res.json(data);
		} catch (e) {
			console.log(e);
			return res.status(500).json(e);
		}
	});
}