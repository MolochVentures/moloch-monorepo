export function formatEthAddress(address) {
  return `${address.substring(0, 6)}...${address.slice(-4)}`
}