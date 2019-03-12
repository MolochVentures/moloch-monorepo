import SafeProvider from "safe-web3-provider"
import { ethers } from 'ethers';

const molochAbi = require('./abi/Moloch.abi.json')
const erc20Abi = require('./abi/ERC20.abi.json')
const medianizerAbi = require('./abi/Medianizer.abi.json')

let moloch
let token
let medianizer
let eth

export async function initMetamask() {
  if (!window.ethereum && !window.web3) {
    // Non-DApp browsers won't work.
    alert("This page must be viewed on a Web3 enabled browser.");
  }
  if (window.ethereum) {
    // Modern DApp browsers need to enable Metamask access.
    try {
      await window.ethereum.enable()
      let web3Provider = window['ethereum'] || window.web3.currentProvider
      eth = new ethers.providers.Web3Provider(web3Provider);
      eth = eth.getSigner()
      localStorage.setItem("loginType", "metamask");
    } catch (error) {
      alert("Metamask needs to be enabled.")
    }
  }
  return eth
}

export function initGnosisSafe() {
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
  eth = new ethers.providers.Web3Provider(provider);
  localStorage.setItem("loginType", "gnosis");
  return eth
}

export async function initMoloch() {
  if (!eth) {
    if (localStorage.getItem("loginType") === "metamask") {
      eth = await initMetamask()
    } else if (localStorage.getItem("loginType") === "gnosis") {
      eth = await initGnosisSafe()
    } else {
      throw new Error("Not logged in with web3.")
    }
  }
  moloch = new ethers.Contract(process.env.REACT_APP_MOLOCH_ADDRESS, molochAbi, eth)
  // moloch = new web3.eth.Contract(molochAbi, process.env.REACT_APP_MOLOCH_ADDRESS)
  return moloch
}

export async function initToken() {
  if (!eth) {
    if (localStorage.getItem("loginType") === "metamask") {
      eth = await initMetamask()
    } else if (localStorage.getItem("loginType") === "gnosis") {
      eth = await initGnosisSafe()
    } else {
      throw new Error("Not logged in with web3.")
    }
  }
  // token = new web3.eth.Contract(erc20Abi, process.env.REACT_APP_TOKEN_ADDRESS)
  token = new ethers.Contract(process.env.REACT_APP_TOKEN_ADDRESS, erc20Abi, eth)
  return token
}

export async function initMedianizer() {
  // pull from mainnet
  let provider = ethers.getDefaultProvider();
  medianizer = new ethers.Contract(process.env.REACT_APP_MEDIANIZER_ADDRESS, medianizerAbi, provider)
  return medianizer
}

export async function getWeb3() {
  if (!eth) {
    if (localStorage.getItem("loginType") === "metamask") {
      eth = await initMetamask()
    } else if (localStorage.getItem("loginType") === "gnosis") {
      eth = await initGnosisSafe()
    } else {
      throw new Error("Not logged in with web3.")
    }
  }
  return eth
}

export async function getMoloch() {
  if (!moloch) {
    await initMoloch()
  }
  return moloch
}

export async function getToken() {
  if (!token) {
    await initToken()
  }
  return token
}

export async function getMedianizer() {
  if (!medianizer) {
    await initMedianizer()
  }
  return medianizer
}