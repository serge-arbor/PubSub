const client = require('./init_client');

function startup() {
  const topicName = 'test-topic';
  client.createTopic(topicName);  
}


client.getSubscription('test-subscription');

client.getMetricsHelper().fetchMetricSingleValue(
  'test-subscription',
  'pubsub.googleapis.com/subscription/oldest_unacked_message_age', 
  1000
);

client.getMetricsHelper().fetchMetricSingleValue(
  'test-subscription',
  'pubsub.googleapis.com/subscription/num_undelivered_messages', 
  600
);

client.getMetricsHelper().fetchMetricSingleValue(
  'test-subscription',
  'pubsub.googleapis.com/subscription/ack_latencies', 
  60*60,
  'ALIGN_SUM'
);

client.getMetricsHelper().fetchMetricSingleValue(
  'test-subscription',
  'pubsub.googleapis.com/subscription/num_outstanding_messages', 
  60*60,
  'ALIGN_SUM'
);
