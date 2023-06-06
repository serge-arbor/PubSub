const client = require('./init_client');
const { faker } = require('@faker-js/faker');
const processorFunction = require('./simulate_processor'); // Replace with your actual worker function
const concurrency = 1;

async function processMessages() {
  const subscriptionName = 'test-subscription'; // Replace with your actual subscription name
  console.log(`Fetching and processing ${concurrency} messages...`);
  return await client.pullAndProcessWithLeaseManagement(subscriptionName, processorFunction, concurrency);
}

async function processInBackground() {
  while (true) {
    await processMessages()
  }
}

processInBackground().catch(console.error);