const client = require('./init_client');
const { faker } = require('@faker-js/faker');
const processorFunction = require('./processor'); // Replace with your actual worker function
const concurrency = 100;

async function publishRandomNMessages() {
  const topicName = 'test-topic';
  const maxMessages = 100;
  const numMessages = Math.floor(Math.random() * maxMessages) + 1; // 1 .. maxMessages

  for (let i = 0; i < numMessages; i++) {
    const message = JSON.stringify({
      name: faker.person.fullName(),
    });

    const messageId = await client.publishMessage(topicName, message);
    console.log(`Published message ID: ${messageId}`);
  }
}

async function processMessages() {
  const subscriptionName = 'test-subscription'; // Replace with your actual subscription name
  console.log(`Fetching and processing ${concurrency} messages...`);
  return await client.pullAndProcessWithLeaseManagement(subscriptionName, processorFunction, concurrency);
}

async function publishAndProcessInBackground() {
  while (true) {
    const messagesProcessed = await processMessages()

    if (messagesProcessed === 0) {
      await publishRandomNMessages()
    }
  }
}

publishAndProcessInBackground().catch(console.error);