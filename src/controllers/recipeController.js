const Recipe = require('../schemas/Recipe');
const User = require('../schemas/User');
const { ObjectId } = require('mongodb');

class recipeController {
	static async getRecipeByID(req, res) {
		try {
			const data = await Recipe.aggregate([
				{
					$match: {
						_id: new ObjectId(req.query.id)
					}
				},
				{
					$lookup: {
						from: "users",
						localField: "author",
						foreignField: "_id",
						as: "authorDetails"
					}
				},
				{
					$set: {
						author: {
							$cond: {
								if: { $eq: ["$anonymously", false] },
								then: { $arrayElemAt: ["$authorDetails.username", 0] },
								else: "anon"
							}
						},
					}
				},
				{
					$project: {
						_id: 0,
						img: 0,
						origin: 0,
						title: 0,
						ingredients: 0,
						type: 0,
						rating: 0,
						difficulty: 0,
						time: 0,
						authorDetails: 0,
						__v: 0,
					}
				}
			]);

			return res.json(data);
		} catch (e) {
			console.log(e);
			return res.status(500).json(e);
		}
	}

	static async getRecipesByQuery(req, res) {
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

			pipeline.push({
				$project: {
					_id: 1,
					img: 1,
					origin: 1,
					title: 1,
					ingredients: 1,
					type: 1,
					rating: 1,
					difficulty: 1,
					time: 1,
				}
			});

			const data = await Recipe.aggregate(pipeline);
			return res.json(data);
		} catch (e) {
			console.log(e);
			return res.status(500).json(e);
		}
	}

	static async createRecipe(req, res) {
		try {
			const recipe = await Recipe.create(req.body.recipe);
			await User.updateOne({ _id: req.body._id }, { $push: { createdRecipes: recipe._id } });
			return res.json('nice');
		} catch (error) {
			return res.status(500).json(error);
		}
	}
}

module.exports = recipeController;