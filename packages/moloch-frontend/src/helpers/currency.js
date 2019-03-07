import { utils } from "ethers";

export function convertWeiToDollars(weiAmount, exchangeRate) {
  console.log('weiAmount: ', weiAmount);
  console.log('exchangeRate: ', exchangeRate);
  console.log('utils.formatEther(weiAmount): ', utils.formatEther(weiAmount));
  console.log('utils.formatEther(exchangeRate): ', utils.formatEther(exchangeRate));
  const weitoEth = utils.formatEther(weiAmount)
  const exchWeiToEth = utils.formatEther(exchangeRate)
  
  return new Intl.NumberFormat().format(parseFloat(weitoEth * exchWeiToEth))
}