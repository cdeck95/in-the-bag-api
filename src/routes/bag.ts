// src/routes/bag.ts
import express from 'express';
import mysql from 'mysql2/promise'; // Import the MySQL library

const router = express.Router();

// MySQL connection pool configuration (adjust it as needed)
const pool = mysql.createPool({
  host: 'your_database_host',
  user: 'your_database_user',
  password: 'your_database_password',
  database: 'your_database_name',
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
    const [rows, fields] = await connection.execute(query, [userId]);

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
function processBagData(rows: any[]) {
  const bag = {
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

    // Adjust the logic for categorizing discs based on your requirements
    let category = '';
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
