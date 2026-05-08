import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import testRoutes from './routes/test.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tests', testRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('SSC CGL Mock Test API is running');
});

// Error Handling Middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
