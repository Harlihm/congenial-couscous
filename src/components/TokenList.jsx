import React from 'react';
import { ethers } from 'ethers';

export function TokenList({ tokenInfo, onApprove }) {
  return (
    <div className="space-y-4">
      {tokenInfo.map((info, index) => (
        <div key={index} className="bg-white p-4 rounded shadow">
          <p>Token: {info.tokenAddress}</p>
          <p>Balance: {ethers.formatUnits(info.balance, 18)}</p>
          <p>Allowance: {ethers.formatUnits(info.allowance, 18)}</p>
          <button
            onClick={() => onApprove(info.tokenAddress)}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}