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

			if (req.query.ingredients) {
				const ingredients = req.query.ingredients
					.split(',')
					.map((item) => item.trim())
					.filter((item) => item.length > 0);

				let matchQuery = {};
				const searchQuery = ingredients.join(' ');


				if (!req.query.mode) {
					// temporarily set mode to discovery if not provided
					// while releasing new Frontend version
					req.query.mode = "discovery";
				}
				/* if (req.query.mode === "discovery") {
					// match any recipe that contain some of the ingredients
					matchQuery = { ingredients: { $in: ingredients } };
				} else */ if (req.query.mode === "accessible") {
					// match only available ingredients
					matchQuery = {
						$expr: {
							$allElementsTrue: {
								$map: {
									input: '$ingredients',
									as: 'ingredient',
									in: { $in: ['$$ingredient', ingredients] },
								},
							},
						},
					};
				} else if (req.query.mode === "precise") {
					// match exactly the ingredients
					matchQuery = {
						$expr: { $eq: [{ $setDifference: ['$ingredients', ingredients] }, []] }
					};
				} /* else if (req.query.mode === "backboned") {
					// match at least all explicitly defined ingredients
					matchQuery = { ingredients: { $all: ingredients } };
				} */

				if (!req.query.title && (req.query.mode === "discovery" || req.query.mode === "backboned")) {
					pipeline.push({
						$search: {
							index: "ingredients",
							text: {
								path: "ingredients",
								query: searchQuery,
								// match recipes that contain all/some ingredients
								// matchCriteria: (req.query.mode === "backboned" || req.query.mode === "precise") ? "all" : "any",
								matchCriteria: req.query.mode === "discovery" ? "any" : "all",
							}
						}
					});
					// additional filters for accessible and precise modes
					// if (req.query.mode === "accessible" || req.query.mode === "precise") {
					// 	pipeline.push({
					// 		$match: matchQuery,
					// 	});
					// }
				} else {
					pipeline.push({
						$match: matchQuery
					});
				}
			}

			if (req.query.type && req.query.type != "all") {
				pipeline.push({
					$match: {
						type: req.query.type
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

			// res.set('Access-Control-Allow-Origin', process.env.FrontURL);
			return res.json(data);
		} catch (e) {
			console.log(e);
			return res.status(500).json(e);
		}
	});
}