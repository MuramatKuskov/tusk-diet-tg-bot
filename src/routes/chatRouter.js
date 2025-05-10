const router = require('express').Router();
const chatController = require('../controllers/chatController');

router.post('/sendRecipe', chatController.sendRecipe);
router.post('/sendList', chatController.sendList);

module.exports = router;