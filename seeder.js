const { MONGODB_URI, MONGODB__PRODUCTION_URI } = process.env;
const MongoClient = require('mongodb').MongoClient;

const connectionString = process.env.NODE_ENV === 'production' ? MONGODB__PRODUCTION_URI : MONGODB_URI;
const client = new MongoClient(connectionString);

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // Perform the seeding operations here

    console.log('Seeding complete');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    // Close the MongoDB connection
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();