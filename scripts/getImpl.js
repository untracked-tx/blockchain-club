const hre = require("hardhat");

async function main() {
  const proxies = [
    "0x8ec72B7061dc368ffD889fa39c6B3b1480A523CC",
    "0x753E062aeEAB644Ce22942815f5367106a750F4d",
    "0x426d3599e38733B6D50fE0cE0755A83BA0FbAE5E",
    "0x430EDAEb952444ee3937a39c96210EEa30C97Ee1"
  ];
  const slot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  for (const proxy of proxies) {
    // Use the network.provider.send RPC method to get the storage value
    const impl = await hre.network.provider.send("eth_getStorageAt", [
      proxy,
      slot,
      "latest"
    ]);
    const implAddress = "0x" + impl.slice(26);
    console.log(`Proxy: ${proxy}\nImplementation: ${implAddress}\n`);
  }
}
main();
