import { utils } from "ethers";
import { bigNumberify } from "ethers/utils";

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

/**
 * Converts Wei amount to Dollars
 * @param {*} weiAmount
 * @param {*} exchangeRate in Wei units
 */

export function convertWeiToDollars(weiAmount) {
  const weitoEth = utils.formatEther(weiAmount);

  return currencyFormatter.format(parseFloat(weitoEth));
}

export function getShareValue(totalShares, totalValue) {
  const ethPerShare = bigNumberify(totalShares).gt(0)
    ? bigNumberify(totalValue).div(bigNumberify(totalShares))
    : 0; // in eth
  return ethPerShare;
}
