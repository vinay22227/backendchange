const express = require('express');
const { webAppRoutesController } = require('../controllers/webAppRoutesController');

const router = express.Router();

/**
 * GET /api/webAppRoutes
 * @description Fetches web application routes information.
 * @controller webAppRoutesController
 */
router.get('/', async (req, res, next) => {
  try {
    await webAppRoutesController(req, res);
  } catch (error) {
    console.error('Error in /api/webAppRoutes:', error.message);
    next(error); // Passes the error to the global error handler
  }
});

module.exports = router;
