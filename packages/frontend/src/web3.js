import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import Web3Connect from "web3connect";

const molochAbi = require("./abi/Moloch.abi.json");
const molochPoolAbi = require("./abi/MolochPool.abi.json");
const erc20Abi = require("./abi/Weth.abi.json");
const medianizerAbi = require("./abi/Medianizer.abi.json");

let moloch;
let molochPool;
let token;
let medianizer;
let eth;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: (process.env.REACT_APP_ETH_URL).split("/").pop()
    }
  }
};

const web3Connect = new Web3Connect.Core({
  network: "mainnet", // optional
  cacheProvider: false, // optional
  providerOptions // required
});

export async function initWeb3(client, loggedInUser) {
  let coinbase = "";
  const provider = await web3Connect.connect();
  console.log('provider: ', provider);
  if (provider) {
    eth = new ethers.providers.Web3Provider(provider);
    if (await checkNetwork(eth)) {
      const accounts = await eth.listAccounts();
      if (accounts.length > 0) {
        coinbase = accounts[0].toLowerCase();
      } else {
        console.error("Could not retrieve accounts...");
      }
    }
  } else {
    alert("No Web3 enabled, viewing in read-only mode.");
  }
  if (client && loggedInUser !== coinbase) {
    client.writeData({
      data: {
        loggedInUser: coinbase,
      },
    });
    window.localStorage.setItem("loggedInUser", coinbase);
  }
  return eth;
}

async function checkNetwork(eth) {
  const network = await eth.getNetwork();
  if (network.chainId !== 1) {
    alert("Please set Web3 provider to Mainnet and try again.");
    return false;
  }
  return true;
}

export async function getEthSigner() {
  if (!eth) {
    eth = await initWeb3();
  }
  return eth;
}

export async function initMoloch(loggedInUser) {
  if (loggedInUser) {
    eth = await getEthSigner();
    moloch = new ethers.Contract(process.env.REACT_APP_MOLOCH_ADDRESS, molochAbi, eth.getSigner());
  } else {
    const provider = ethers.getDefaultProvider();
    moloch = new ethers.Contract(process.env.REACT_APP_MOLOCH_ADDRESS, molochAbi, provider);
  }
  return moloch;
}

export async function initMolochPool(loggedInUser) {
  if (loggedInUser) {
    eth = await getEthSigner();
    molochPool = new ethers.Contract(
      process.env.REACT_APP_MOLOCH_POOL_ADDRESS,
      molochPoolAbi,
      eth.getSigner(),
    );
  } else {
    const provider = ethers.getDefaultProvider();
    molochPool = new ethers.Contract(
      process.env.REACT_APP_MOLOCH_POOL_ADDRESS,
      molochPoolAbi,
      provider,
    );
  }
  return molochPool;
}

export async function initToken(loggedInUser) {
  if (loggedInUser) {
    eth = await getEthSigner();
    token = new ethers.Contract(process.env.REACT_APP_TOKEN_ADDRESS, erc20Abi, eth.getSigner());
  } else {
    const provider = ethers.getDefaultProvider();
    token = new ethers.Contract(process.env.REACT_APP_TOKEN_ADDRESS, erc20Abi, provider);
  }
  return token;
}

export async function initMedianizer() {
  // pull from mainnet
  let provider = ethers.getDefaultProvider();
  medianizer = new ethers.Contract(
    process.env.REACT_APP_MEDIANIZER_ADDRESS,
    medianizerAbi,
    provider,
  );
  return medianizer;
}

export async function getMoloch(loggedInUser) {
  await initMoloch(loggedInUser);
  return moloch;
}

export async function getMolochPool(loggedInUser) {
  await initMolochPool(loggedInUser);
  return molochPool;
}

export async function getToken(loggedInUser) {
  await initToken(loggedInUser);
  return token;
}

export async function getMedianizer() {
  if (!medianizer) {
    await initMedianizer();
  }
  return medianizer;
}
