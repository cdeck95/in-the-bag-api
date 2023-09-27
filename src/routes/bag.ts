// src/routes/bag.ts
import express from 'express';
import mysql, { OkPacket, RowDataPacket } from 'mysql2/promise'; // Import the MySQL library
import dotenv from 'dotenv';

const router = express.Router();

// Read database configuration from environment variables
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
} = process.env;

// MySQL connection pool configuration (adjust it as needed)
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: 'discgolfdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const connection = await pool.getConnection();

    // Define your SQL query here
    const query = 'SELECT * FROM bags WHERE user_id = ?';
    const [rows, fields] = await connection.execute<RowDataPacket[]>(query, [userId]);

    // Release the connection back to the pool
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found or bag is empty' });
    }

    // Process the rows as needed
    const bag = processBagData(rows);

    res.status(200).json(bag);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while fetching the bag' });
  }
});

// Function to process the bag data (similar to your Python code)
function processBagData(rows: RowDataPacket[]) {
  const bag: {
    'Distance Drivers': string[];
    'Fairway Drivers': string[];
    'Mid-Ranges': string[];
    'Putt/Approach': string[];
  } = {
    'Distance Drivers': [],
    'Fairway Drivers': [],
    'Mid-Ranges': [],
    'Putt/Approach': [],
  };

  // Sort the rows by speed in descending order (highest speed first)
  rows.sort((a, b) => b.speed - a.speed);

  for (const disc of rows) {
    const speed = disc.speed;
    const overrideCategory = disc.override_category;

    let category: keyof typeof bag = 'Distance Drivers';

    if (overrideCategory) {
      category = overrideCategory;
    } else {
      if (speed > 8) {
        category = 'Distance Drivers';
      } else if (speed > 5) {
        category = 'Fairway Drivers';
      } else if (speed > 4) {
        category = 'Mid-Ranges';
      } else {
        category = 'Putt/Approach';
      }
    }
    bag[category].push(disc.disc_name);
  }

  return bag;
}

export default router;
