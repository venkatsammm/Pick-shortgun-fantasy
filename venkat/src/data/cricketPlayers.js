require('dotenv').config(); // Load env vars like MONGODB_URI
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://venkatr:cWe8o4vJBYin0meW@cluster0.8a7wnej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Mongoose Player schema and model
const playerSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  name: String,
  country: String,
  role: String,
  rating: Number,
  image: String
});

const Player = mongoose.model('Player', playerSchema);

// Cricket Players Data
const cricketPlayersData = [
  { name: "Virat Kohli", country: "India", role: "Batsman", rating: 95 },
  { name: "Rohit Sharma", country: "India", role: "Batsman", rating: 92 },
  { name: "MS Dhoni", country: "India", role: "Wicket-keeper", rating: 90 },
  { name: "Jasprit Bumrah", country: "India", role: "Bowler", rating: 94 },
  { name: "Ravindra Jadeja", country: "India", role: "All-rounder", rating: 88 },
  { name: "KL Rahul", country: "India", role: "Batsman", rating: 87 },
  { name: "Hardik Pandya", country: "India", role: "All-rounder", rating: 85 },
  { name: "Mohammed Shami", country: "India", role: "Bowler", rating: 86 },
  { name: "Rishabh Pant", country: "India", role: "Wicket-keeper", rating: 84 },
  { name: "Yuzvendra Chahal", country: "India", role: "Bowler", rating: 82 },
  { name: "Steve Smith", country: "Australia", role: "Batsman", rating: 93 },
  { name: "David Warner", country: "Australia", role: "Batsman", rating: 89 },
  { name: "Pat Cummins", country: "Australia", role: "Bowler", rating: 91 },
  { name: "Glenn Maxwell", country: "Australia", role: "All-rounder", rating: 86 },
  { name: "Josh Hazlewood", country: "Australia", role: "Bowler", rating: 87 },
  { name: "Alex Carey", country: "Australia", role: "Wicket-keeper", rating: 81 },
  { name: "Mitchell Starc", country: "Australia", role: "Bowler", rating: 88 },
  { name: "Marcus Stoinis", country: "Australia", role: "All-rounder", rating: 83 },
  { name: "Adam Zampa", country: "Australia", role: "Bowler", rating: 80 },
  { name: "Travis Head", country: "Australia", role: "Batsman", rating: 82 },
  { name: "Joe Root", country: "England", role: "Batsman", rating: 91 },
  { name: "Ben Stokes", country: "England", role: "All-rounder", rating: 90 },
  { name: "Jos Buttler", country: "England", role: "Wicket-keeper", rating: 87 },
  { name: "Jofra Archer", country: "England", role: "Bowler", rating: 85 },
  { name: "Jonny Bairstow", country: "England", role: "Batsman", rating: 84 },
  { name: "Moeen Ali", country: "England", role: "All-rounder", rating: 82 },
  { name: "James Anderson", country: "England", role: "Bowler", rating: 86 },
  { name: "Stuart Broad", country: "England", role: "Bowler", rating: 84 },
  { name: "Eoin Morgan", country: "England", role: "Batsman", rating: 81 },
  { name: "Adil Rashid", country: "England", role: "Bowler", rating: 79 },
  { name: "Babar Azam", country: "Pakistan", role: "Batsman", rating: 92 },
  { name: "Shaheen Afridi", country: "Pakistan", role: "Bowler", rating: 89 },
  { name: "Mohammad Rizwan", country: "Pakistan", role: "Wicket-keeper", rating: 86 },
  { name: "Fakhar Zaman", country: "Pakistan", role: "Batsman", rating: 83 },
  { name: "Shadab Khan", country: "Pakistan", role: "All-rounder", rating: 81 },
  { name: "Hasan Ali", country: "Pakistan", role: "Bowler", rating: 82 },
  { name: "Imad Wasim", country: "Pakistan", role: "All-rounder", rating: 80 },
  { name: "AB de Villiers", country: "South Africa", role: "Batsman", rating: 94 },
  { name: "Quinton de Kock", country: "South Africa", role: "Wicket-keeper", rating: 88 },
  { name: "Kagiso Rabada", country: "South Africa", role: "Bowler", rating: 90 },
  { name: "Faf du Plessis", country: "South Africa", role: "Batsman", rating: 85 },
  { name: "Imran Tahir", country: "South Africa", role: "Bowler", rating: 83 },
  { name: "Kane Williamson", country: "New Zealand", role: "Batsman", rating: 91 },
  { name: "Trent Boult", country: "New Zealand", role: "Bowler", rating: 88 },
  { name: "Ross Taylor", country: "New Zealand", role: "Batsman", rating: 84 },
  { name: "Tim Southee", country: "New Zealand", role: "Bowler", rating: 85 },
  { name: "Chris Gayle", country: "West Indies", role: "Batsman", rating: 87 },
  { name: "Andre Russell", country: "West Indies", role: "All-rounder", rating: 89 },
  { name: "Kieron Pollard", country: "West Indies", role: "All-rounder", rating: 84 },
  { name: "Nicholas Pooran", country: "West Indies", role: "Wicket-keeper", rating: 81 },
  { name: "Jason Holder", country: "West Indies", role: "All-rounder", rating: 83 },
  { name: "Angelo Mathews", country: "Sri Lanka", role: "All-rounder", rating: 82 },
  { name: "Lasith Malinga", country: "Sri Lanka", role: "Bowler", rating: 85 },
  { name: "Shakib Al Hasan", country: "Bangladesh", role: "All-rounder", rating: 86 },
  { name: "Tamim Iqbal", country: "Bangladesh", role: "Batsman", rating: 81 },
  { name: "Mushfiqur Rahim", country: "Bangladesh", role: "Wicket-keeper", rating: 80 },
  { name: "Rashid Khan", country: "Afghanistan", role: "Bowler", rating: 88 },
  { name: "Mohammad Nabi", country: "Afghanistan", role: "All-rounder", rating: 81 }
];

// Create full player objects with UUIDs and image paths
function createCricketPlayers() {
  return cricketPlayersData.map(player => ({
    id: uuidv4(),
    ...player,
    image: `/images/players/${player.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
  }));
}

// Save players to MongoDB
async function savePlayersToMongo() {
  const players = createCricketPlayers();
  await Player.deleteMany(); // Clear old data
  await Player.insertMany(players);
  console.log('✅ Players saved to MongoDB');
}

// Fetch all players
async function getAllPlayersFromMongo() {
  return await Player.find({});
}

// Filter by role
async function getPlayersByRole(role) {
  return await Player.find({ role: new RegExp(`^${role}$`, 'i') });
}

// Filter by country
async function getPlayersByCountry(country) {
  return await Player.find({ country: new RegExp(`^${country}$`, 'i') });
}

// Get top-rated players
async function getTopRatedPlayers(count = 10) {
  return await Player.find().sort({ rating: -1 }).limit(count);
}

// Shuffle utility
function shufflePlayers(players) {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Export methods
module.exports = {
  createCricketPlayers,
  savePlayersToMongo,
  getAllPlayersFromMongo,
  getPlayersByRole,
  getPlayersByCountry,
  getTopRatedPlayers,
  shufflePlayers
};

// Run if executed directly
if (require.main === module) {
  (async () => {
    await savePlayersToMongo();
    const top = await getTopRatedPlayers(5);
    console.log('Top 5 Players:', top.map(p => `${p.name} (${p.rating})`));
    mongoose.disconnect();
  })();
}
