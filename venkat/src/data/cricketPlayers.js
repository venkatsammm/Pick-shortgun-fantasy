
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');


const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});


client.on('error', (err) => console.error('❌ Redis Client Error:', err));
client.on('connect', () => console.log('✅ Redis connected'));


async function initRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

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


const KEYS = {
  ALL_PLAYERS: 'cricket:players:all',
  PLAYER_PREFIX: 'cricket:player:',
  ROLE_PREFIX: 'cricket:role:',
  COUNTRY_PREFIX: 'cricket:country:',
  RATING_SORTED: 'cricket:players:by_rating'
};

// Create full player objects with UUIDs and image paths
function createCricketPlayers() {
  return cricketPlayersData.map(player => ({
    id: uuidv4(),
    ...player,
    image: `/images/players/${player.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
  }));
}

async function savePlayersToRedis() {
  await initRedis();
  
  const players = createCricketPlayers();
  
  
  const existingKeys = await client.keys('cricket:*');
  if (existingKeys.length > 0) {
    await client.del(existingKeys);
  }
  
  
  const pipeline = client.multi();
  
  for (const player of players) {
    const playerKey = `${KEYS.PLAYER_PREFIX}${player.id}`;
    
    
    pipeline.hSet(playerKey, {
      id: player.id,
      name: player.name,
      country: player.country,
      role: player.role,
      rating: player.rating.toString(),
      image: player.image
    });
    
  
    pipeline.sAdd(`${KEYS.ROLE_PREFIX}${player.role.toLowerCase()}`, player.id);
    pipeline.sAdd(`${KEYS.COUNTRY_PREFIX}${player.country.toLowerCase()}`, player.id);
    
    
    pipeline.zAdd(KEYS.RATING_SORTED, {
      score: player.rating,
      value: player.id
    });
    
    
    pipeline.sAdd(KEYS.ALL_PLAYERS, player.id);
  }
  
  await pipeline.exec();
  console.log('✅ Players saved to Redis');
}

async function getPlayerById(playerId) {
  await initRedis();
  const playerData = await client.hGetAll(`${KEYS.PLAYER_PREFIX}${playerId}`);
  
  if (Object.keys(playerData).length === 0) return null;
  
  return {
    ...playerData,
    rating: parseInt(playerData.rating)
  };
}

async function getPlayersByIds(playerIds) {
  await initRedis();
  const players = [];
  
  for (const id of playerIds) {
    const player = await getPlayerById(id);
    if (player) players.push(player);
  }
  
  return players;
}


async function getAllPlayersFromRedis() {
  await initRedis();
  const playerIds = await client.sMembers(KEYS.ALL_PLAYERS);
  return await getPlayersByIds(playerIds);
}


async function getPlayersByRole(role) {
  await initRedis();
  const playerIds = await client.sMembers(`${KEYS.ROLE_PREFIX}${role.toLowerCase()}`);
  return await getPlayersByIds(playerIds);
}

// Filter by country
async function getPlayersByCountry(country) {
  await initRedis();
  const playerIds = await client.sMembers(`${KEYS.COUNTRY_PREFIX}${country.toLowerCase()}`);
  return await getPlayersByIds(playerIds);
}


async function getTopRatedPlayers(count = 10) {
  await initRedis();
  
  
  const topPlayerIds = await client.zRange(KEYS.RATING_SORTED, 0, count - 1, { REV: true });
  return await getPlayersByIds(topPlayerIds);
}


async function getPlayersByRatingRange(minRating, maxRating) {
  await initRedis();
  const playerIds = await client.zRangeByScore(KEYS.RATING_SORTED, minRating, maxRating);
  return await getPlayersByIds(playerIds);
}


async function searchPlayersByName(searchTerm) {
  await initRedis();
  const allPlayers = await getAllPlayersFromRedis();
  
  return allPlayers.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

async function getPlayerStats() {
  await initRedis();
  
  const totalPlayers = await client.sCard(KEYS.ALL_PLAYERS);
  const countries = await client.keys(`${KEYS.COUNTRY_PREFIX}*`);
  const roles = await client.keys(`${KEYS.ROLE_PREFIX}*`);
  
  const stats = {
    totalPlayers,
    totalCountries: countries.length,
    totalRoles: roles.length,
    countriesBreakdown: {},
    rolesBreakdown: {}
  };
  
  
  for (const countryKey of countries) {
    const country = countryKey.replace(KEYS.COUNTRY_PREFIX, '');
    const count = await client.sCard(countryKey);
    stats.countriesBreakdown[country] = count;
  }
  

  for (const roleKey of roles) {
    const role = roleKey.replace(KEYS.ROLE_PREFIX, '');
    const count = await client.sCard(roleKey);
    stats.rolesBreakdown[role] = count;
  }
  
  return stats;
}


async function addPlayer(playerData) {
  await initRedis();
  
  const player = {
    id: uuidv4(),
    ...playerData,
    image: `/images/players/${playerData.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
  };
  
  const playerKey = `${KEYS.PLAYER_PREFIX}${player.id}`;
  
  
  await client.hSet(playerKey, {
    id: player.id,
    name: player.name,
    country: player.country,
    role: player.role,
    rating: player.rating.toString(),
    image: player.image
  });
  
  
  await client.sAdd(`${KEYS.ROLE_PREFIX}${player.role.toLowerCase()}`, player.id);
  await client.sAdd(`${KEYS.COUNTRY_PREFIX}${player.country.toLowerCase()}`, player.id);
  await client.zAdd(KEYS.RATING_SORTED, { score: player.rating, value: player.id });
  await client.sAdd(KEYS.ALL_PLAYERS, player.id);
  
  return player;
}

// Update player rating
async function updatePlayerRating(playerId, newRating) {
  await initRedis();
  
  const playerKey = `${KEYS.PLAYER_PREFIX}${playerId}`;
  const exists = await client.exists(playerKey);
  
  if (!exists) {
    throw new Error('Player not found');
  }
  
  
  await client.hSet(playerKey, 'rating', newRating.toString());
  
  
  await client.zAdd(KEYS.RATING_SORTED, { score: newRating, value: playerId });
  
  return await getPlayerById(playerId);
}

// Delete a player
async function deletePlayer(playerId) {
  await initRedis();
  
  const player = await getPlayerById(playerId);
  if (!player) {
    throw new Error('Player not found');
  }
  
  const playerKey = `${KEYS.PLAYER_PREFIX}${playerId}`;
  
  
  await client.del(playerKey);
  await client.sRem(`${KEYS.ROLE_PREFIX}${player.role.toLowerCase()}`, playerId);
  await client.sRem(`${KEYS.COUNTRY_PREFIX}${player.country.toLowerCase()}`, playerId);
  await client.zRem(KEYS.RATING_SORTED, playerId);
  await client.sRem(KEYS.ALL_PLAYERS, playerId);
  
  return player;
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

// Close Redis connection
async function closeRedisConnection() {
  if (client.isOpen) {
    await client.disconnect();
    console.log('✅ Redis connection closed');
  }
}

// Export methods
module.exports = {
  initRedis,
  createCricketPlayers,
  savePlayersToRedis,
  getAllPlayersFromRedis,
  getPlayersByRole,
  getPlayersByCountry,
  getTopRatedPlayers,
  getPlayersByRatingRange,
  searchPlayersByName,
  getPlayerStats,
  addPlayer,
  updatePlayerRating,
  deletePlayer,
  getPlayerById,
  shufflePlayers,
  closeRedisConnection
};

// Run if executed directly
if (require.main === module) {
  (async () => {
    try {
      await savePlayersToRedis();
      
      const top = await getTopRatedPlayers(5);
      console.log('Top 5 Players:', top.map(p => `${p.name} (${p.rating})`));
      
      const stats = await getPlayerStats();
      console.log('Player Statistics:', stats);
      
      const indianPlayers = await getPlayersByCountry('India');
      console.log(`Total Indian Players: ${indianPlayers.length}`);
      
      const batsmen = await getPlayersByRole('Batsman');
      console.log(`Total Batsmen: ${batsmen.length}`);
      
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      await closeRedisConnection();
    }
  })();
}