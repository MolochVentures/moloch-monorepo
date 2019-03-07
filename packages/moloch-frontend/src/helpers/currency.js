import { utils } from "ethers";

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
});

export function convertWeiToDollars(weiAmount, exchangeRate) {
  console.log('weiAmount: ', weiAmount);
  console.log('exchangeRate: ', exchangeRate);
  console.log('utils.formatEther(weiAmount): ', utils.formatEther(weiAmount));
  console.log('utils.formatEther(exchangeRate): ', utils.formatEther(exchangeRate));
  const weitoEth = utils.formatEther(weiAmount)
  const exchWeiToEth = utils.formatEther(exchangeRate)
  
  return formatter.format(parseFloat(weitoEth * exchWeiToEth))
}