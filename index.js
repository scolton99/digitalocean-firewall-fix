const fetch = require('node-fetch');

const { DIGITALOCEAN_API_KEY } = process.env;

const main = async () => {
  console.log(`##teamcity[setParameter name='env.LAST_IP' VALUE='new value']`);
};

main();
