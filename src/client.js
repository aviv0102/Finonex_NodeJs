const fs = require('fs');
const axios = require('axios');

const fileName = 'events.jsonl';
const serverUrl = 'http://localhost:8000';
const headers = { Authorization: 'secret', 'Content-Type': 'application/json' }


async function sendEventsToServer() {
    try {
        const events = readEventsFromFile();

        for (const event of events) {
            await sendEvent(event);
        }

        console.log('All events have been sent to the server.');
    } catch (err) {
        console.error('Error reading or sending events:', err);
    }
}


async function sendEvent(event) {
    try {
        await axios.post(`${serverUrl}/liveEvent`, event, { headers });
    } catch (err) {
        console.error('Error sending event:', err.message);
    }
}


function readEventsFromFile() {
    const data = fs.readFileSync(fileName, 'utf8');
    return data.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
}

sendEventsToServer();
