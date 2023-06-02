const { PubSub, v1 } = require('@google-cloud/pubsub');
const fs = require('fs');
const MessageWorker = require('./Worker');
const MetricsHelper = require('./MetricsHelper');
const KubeHelper = require('./KubeHelper');

class Api {
  constructor(keyFilename) {
    const keyFile = JSON.parse(fs.readFileSync(keyFilename, 'utf8'));
    this.projectId = keyFile.project_id;

    this.pubSubClient = new PubSub({ keyFilename });

    this.subClient = new v1.SubscriberClient({ keyFilename });

    this.messageWorker = new MessageWorker(this.subClient);

    this.metricsHelper = new MetricsHelper(this.pubSubClient, this.projectId);
    
    this.kubeHelper = new KubeHelper();
  }

  // Topics
  async createTopic(topicName) {
    const [topic] = await this.pubSubClient.createTopic(topicName);
    console.log(`Topic ${topic.name} created.`);
  }

  async deleteTopic(topicName) {
    await this.pubSubClient.topic(topicName).delete();
    console.log(`Topic ${topicName} deleted.`);
  }

  // Subscriptions
  async createSubscription(topicName, subscriptionName) {
    const [subscription] = await this.pubSubClient.topic(topicName).createSubscription(subscriptionName);
    console.log(`Subscription ${subscription.name} created.`);
  }

  async deleteSubscription(subscriptionName) {
    await this.pubSubClient.subscription(subscriptionName).delete();
    console.log(`Subscription ${subscriptionName} deleted.`);
  }

  // Publishing and Receiving
  async publishMessage(topicName, data, attributes = {}, orderingKey = '') {
    const messageObject = {
      data: Buffer.from(data),
      attributes,
      orderingKey
    };
    const messageId = await this.pubSubClient.topic(topicName).publishMessage(messageObject);
    console.log(`Message ${messageId} published.`);
    return messageId;
  }

  async pullAndProcessWithLeaseManagement(subscriptionNameOrId, processorFunction, maxMessages = 1) {
    const formattedSubscription =
      subscriptionNameOrId.indexOf('/') >= 0
        ? subscriptionNameOrId
        : this.subClient.subscriptionPath(this.projectId, subscriptionNameOrId);

    const request = {
      subscription: formattedSubscription,
      maxMessages: maxMessages,
      allowExcessMessages: false,
    };

    const [response] = await this.subClient.pull(request);

    if (response.receivedMessages.length === 0) {
      console.log('No messages received.');
      return 0;
    }

    const processPromises = response.receivedMessages.map(message =>
      this.messageWorker.processMessage(message, formattedSubscription, processorFunction)
    );

    await Promise.all(processPromises);

    console.log('Done.');
    return processPromises.length;
  }


  async getSubscription(subscriptionName) {
    try {
      const [subscriptions] = await this.pubSubClient.getSubscriptions();
      const subscription = subscriptions.find(sub => sub.name.split('/').pop() === subscriptionName);
      if (subscription) {
        console.log(`Subscription ${subscriptionName} exists and its info is: `, subscription.metadata);
        return subscription;
      } else {
        console.log(`Subscription ${subscriptionName} does not exist.`);
        return null;
      }
    } catch (error) {
      console.error(`Error occurred while trying to get subscription ${subscriptionName}: `, error);
      throw error;
    }
  }

  async getTopicSubscriptions(topicName) {
    try {
      const [subscriptions] = await this.pubSubClient.topic(topicName).getSubscriptions();
  
      if (subscriptions.length === 0) {
        console.log(`No subscriptions found for topic '${topicName}'.`);
        return;
      }
  
      console.log(`Subscriptions for topic '${topicName}':`);
      subscriptions.forEach(subscription => {
        console.log(subscription.name);
      });
      return subscriptions;
    } catch (error) {
      console.error(`Error occurred while fetching subscriptions for topic '${topicName}':`, error);
    }
  }
  
  getMetricsHelper() {
    return this.metricsHelper
  }

  getKubeHelper() {
    return this.kubeHelper
  }
}

module.exports = Api;
