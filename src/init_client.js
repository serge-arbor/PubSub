require('dotenv').config();

const StqPubSubApi = require('./StqPubSub/Api');

const client = new StqPubSubApi(process.env.GCP_KEY_PATH);

module.exports = client;