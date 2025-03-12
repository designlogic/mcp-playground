import { startServer } from './api.js';

startServer().catch((error: Error) => {
    console.error('Error starting API server:', error);
    process.exit(1);
}); 