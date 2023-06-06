const client = require('./init_client');
const path = require('path');

const serviceName = 'pubsub-node'
const topicName = 'test-topic';
const concurrency = 1;

async function everyMinute() {
  const subs = await client.getTopicSubscriptions(topicName);

  const unackedMessagesMetricName = 'pubsub.googleapis.com/subscription/num_undelivered_messages';
  const latencyPeriodSeconds = 60*60;
  const latencyMetricName = 'pubsub.googleapis.com/subscription/ack_latencies';
  let totalProcessingTime = 0;
  let totalAverageProcessingTime = 0;

  for (const subscription of subs) {
    const subscriptionName = path.basename(subscription.name);

    const unackedMessages = await client.getMetricsHelper().fetchMetricSingleValue(
      subscriptionName, 
      unackedMessagesMetricName,
      600
    );

    const numberOfPods = await client.getKubeHelper().getPodCountForService('default', serviceName);

    const averageProcessingTime = await client.getMetricsHelper().fetchMetricSingleValue(
      subscriptionName,
      latencyMetricName, 
      latencyPeriodSeconds,
      'ALIGN_SUM'
    ) || 0;

    console.log('>> unackedMessages', unackedMessages);
    console.log('>> numberOfPods', numberOfPods);
    console.log('>> averageProcessingTime', averageProcessingTime);

    if (unackedMessages > 0) { // need to scale up

    } else { // need to scale down

    }

    


    // totalProcessingTime += (unackedMessages * averageProcessingTime);
    const podsNeeded = unackedMessages / concurrency;

  }
  
}

everyMinute();