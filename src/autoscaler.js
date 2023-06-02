const client = require('./init_client');

const serviceName = 'pubsub-node'
const topicName = 'test-topic';
const concurrency = 1;

async function everyMinute() {
  const subs = await client.getTopicSubscriptions(topicName);

  const unackedMessagesMetricName = 'pubsub.googleapis.com/subscription/num_undelivered_messages';
  const totalProcessingTime = 0;
  const latencyPeriodSeconds = 60*60;
  const latencyMetricName = 'pubsub.googleapis.com/subscription/ack_latencies';

  for (const subscription of subs) {
    const unackedMessages = await client.getMetricsHelper().fetchMetricSingleValue(
      subscription.name, 
      unackedMessagesMetricName,
      6000
    );

    console.log('>> unackedMessages', unackedMessages);

    if (unackedMessages === 0) { // need to scale down

    } else { // need to scale up

    }

    const numberOfPods = await client.getKubeHelper().getPodCountForService('default', serviceName);
    console.log('>> numberOfPods', numberOfPods);

    const averageProcessingTime = await client.getMetricsHelper().fetchMetricSingleValue(
      subscription.name,
      latencyMetricName, 
      latencyPeriodSeconds,
      'ALIGN_SUM'
    );

    console.log('>> averageProcessingTime', averageProcessingTime);

    const processingTime = unackedMessages * numberOfPods
    // totalProcessingTime += processingTime;  
  };

}

everyMinute();