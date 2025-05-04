const User = require("../schemas/User");

module.exports = app => {
	app.get('/getUser', async (req, res) => {
		try {
			const data = await User.aggregate([
				{
					$match: {
						tgID: +req.query.tgID
					}
				},
				{
					$project: {
						_id: 1,
						tgID: 0,
						username: 0,
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