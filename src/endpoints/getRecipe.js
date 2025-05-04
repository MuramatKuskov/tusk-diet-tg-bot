const Recipe = require('../schemas/Recipe');
const { ObjectId } = require('mongodb');


module.exports = app => {
	app.get('/getRecipe', async (req, res) => {
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
	});
}