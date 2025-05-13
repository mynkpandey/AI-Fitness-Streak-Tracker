const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function updateActivities() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fitstreak');
    const activities = db.collection('activities');
    
    // Get all activities
    const allActivities = await activities.find({}).toArray();
    
    // Set start date to March 30, 2024
    const startDate = new Date('2024-03-30');
    startDate.setHours(0, 0, 0, 0); // Set to start of day
    
    // Sort activities by date in descending order to maintain relative order
    allActivities.sort((a, b) => {
      const dateA = new Date(a.date || new Date());
      const dateB = new Date(b.date || new Date());
      return dateB.getTime() - dateA.getTime();
    });
    
    for (let i = 0; i < allActivities.length; i++) {
      const newDate = new Date(startDate);
      newDate.setDate(startDate.getDate() - i); // Each activity gets a date one day before the previous
      
      await activities.updateOne(
        { _id: allActivities[i]._id },
        { $set: { date: newDate } }
      );
      
      console.log(`Updated activity ${allActivities[i]._id} to date ${newDate.toLocaleDateString()}`);
    }
    
    console.log(`Updated ${allActivities.length} activities`);
  } catch (error) {
    console.error('Error updating activities:', error);
  } finally {
    await client.close();
  }
}

updateActivities(); 