const User = require("../schemas/User");

module.exports = app => {
	app.get('/getUser', async (req, res) => {
		try {
			const data = await User.aggregate([{
				$search: {
					index: 'username',
					text: {
						path: 'name',
						query: req.query.name
					}
				}
			}]);
			return res.json(data);
		} catch (e) {
			console.log(e);
			return res.status(500).json(e);
		}
	});
}