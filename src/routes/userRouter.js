const router = require('express').Router();
const userController = require('../controllers/userController');

router.post('/createUser', userController.createUser);
router.post('/getUserByTgID', userController.getUserByTgID);

module.exports = router;