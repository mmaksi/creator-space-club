/* eslint-disable no-console */
import { config } from './config';
import { app } from './app';
import { connectToRDS } from './services/rds-postgres';

// Import config after loading environment variables
const start = async () => {
    const port = config.port || 4000;
    await connectToRDS();
    app.listen(port, () => console.log(`Server running on port ${port}...`));
};

start();
