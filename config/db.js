const mongoose = require('mongoose');

// Function to connect to the MongoDB database
const connectDB = async () => {
    const maxRetries = 5; // Maximum number of retries for connection attempts
    let retries = maxRetries;

    // Enable Mongoose debugging to log all queries
    mongoose.set('debug', true);

    while (retries) {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/subscription-app', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`); // Log the host to which MongoDB is connected
            break; // Exit the retry loop on successful connection
        } catch (error) {
            console.error(`Database connection failed: ${error.message}`); // Log the error message
            retries -= 1; // Decrement the retry counter
            console.log(`Retries left: ${retries}`); // Log remaining retries

            if (retries === 0) {
                console.error('All connection attempts failed. Exiting...');
                process.exit(1); // Exit the process with failure code if no retries are left
            }

            // Wait 5 seconds before attempting another connection
            await new Promise((res) => setTimeout(res, 5000));
        }
    }
};

module.exports = connectDB;
