const { v4: uuidv4 } = require('uuid');

// Cricket players data with various international players
const cricketPlayersData = [
  // Indian Players
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

  // Australian Players
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

  // English Players
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

  // Pakistani Players
  { name: "Babar Azam", country: "Pakistan", role: "Batsman", rating: 92 },
  { name: "Shaheen Afridi", country: "Pakistan", role: "Bowler", rating: 89 },
  { name: "Mohammad Rizwan", country: "Pakistan", role: "Wicket-keeper", rating: 86 },
  { name: "Fakhar Zaman", country: "Pakistan", role: "Batsman", rating: 83 },
  { name: "Shadab Khan", country: "Pakistan", role: "All-rounder", rating: 81 },
  { name: "Hasan Ali", country: "Pakistan", role: "Bowler", rating: 82 },
  { name: "Imad Wasim", country: "Pakistan", role: "All-rounder", rating: 80 },
  { name: "Mohammad Hafeez", country: "Pakistan", role: "All-rounder", rating: 78 },

  // South African Players
  { name: "AB de Villiers", country: "South Africa", role: "Batsman", rating: 94 },
  { name: "Quinton de Kock", country: "South Africa", role: "Wicket-keeper", rating: 88 },
  { name: "Kagiso Rabada", country: "South Africa", role: "Bowler", rating: 90 },
  { name: "Faf du Plessis", country: "South Africa", role: "Batsman", rating: 85 },
  { name: "Imran Tahir", country: "South Africa", role: "Bowler", rating: 83 },
  { name: "David Miller", country: "South Africa", role: "Batsman", rating: 82 },

  // New Zealand Players
  { name: "Kane Williamson", country: "New Zealand", role: "Batsman", rating: 91 },
  { name: "Trent Boult", country: "New Zealand", role: "Bowler", rating: 88 },
  { name: "Ross Taylor", country: "New Zealand", role: "Batsman", rating: 84 },
  { name: "Martin Guptill", country: "New Zealand", role: "Batsman", rating: 82 },
  { name: "Tim Southee", country: "New Zealand", role: "Bowler", rating: 85 },

  // West Indies Players
  { name: "Chris Gayle", country: "West Indies", role: "Batsman", rating: 87 },
  { name: "Andre Russell", country: "West Indies", role: "All-rounder", rating: 89 },
  { name: "Kieron Pollard", country: "West Indies", role: "All-rounder", rating: 84 },
  { name: "Nicholas Pooran", country: "West Indies", role: "Wicket-keeper", rating: 81 },
  { name: "Jason Holder", country: "West Indies", role: "All-rounder", rating: 83 },

  // Sri Lankan Players
  { name: "Angelo Mathews", country: "Sri Lanka", role: "All-rounder", rating: 82 },
  { name: "Lasith Malinga", country: "Sri Lanka", role: "Bowler", rating: 85 },
  { name: "Kusal Perera", country: "Sri Lanka", role: "Wicket-keeper", rating: 80 },
  { name: "Wanindu Hasaranga", country: "Sri Lanka", role: "All-rounder", rating: 79 },

  // Bangladesh Players
  { name: "Shakib Al Hasan", country: "Bangladesh", role: "All-rounder", rating: 86 },
  { name: "Tamim Iqbal", country: "Bangladesh", role: "Batsman", rating: 81 },
  { name: "Mushfiqur Rahim", country: "Bangladesh", role: "Wicket-keeper", rating: 80 },
  { name: "Mustafizur Rahman", country: "Bangladesh", role: "Bowler", rating: 82 },

  // Afghanistan Players
  { name: "Rashid Khan", country: "Afghanistan", role: "Bowler", rating: 88 },
  { name: "Mohammad Nabi", country: "Afghanistan", role: "All-rounder", rating: 81 },
  { name: "Mujeeb Ur Rahman", country: "Afghanistan", role: "Bowler", rating: 79 }
];

// Function to create player objects with unique IDs
function createCricketPlayers() {
  return cricketPlayersData.map(player => ({
    id: uuidv4(),
    ...player,
    image: `/images/players/${player.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
  }));
}

// Function to get players by role
function getPlayersByRole(players, role) {
  return players.filter(player => player.role === role);
}

// Function to get players by country
function getPlayersByCountry(players, country) {
  return players.filter(player => player.country === country);
}

// Function to get top rated players
function getTopRatedPlayers(players, count = 10) {
  return players
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}

// Function to shuffle players array
function shufflePlayers(players) {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = {
  createCricketPlayers,
  getPlayersByRole,
  getPlayersByCountry,
  getTopRatedPlayers,
  shufflePlayers,
  cricketPlayersData
};
