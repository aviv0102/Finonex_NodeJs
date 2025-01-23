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

}


