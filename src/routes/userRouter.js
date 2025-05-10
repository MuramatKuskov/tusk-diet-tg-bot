const router = require('express').Router();
const userController = require('../controllers/userController');

router.post('/createUser', userController.createUser);
router.get('/getUserByTgID', userController.getUserByTgID);

module.exports = router;