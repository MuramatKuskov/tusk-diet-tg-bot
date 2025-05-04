const User = require("../schemas/User");

module.exports = app => {
	app.post('/createUser', async (req, res) => {
		try {
			await User.create({ tgID: req.body.tgID, username: req.body.username })
			return res.json("User created");
		} catch (e) {
			console.log(e);
			return res.status(500).json(e);
		}
	});
}