const WebAppRoutes = require('../models/webRoutesModel');

exports.webRoutes = async () => {
  try {
    // Fetch routes from the database
    const routes = await WebAppRoutes.find({});

    // Check if routes exist
    if (!routes || routes.length === 0) {
      return {
        success: false,
        message: 'No routes found in the database.',
        data: [],
      };
    }

    return {
      success: true,
      data: routes,
    };
  } catch (error) {
    console.error('Error in webRoutes service:', error.message);

    // Throw the error to be handled by the calling function
    throw new Error('Failed to fetch routes from the database.');
  }
};
