import { ethers } from 'ethers';

export async function getChainId() {
  if (!window.ethereum) return null;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    return network.chainId.toString();
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
}

export async function checkTokenBalance(tokenAddress, walletAddress, provider) {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    const balance = await tokenContract.balanceOf(walletAddress);
    return balance > 0;
  } catch (error) {
    console.error('Error checking token balance:', error);
    return false;
  }
}