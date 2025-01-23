const fs = require('fs');
const readline = require('readline');
const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'my_database', password: '123456', port: 5432 });


async function processData(eventsFilePath) {
    const aggregatedEvents = await readAndAggregateEvents(eventsFilePath);
    await writeChangesToDatabase(aggregatedEvents);
}


/** The for await loop is explicitly designed for consuming streams or async iterables in a controlled, sequential manner */
async function readAndAggregateEvents(eventsFilePath) {
    const aggregatedEvents = {};
    const rl = createReadlineInterface(eventsFilePath);

    for await (const line of rl) {
        updateAggregatedEvents(line, aggregatedEvents);
    }

    return aggregatedEvents;
}


function createReadlineInterface(eventsFilePath) {
    return readline.createInterface({
        input: fs.createReadStream(eventsFilePath),
        crlfDelay: Infinity,
    });
}


function updateAggregatedEvents(line, aggregatedEvents) {
    const { userId, name, value } = JSON.parse(line);
    const revenueChange = name === 'add_revenue' ? value : -value;
    aggregatedEvents[userId] = (aggregatedEvents[userId] || 0) + revenueChange;
}


/** I preferred to do the updates sequentially, to avoid race-cond in the same process */
async function writeChangesToDatabase(aggregatedEvents) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const userId in aggregatedEvents) {
            const revenueChange = aggregatedEvents[userId];
            await upsertUserRevenue(client, userId, revenueChange);
        }

        await client.query('COMMIT');
        console.log('Database updated successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during transaction:', error);
    } finally {
        client.release();
    }
}


/** sql upsert ensures atomicity in the upsert */
async function upsertUserRevenue(client, userId, revenueChange) {
    const query = `
        INSERT INTO users_revenue (user_id, revenue)
        VALUES ($1, $2)
        ON CONFLICT (user_id)
        DO UPDATE SET revenue = users_revenue.revenue + EXCLUDED.revenue;
    `;
    await client.query(query, [userId, revenueChange]);
}


processData('events-storage.txt').catch(console.error);
