const User = require('../schemas/User');

class userController {
	static async getUserByTgID(req, res) {
		try {
			const data = await User.aggregate([
				{
					$match: {
						tgID: +req.query.tgID
					}
				},
				{
					$project: {
						tgID: 0,
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

	static async createUser(req, res) {
		try {
			await User.create({ tgID: req.body.tgID, username: req.body.username });
			return res.json("User created");
		} catch (e) {
			console.log(e);
			return res.status(500).json(e);
		}
	}
}

module.exports = userController;