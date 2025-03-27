// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jobPostRoutes from './routes/jobPostRoutes.js'; // Ensure this path is correct

const app = express();
const PORT = process.env.PORT || 5003;

// Rest of the code remains the same...
// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/ChaosCoders', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
app.use('/api/jobposts', jobPostRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});