const fetch = require('node-fetch');

const { TC_API_KEY, DIGITALOCEAN_API_KEY, LAST_IP } = process.env;

const main = async () => {
  const newIpRes = await fetch('https://ifconfig.me', {
    headers: {
      'User-Agent': 'curl/7.54'
    }
  });
  const newIp = await newIpRes.text();

  if (newIp === LAST_IP) {
    console.log(`New IP and previous IP are the same (${newIp}); nothing to do.`);
    return;
  }

  console.log(DIGITALOCEAN_API_KEY);

  const firewallRes = await fetch('https://api.digitalocean.com/v2/firewalls', {
    headers: {
      'Authorization': `Bearer ${DIGITALOCEAN_API_KEY}`
    },
    method: 'GET'
  });

  if (!firewallRes.ok) {
    console.log(await firewallRes.text());
    process.exit(1);
  }

  const { firewalls } = await firewallRes.json();

  for (const firewall of firewalls) {
    let edited = false;

    if (!firewall.inbound_rules) continue;

    for (const inboundRule of firewall.inbound_rules) {
      if (!inboundRule.sources.addresses) continue;

      const match = inboundRule.sources.addresses.find(it => it === LAST_IP);
      if (!match) continue;

      edited = true;

      inboundRule.sources.addresses = inboundRule.sources.addresses.map(it => it === LAST_IP ? newIp : it);
    }

    if (!edited) continue;

    console.log(`Updating ${firewall.name}...`);

    const updateRes = await fetch(`https://api.digitalocean.com/v2/firewalls/${firewall.id}`, {
      headers: {
        'Authorization': `Bearer ${DIGITALOCEAN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify(firewall)
    });

    if (!updateRes.ok) {
      console.log(await updateRes.text());
    } else {
      console.log(`Updated ${firewall.name}.`);
    }
  }

  await fetch('https://ci.sdc.sx/app/rest/buildTypes/Local_DigitalOceanFirewallFix_Main/parameters/env.LAST_IP', {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain',
      'Authorization': `Bearer ${TC_API_KEY}`
    },
    body: newIp
  });
};

main();
