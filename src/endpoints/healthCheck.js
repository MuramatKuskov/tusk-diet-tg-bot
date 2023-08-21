module.exports = app => {
	app.get('/healthCheck', async (req, res) => {
		return res.json('nice');
	});
}