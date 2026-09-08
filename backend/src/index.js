import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path: './.env',
});

console.log('🔑 ML_API_KEY loaded:', process.env.ML_API_KEY ? '✅ Yes' : '❌ No');
console.log('🔑 MONGODB_URI loaded:', process.env.MONGODB_URI ? '✅ Yes' : '❌ No');

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`⚙️ Server is running on port: ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err);
        // ✅ Don't exit - keep server running for ML testing
        console.log('⚠️ Starting server without MongoDB for ML testing...');
        app.listen(PORT, () => {
            console.log(`⚙️ Server is running on port: ${PORT} (ML only mode)`);
        });
    });