const StqPubSubApi = require('./StqPubSub/Api');
const { faker } = require('@faker-js/faker');

// Replace 'path_to_your_keyfile' with the actual path to your key.json file.
const client = new StqPubSubApi('key.json');

async function run() {
  // Replace 'your_topic' with your actual topic name.
  const topicName = 'test-topic';

  // Number of messages to publish.
  const numMessages = parseInt(process.argv[2]) || 1;

  // Ensure numMessages is a valid integer.
  if (isNaN(numMessages) || numMessages < 1) {
    console.error('Invalid number of messages. Please provide a valid integer greater than 0.');
    return;
  }

  for (let i = 0; i < numMessages; i++) {
    const message = JSON.stringify({
      name: faker.person.fullName(),
    });

    console.log(`Message to publish: ${message}`);

    const messageId = await client.publishMessage(topicName, message);

    console.log(`Published message ID: ${messageId}`);
  }
}

run().catch(console.error);
