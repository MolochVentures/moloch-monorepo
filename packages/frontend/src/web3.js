import SafeProvider from "safe-web3-provider";
import { ethers } from "ethers";

const molochAbi = require("./abi/Moloch.abi.json");
const molochPoolAbi = require("./abi/MolochPool.abi.json");
const erc20Abi = require("./abi/Weth.abi.json");
const medianizerAbi = require("./abi/Medianizer.abi.json");

let moloch;
let molochPool;
let token;
let medianizer;
let eth;

export async function initWeb3(client, loggedInUser) {
  const loginMethod = localStorage.getItem("loginType");
  if (loginMethod === "gnosis") {
    await initGnosisSafe(client);
  } else {
    await initMetamask(client, loggedInUser);
  }
}

async function checkNetwork(eth) {
  const network = await eth.getNetwork();
  console.log("network: ", network);
  if (network.chainId !== 1) {
    alert("Please set Web3 provider to Mainnet and try again.");
    return false;
  }
  return true;
}

export async function initMetamask(client, loggedInUser) {
  if (!window.ethereum && !window.web3) {
    // Non-DApp browsers won't work.
    alert("Web3 not detected.");
  }
  let coinbase = "";
  if (window.ethereum) {
    // Modern DApp browsers need to enable Metamask access.
    await window.ethereum.enable();
    let web3Provider = window["ethereum"] || window.web3.currentProvider;
    eth = new ethers.providers.Web3Provider(web3Provider);
    if (await checkNetwork(eth)) {
      localStorage.setItem("loginType", "metamask");
      coinbase = (await eth.listAccounts())[0].toLowerCase();
    }
  }
  if (client && loggedInUser !== coinbase) {
    client.writeData({
      data: {
        loggedInUser: coinbase
      }
    });
    window.localStorage.setItem("loggedInUser", coinbase);
  }
  return eth;
}

export async function initGnosisSafe(client) {
  /**
   *  Create Safe Provider
   */
  const provider = new SafeProvider({
    // TODO: CHANGE THIS TO INFURA/ALCHEMY
    rpcUrl: process.env.REACT_APP_ETH_URL
  });

  /**
   *  Create Web3
   */
  let coinbase = "";
  eth = new ethers.providers.Web3Provider(provider);
  if (await checkNetwork(eth)) {
    localStorage.setItem("loginType", "gnosis");
    coinbase = (await eth.listAccounts())[0].toLowerCase();
  }
  client.writeData({
    data: {
      loggedInUser: coinbase
    }
  });
  window.localStorage.setItem("loggedInUser", coinbase);
}

export async function getEthSigner() {
  if (!eth) {
    if (localStorage.getItem("loginType") === "metamask") {
      eth = await initMetamask();
    } else if (localStorage.getItem("loginType") === "gnosis") {
      eth = await initGnosisSafe();
    } else {
      throw new Error("Not logged in with web3.");
    }
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
    molochPool = new ethers.Contract(process.env.REACT_APP_MOLOCH_POOL_ADDRESS, molochPoolAbi, eth.getSigner());
  } else {
    const provider = ethers.getDefaultProvider();
    molochPool = new ethers.Contract(process.env.REACT_APP_MOLOCH_POOL_ADDRESS, molochPoolAbi, provider);
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
  medianizer = new ethers.Contract(process.env.REACT_APP_MEDIANIZER_ADDRESS, medianizerAbi, provider);
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
