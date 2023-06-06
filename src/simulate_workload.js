const client = require('./init_client');
const { faker } = require('@faker-js/faker');
const concurrency = 1;

async function publishRandomNMessages() {
  const topicName = 'test-topic';
  const maxMessages = 100;
  const numMessages = Math.floor(Math.random() * maxMessages) + 1; // 1 .. maxMessages

  console.log(`Generating and publishing ${numMessages} messages...`);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  for (let i = 0; i < numMessages; i++) {
    const message = JSON.stringify({
      name: faker.person.fullName(),
    });

    const messageId = await client.publishMessage(topicName, message);
    console.log(`Published message ID: ${messageId}`);
  }
}

async function publishInBackground() {
  while (true) {
    await publishRandomNMessages()
  }
}

publishInBackground().catch(console.error);