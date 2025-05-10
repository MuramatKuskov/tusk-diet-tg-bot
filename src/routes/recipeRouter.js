const router = require('express').Router();
const recipeController = require('../controllers/recipeController');

router.get('/getRecipeByID', recipeController.getRecipeByID);
router.get('/getRecipesByQuery', recipeController.getRecipesByQuery);
router.post('/createRecipe', recipeController.createRecipe);

module.exports = router;