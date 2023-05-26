class MessageWorker {
  constructor(pubSubClient, ackDeadlineSeconds = 30) {
    this.pubSubClient = pubSubClient;
    this.ackDeadlineSeconds = ackDeadlineSeconds;
  }

  async processMessage(message, formattedSubscription, processorFunction) {
    this.validateProcessorFunction(processorFunction);

    const processingPromise = processorFunction(message);
    this.extendAckDeadlineUntilResolved(processingPromise, message, formattedSubscription);
  
    await processingPromise;
    await this.acknowledgeMessage(message, formattedSubscription);
  }
  
  validateProcessorFunction(processorFunction) {
    if (typeof processorFunction !== 'function') {
      console.log(processorFunction)
      throw new TypeError("processorFunction must be a function");
    }
  }

  async extendAckDeadlineUntilResolved(processingPromise, message, formattedSubscription) {
    while (await this.isProcessingIncomplete(processingPromise)) {
      await this.modifyAckDeadline(message, formattedSubscription);
    }
  }

  async isProcessingIncomplete(processingPromise) {
    const winner = await Promise.race([
      processingPromise,
      new Promise((resolve) => setTimeout(resolve, 10000, 'timeout')),
    ]);

    return winner === 'timeout';
  }

  async modifyAckDeadline(message, formattedSubscription) {
    const modifyAckDeadlineRequest = {
      subscription: formattedSubscription,
      ackIds: [message.ackId],
      ackDeadlineSeconds: this.ackDeadlineSeconds,
    };

    await this.pubSubClient.modifyAckDeadline(modifyAckDeadlineRequest);
    console.log(`Reset ack deadline for "${message.message.data}" for ${this.ackDeadlineSeconds}s.`);
  }

  async acknowledgeMessage(message, formattedSubscription) {
    const ackRequest = {
      subscription: formattedSubscription,
      ackIds: [message.ackId],
    };

    await this.pubSubClient.acknowledge(ackRequest);
    console.log(`Acknowledged: "${message.message.data}"`);
  }
}

module.exports = MessageWorker;
