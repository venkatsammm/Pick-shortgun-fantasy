// Basic test script for Cricket Team Selection
const http = require('http');

// Simple test without socket.io-client dependency
async function testBasicAPI() {
    console.log('🧪 Testing basic API functionality...\n');

    try {
        // Test room creation
        console.log('📝 Testing room creation...');
        const roomData = await createRoom();
        console.log(`✅ Room created: ${roomData.id}\n`);

        // Test room listing
        console.log('📋 Testing room listing...');
        const rooms = await getRooms();
        console.log(`✅ Found ${rooms.length} rooms\n`);

        // Test room details
        console.log('🔍 Testing room details...');
        const roomDetails = await getRoomDetails(roomData.id);
        console.log(`✅ Room details retrieved for ${roomDetails.id}\n`);

        console.log('✅ All API tests passed!');
        return true;

    } catch (error) {
        console.error('❌ API test failed:', error);
        return false;
    }
}

function getRooms() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/rooms',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const rooms = JSON.parse(data);
                    resolve(rooms);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

function getRoomDetails(roomId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/rooms/${roomId}`,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const room = JSON.parse(data);
                    resolve(room);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

function createRoom() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ hostName: 'TestHost' });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/rooms',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const roomData = JSON.parse(data);
                    resolve(roomData);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Run the basic API test
async function runBasicTest() {
    return await testBasicAPI();
}

// Run the test if this file is executed directly
if (require.main === module) {
    runBasicTest().then((success) => {
        if (success) {
            console.log('\n🎉 Test suite completed successfully');
            process.exit(0);
        } else {
            console.log('\n💥 Test suite failed');
            process.exit(1);
        }
    }).catch((error) => {
        console.error('\n💥 Test suite crashed:', error);
        process.exit(1);
    });
}

module.exports = { runBasicTest };
