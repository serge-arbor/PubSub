const { MetricServiceClient } = require('@google-cloud/monitoring');

async function fetchSubscriptionMetrics(projectId, subscriptionName) {
  const metricServiceClient = new MetricServiceClient();

  // Fetch the 'pubsub.googleapis.com/subscription/num_undelivered_messages' metric
  const undeliveredMessagesRequest = {
    name: metricServiceClient.projectPath(projectId),
    filter: `metric.type="pubsub.googleapis.com/subscription/num_undelivered_messages"`,
    interval: {
      startTime: {
        seconds: Date.now() / 1000 - 3600, // One hour ago
      },
      endTime: {
        seconds: Date.now() / 1000, // Current time
      },
    },
    view: 'FULL',
  };

  const [undeliveredMessagesTimeSeries] = await metricServiceClient.listTimeSeries(
    undeliveredMessagesRequest
  );

  console.log('Unacked messages:');
  console.log(undeliveredMessagesTimeSeries);

  // Fetch the 'pubsub.googleapis.com/subscription/oldest_unacked_message_age' metric
  const oldestMessageAgeRequest = {
    name: metricServiceClient.projectPath(projectId),
    filter: `metric.type="pubsub.googleapis.com/subscription/oldest_unacked_message_age"`,
    interval: {
      startTime: {
        seconds: Date.now() / 1000 - 3600, // One hour ago
      },
      endTime: {
        seconds: Date.now() / 1000, // Current time
      },
    },
    view: 'FULL',
  };

  const [oldestMessageAgeTimeSeries] = await metricServiceClient.listTimeSeries(
    oldestMessageAgeRequest
  );

  console.log('Oldest unacked message age:');
  console.log(oldestMessageAgeTimeSeries);
}

// Usage example
const projectId = 'your-project-id';
const subscriptionName = 'your-subscription-name';

fetchSubscriptionMetrics(projectId, subscriptionName).catch(console.error);
