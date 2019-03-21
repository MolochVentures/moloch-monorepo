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
    alert("Web3 not detected.");
  }
  if (window.ethereum) {
    // Modern DApp browsers need to enable Metamask access.
    try {
      await window.ethereum.enable()
      let web3Provider = window['ethereum'] || window.web3.currentProvider
      eth = new ethers.providers.Web3Provider(web3Provider);
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

export async function getEthSigner() {
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

export async function initMoloch(loggedInUser) {
  if (loggedInUser) {
    eth = await getEthSigner()
    moloch = new ethers.Contract(process.env.REACT_APP_MOLOCH_ADDRESS, molochAbi, eth.getSigner())
  } else {
    const provider = ethers.getDefaultProvider();
    moloch = new ethers.Contract(process.env.REACT_APP_MOLOCH_ADDRESS, molochAbi, provider)
  }
  return moloch
}

export async function initToken(loggedInUser) {
  if (loggedInUser) {
    eth = await getEthSigner()
    token = new ethers.Contract(process.env.REACT_APP_TOKEN_ADDRESS, erc20Abi, eth.getSigner())
  } else {
    const provider = ethers.getDefaultProvider();
    token = new ethers.Contract(process.env.REACT_APP_TOKEN_ADDRESS, erc20Abi, provider)
  }
  // token = new web3.eth.Contract(erc20Abi, process.env.REACT_APP_TOKEN_ADDRESS)
  return token
}

export async function initMedianizer() {
  // pull from mainnet
  let provider = ethers.getDefaultProvider();
  medianizer = new ethers.Contract(process.env.REACT_APP_MEDIANIZER_ADDRESS, medianizerAbi, provider)
  return medianizer
}

export async function getMoloch(loggedInUser) {
  await initMoloch(loggedInUser)
  return moloch
}

export async function getToken(loggedInUser) {
  await initToken(loggedInUser)
  return token
}

export async function getMedianizer() {
  if (!medianizer) {
    await initMedianizer()
  }
  return medianizer
}