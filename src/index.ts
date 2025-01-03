/* eslint-disable no-console */
import { config } from './config';
import { app } from './app';
import { connectToRDS } from './services/rds-postgres';

const start = async () => {
    const port = config.port || 3000;
    await connectToRDS();
    app.listen(port, () => console.log(`Server running on port ${port}...`));
};

start();
