import express from 'express';
import cors from 'cors';
import excelRoutes from './routes/excelRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/excel', excelRoutes);

export default app; 