class MessageWorker {
  constructor(pubSubClient, ackDeadlineSeconds = 30) {
    this.pubSubClient = pubSubClient;
    this.ackDeadlineSeconds = ackDeadlineSeconds;
  }

  async processMessage(message, formattedSubscription, processorFunction) {
    if (typeof processorFunction !== 'function') {
      console.log(processorFunction)
      throw new TypeError("processorFunction must be a function");
    }
    
    const processingPromise = processorFunction(message);

    const deadlineExtensionPromise = this.extendAckDeadlineUntilResolved(
      processingPromise, 
      message, 
      formattedSubscription
    );

    await Promise.all([processingPromise, deadlineExtensionPromise]);

    const ackRequest = {
      subscription: formattedSubscription,
      ackIds: [message.ackId],
    };

    await this.pubSubClient.acknowledge(ackRequest);
    console.log(`Acknowledged: "${message.message.data}"`);
  }

  async extendAckDeadlineUntilResolved(processingPromise, message, formattedSubscription) {
    while (true) {
      const winner = await Promise.race([
        processingPromise,
        new Promise((resolve) => setTimeout(resolve, 10000, 'timeout')),
      ]);

      if (winner !== 'timeout') break;

      const modifyAckDeadlineRequest = {
        subscription: formattedSubscription,
        ackIds: [message.ackId],
        ackDeadlineSeconds: this.ackDeadlineSeconds,
      };

      await this.pubSubClient.modifyAckDeadline(modifyAckDeadlineRequest);
      console.log(
        `Reset ack deadline for "${message.message.data}" for ${this.ackDeadlineSeconds}s.`
      );
    }
  }
}

module.exports = MessageWorker;