const fs = require('fs');

const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY; // Set your API key in env
const API_URL = 'https://api-amoy.polygonscan.com/api';

const deployment = require('./deployments/deployment.json');

async function checkVerified(address) {
  const url = `${API_URL}?module=contract&action=getsourcecode&address=${address}&apikey=${POLYGONSCAN_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "1" && data.result && data.result[0].SourceCode) {
    return data.result[0].SourceCode.length > 0;
  }
  return false;
}

async function main() {
  if (!POLYGONSCAN_API_KEY) {
    console.error('Please set your POLYGONSCAN_API_KEY environment variable.');
    process.exit(1);
  }
  const contracts = Object.entries(deployment);
  for (const [name, { address }] of contracts) {
    const verified = await checkVerified(address);
    console.log(`${name} (${address}): ${verified ? '✅ Verified' : '❌ Not Verified'}`);
  }
}

main();
