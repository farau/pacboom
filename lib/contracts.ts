export const PAC_BOOM_ADDRESS = '0x17a51b837db44c390159218d30174ebeda2675f4' as const;
export const PAC_NUB_ADDRESS = '0x63297f90a703e405da48120530061a7c68c7eb84' as const;

export const pacBoomAbi = [
  {
    type: 'function',
    name: 'getEntryFee',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getPlayerPoints',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'claimPoints',
    stateMutability: 'payable',
    inputs: [
      { name: 'score', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
] as const;

export const pacNubAbi = [
  {
    type: 'function',
    name: 'tokensOwnedBy',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
] as const;
