// Generated by @wagmi/cli@1.3.0 on 7/17/2023 at 11:16:09 AM

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ouragan
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ouraganABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [{ name: '_tornado', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_depositAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_depositPrice', internalType: 'uint256', type: 'uint256' },
      {
        name: '_depositorPubkey',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
    ],
    name: 'ask',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'depositAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'depositPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'depositor',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'depositorPubkey',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'encryptedCommitment',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'proof', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'publicSignals', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'fill',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_root', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isKnownRoot',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'nonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      {
        name: '_encryptedCommitment',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
      { name: '_sharedKeyHash', internalType: 'uint256', type: 'uint256' },
      {
        name: '_withdrawerPubkey',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
      { name: '_nonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'order',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'sharedKeyHash',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawerPubkey',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
]