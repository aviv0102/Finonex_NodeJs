const express = require('express');
const fs = require('fs').promises;
const { Client } = require('pg');

const app = express();
const PORT = 8000;
const client = new Client({ user: 'postgres', host: 'localhost', database: 'my_database', password: '123456', port: 5432 });

app.use(express.json());
app.post('/liveEvent', handleLiveEvent);
app.get('/userEvents/:userId', getUserEvent);

client.connect().catch(err => {
    console.error('Connection error', err.stack);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


async function handleLiveEvent(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader !== 'secret') {
            return res.status(401).send('Unauthorized');
        }

        await processEvent(req.body);
        res.status(200).send('Event Handled...');
    } catch (err) {
        res.status(500).send(err);
    }
}


async function processEvent(event) {
    const fileName = 'events-storage.txt';
    await fs.appendFile(fileName, JSON.stringify(event) + '\n');
}


async function getUserEvent(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const { userId } = req.params;
        if (authHeader !== 'secret') {
            return res.status(401).send('Unauthorized');
        }
        if (!userId) {
            return res.status(400).send('User ID is required');
        }

        const result = await getUserFromDB(userId);
        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
}


async function getUserFromDB(userId) {
    return client.query('SELECT * FROM users_revenue WHERE user_id = $1', [userId]);
}