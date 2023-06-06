const myWorkerFunction = async (message) => {
  console.log(`Processing "${message.message.data}"...`);
  // Simulate processing time
  const randomNumber = (Math.floor(Math.random() * (10 - 5 + 1)) + 5) * 1000;
  await new Promise((resolve) => setTimeout(resolve, randomNumber));
  console.log(`Finished processing "${message.message.data}"`);
};


module.exports = myWorkerFunction;