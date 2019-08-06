import { utils } from "ethers";
import { bigNumberify } from "ethers/utils";

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
  const weitoEth = utils.formatEther(weiAmount);
  const exchWeiToEth = utils.formatEther(exchangeRate);

  return currencyFormatter.format(parseFloat(weitoEth * exchWeiToEth));
}

export function getShareValue(totalShares, totalValue) {
  const ethPerShare = bigNumberify(totalShares).toNumber() > 0 ? parseFloat(utils.formatEther(totalValue)) / bigNumberify(totalShares).toNumber() : 0; // in eth
  const value = utils.parseEther(ethPerShare.toString()); // in wei
  return value;
}
