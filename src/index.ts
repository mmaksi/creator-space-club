/* eslint-disable no-console */
import { config } from './config';
import { app } from './app';
import { connectToRDS } from './services/rds';
import { requestLogger, errorLogger } from './middleware/logger';

// Import config after loading environment variables
const start = async () => {
    const port = config.port || 4000;

    // Add request logger before routes
    app.use(requestLogger);

    await connectToRDS();

    // Add error logger after routes
    app.use(errorLogger);

    app.listen(port, () => console.log(`Server running on port ${port}`));
};

start();
