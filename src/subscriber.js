const StqPubSubApi = require('./StqPubSub/Api');
const processorFunction = require('./processor'); // Replace with your actual worker function

// Replace 'path_to_your_keyfile' with the actual path to your key.json file.
const pubSubClient = new StqPubSubApi('key.json');

const concurrency = 100;

async function processMessagesInBackground() {
  const subscriptionName = 'test-subscription'; // Replace with your actual subscription name

  while (true) {
    try {
      console.log(`Fetching and processing ${concurrency} messages...`);
      await pubSubClient.pullAndProcessWithLeaseManagement(subscriptionName, processorFunction, concurrency);
    } catch (error) {
      console.error('An error occurred while fetching and processing messages:', error);
    }

    // Add a delay between iterations to avoid excessive API requests
    // await new Promise(resolve => setTimeout(resolve, 5000)); // Adjust the delay as needed
  }
}

processMessagesInBackground().catch(console.error);
