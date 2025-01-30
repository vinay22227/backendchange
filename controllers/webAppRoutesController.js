const { webRoutes } = require('../services/webAppRoutesSevice');

exports.webAppRoutesController = async (req, res, next) => {
  try {
    // Fetch routes from the service
    const routes = await webRoutes();

    if (!routes || routes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No routes found.',
      });
    }

    res.status(200).json({
      success: true,
      data: routes,
    });
  } catch (error) {
    console.error('Error in webAppRoutesController:', error.message);

    // Provide a clear error response for unexpected issues
    res.status(500).json({
      success: false,
      message: 'Failed to fetch web application routes.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }), // Include error details in development
    });

    next(error); // Pass the error to the global error handler
  }
};
