const router = require('express').Router();
const chatRouter = require('./chatRouter.js');
const recipeRouter = require('./recipeRouter.js');
const userRouter = require('./userRouter.js');

router.get('/healthCheck', async (req, res) => {
	return res.json('nice');
});

router.use('/chat', chatRouter);
router.use('/recipes', recipeRouter);
router.use('/users', userRouter);

module.exports = router;