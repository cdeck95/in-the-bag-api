// src/server.ts
import express from 'express';
import bodyParser from 'body-parser';
import bagRoutes from './routes/bag';

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use('/bag', bagRoutes); // Use the /bag route

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
