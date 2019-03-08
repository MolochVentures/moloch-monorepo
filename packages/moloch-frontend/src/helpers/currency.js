import { utils } from "ethers";

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
});

/**
 * Converts Wei amount to Dollars
 * @param {*} weiAmount 
 * @param {*} exchangeRate in Wei units
 */
export function convertWeiToDollars(weiAmount, exchangeRate) {
  console.log('exchangeRate: ', exchangeRate);
  console.log('weiAmount: ', weiAmount);
  const weitoEth = utils.formatEther(weiAmount)
  const exchWeiToEth = utils.formatEther(exchangeRate)
  
  return currencyFormatter.format(parseFloat(weitoEth * exchWeiToEth))
}