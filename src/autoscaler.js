const StqPubSubApi = require('./StqPubSub/Api');

// Replace 'path_to_your_keyfile' with the actual path to your key.json file.
const client = new StqPubSubApi('key.json');

const serviceName = 'pubsub-node'
const topicName = 'test-topic';
const concurrency = 1;

function everyMinute() {
  const subs = client.getTopicSubscriptions(topicName);
  console.log(subs);

  const unackedMessagesMetricName = 'pubsub.googleapis.com/subscription/num_undelivered_messages';
  const totalProcessingTime = 0;
  const latencyPeriodSeconds = 60*60;
  const latencyMetricName = 'pubsub.googleapis.com/subscription/ack_latencies';


  for(subscriptionName in subs){
    console.log(sub)
    const unackedMessages = client.getMetricsHelper().fetchMetricSingleValue(
      subscriptionName, 
      unackedMessagesMetricName,

    );
    const numberOfPods = client.getKubeHelper().getPodCountForService(serviceName);
    const averageProcessingTime = client.getMetricsHelper().fetchMetricSingleValue(
      subscriptionName,
      latencyMetricName, 
      latencyPeriodSeconds,
      'ALIGN_SUM'
    );
    const processingTime = unackedMessages * numberOfPods
    // totalProcessingTime += processingTime;  
  };
}

everyMinute();