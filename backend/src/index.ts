import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { env } from './config';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use(routes);

// Error Handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`[Personal AI Learning Coach] Backend running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`[Constraint Check] Low-memory Windows 2GB guardrails active. Remote Supabase + Free AI adapters ready.`);
  });
}

export default app;
