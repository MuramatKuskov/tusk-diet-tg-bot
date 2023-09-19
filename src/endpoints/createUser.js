const User = require("../schemas/User");

module.exports = app => {
	app.post('/createUser', async (req, res) => {
		try {
			await User.create({ name: req.body.username })

			res.set('Access-Control-Allow-Origin', process.env.FrontURL, /* "http://localhost:3000/" */);
			return res.json("User created");
		} catch (e) {
			console.log(e);
			return res.status(500).json(e);
		}
	});
}