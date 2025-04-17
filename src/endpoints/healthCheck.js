module.exports = app => {
	app.get('/healthCheck', async (req, res) => {
		// res.set('Access-Control-Allow-Origin', process.env.FrontURL);
		return res.json('nice');
	});
}