const fetch = require('node-fetch');

const { TC_API_KEY, DIGITALOCEAN_API_KEY } = process.env;

const main = async () => {
  await fetch('https://ci.sdc.sx/app/rest/buildTypes/Local_DigitalOceanFirewallFix_Main/parameters/env.LAST_IP', {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain',
      'Authorization': `Bearer ${TC_API_KEY}`
    },
    body: 'new value'
  });

  // console.log(`##teamcity[setParameter name='env.LAST_IP' value='new value']`);
};

main();
