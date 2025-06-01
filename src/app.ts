import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './utils/configdb';


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectToDatabase();
app.listen(3000, () => {
  console.log('✅ Server is running on http://localhost:3000');
});