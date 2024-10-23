// config.js

const config = {
    chain_id : '0x13e31',//'0x13e31', //Blast mainnet
	pacArmyIpfs : 'https://bafybeihaicjjn6hq7afybcjcqdpwwvjbjz4q6etnzbhvli6mmtn7w76fxm.ipfs.dweb.link/', //adresse ipfs metadata pac army
	pacArmyImgIpfs : 'https://bafybeifssnwvx3rnt6gbblgcrnj5wvofb4l264uqftjl25jy6weit23zla.ipfs.dweb.link/', //adresse ipfs image pac army
    pacBoomAddress: '0x17a51b837db44c390159218d30174ebeda2675f4',
    pacBoomABI : [
		{
		  "inputs": [
			{
			  "internalType": "address[]",
			  "name": "_nftContracts",
			  "type": "address[]"
			},
			{
			  "internalType": "address",
			  "name": "_blastTokenAddress",
			  "type": "address"
			},
			{
			  "internalType": "uint256",
			  "name": "_entryFee",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "thresholdBonus_",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "nonpayable",
		  "type": "constructor"
		},
		{
		  "inputs": [],
		  "name": "ECDSAInvalidSignature",
		  "type": "error"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "length",
			  "type": "uint256"
			}
		  ],
		  "name": "ECDSAInvalidSignatureLength",
		  "type": "error"
		},
		{
		  "inputs": [
			{
			  "internalType": "bytes32",
			  "name": "s",
			  "type": "bytes32"
			}
		  ],
		  "name": "ECDSAInvalidSignatureS",
		  "type": "error"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "owner",
			  "type": "address"
			}
		  ],
		  "name": "OwnableInvalidOwner",
		  "type": "error"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "account",
			  "type": "address"
			}
		  ],
		  "name": "OwnableUnauthorizedAccount",
		  "type": "error"
		},
		{
		  "inputs": [],
		  "name": "ReentrancyGuardReentrantCall",
		  "type": "error"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "value",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "length",
			  "type": "uint256"
			}
		  ],
		  "name": "StringsInsufficientHexLength",
		  "type": "error"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "damage",
			  "type": "uint256"
			}
		  ],
		  "name": "BossAttacked",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "life",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "prize",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "entryFee",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "damage",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "category",
			  "type": "uint256"
			}
		  ],
		  "name": "BossCreated",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "BossDestroyed",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": true,
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "amount",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "lockDuration",
			  "type": "uint256"
			}
		  ],
		  "name": "EtherLocked",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": true,
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "amount",
			  "type": "uint256"
			}
		  ],
		  "name": "EtherUnlocked",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "timestamp",
			  "type": "uint256"
			}
		  ],
		  "name": "LeaderboardReinitialized",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": true,
			  "internalType": "address",
			  "name": "previousOwner",
			  "type": "address"
			},
			{
			  "indexed": true,
			  "internalType": "address",
			  "name": "newOwner",
			  "type": "address"
			}
		  ],
		  "name": "OwnershipTransferred",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": true,
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "score",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "bonus",
			  "type": "uint256"
			}
		  ],
		  "name": "PointsEarned",
		  "type": "event"
		},
		{
		  "inputs": [],
		  "name": "LOCK_DURATION_14_DAYS",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "LOCK_DURATION_28_DAYS",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "MIN_LOCK_AMOUNT",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "_nftContract",
			  "type": "address"
			}
		  ],
		  "name": "addNftContract",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "timestamp",
			  "type": "uint256"
			},
			{
			  "internalType": "bytes",
			  "name": "signature",
			  "type": "bytes"
			}
		  ],
		  "name": "attackBoss",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "payable",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "blastToken",
		  "outputs": [
			{
			  "internalType": "contract IERC20",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "bosses",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "life",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "prize",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "entryFeeBoss",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "damage",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "category",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "bossesKilled",
		  "outputs": [
			{
			  "internalType": "bool",
			  "name": "",
			  "type": "bool"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "score",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "timestamp",
			  "type": "uint256"
			},
			{
			  "internalType": "bytes",
			  "name": "signature",
			  "type": "bytes"
			}
		  ],
		  "name": "claimPoints",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "payable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "serial_",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "life_",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "prize_",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "entryFee_",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "damage_",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "category_",
			  "type": "uint256"
			}
		  ],
		  "name": "createBoss",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			}
		  ],
		  "name": "getBoss",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "life",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "damage",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "entryFeeBoss",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "prize",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "category",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getEntryFee",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getListBossKilledSerials",
		  "outputs": [
			{
			  "internalType": "uint256[]",
			  "name": "",
			  "type": "uint256[]"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getListBossSerials",
		  "outputs": [
			{
			  "internalType": "uint256[]",
			  "name": "",
			  "type": "uint256[]"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getMapPlayerKilledBosses",
		  "outputs": [
			{
			  "components": [
				{
				  "internalType": "uint256",
				  "name": "serial",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "life",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "prize",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "entryFeeBoss",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "damage",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "category",
				  "type": "uint256"
				}
			  ],
			  "internalType": "struct PacBoom.PacBoss[]",
			  "name": "",
			  "type": "tuple[]"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getNbNftContract",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayer",
		  "outputs": [
			{
			  "components": [
				{
				  "internalType": "uint256",
				  "name": "bonus",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "points",
				  "type": "uint256"
				},
				{
				  "internalType": "bool",
				  "name": "initialized",
				  "type": "bool"
				},
				{
				  "components": [
					{
					  "internalType": "uint256",
					  "name": "amount",
					  "type": "uint256"
					},
					{
					  "internalType": "uint256",
					  "name": "lockEndTime",
					  "type": "uint256"
					},
					{
					  "internalType": "uint256",
					  "name": "lockDuration",
					  "type": "uint256"
					}
				  ],
				  "internalType": "struct PacBoom.Lock[]",
				  "name": "locks",
				  "type": "tuple[]"
				},
				{
				  "internalType": "uint256",
				  "name": "totalLocked",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "lockDurationMax",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "bossKills",
				  "type": "uint256"
				}
			  ],
			  "internalType": "struct PacBoom.Player",
			  "name": "",
			  "type": "tuple"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerBonus",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerBossKills",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerLockDurationMax",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "durationMax",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerLocks",
		  "outputs": [
			{
			  "components": [
				{
				  "internalType": "uint256",
				  "name": "amount",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "lockEndTime",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "lockDuration",
				  "type": "uint256"
				}
			  ],
			  "internalType": "struct PacBoom.Lock[]",
			  "name": "",
			  "type": "tuple[]"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerPoints",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerTotalLocked",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "amount",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getSigner",
		  "outputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getThresholdBonus",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "playerAddress",
			  "type": "address"
			}
		  ],
		  "name": "getTotalLockedEther",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getTotalLockedEtherAllPlayers",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "playerAddress",
			  "type": "address"
			}
		  ],
		  "name": "getTotalLocks",
		  "outputs": [
			{
			  "components": [
				{
				  "internalType": "uint256",
				  "name": "amount",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "lockEndTime",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "lockDuration",
				  "type": "uint256"
				}
			  ],
			  "internalType": "struct PacBoom.Lock[]",
			  "name": "",
			  "type": "tuple[]"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "playerAddress",
			  "type": "address"
			}
		  ],
		  "name": "getTotalUnLockedEther",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			}
		  ],
		  "name": "getWhoKilledBoss",
		  "outputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "hasNFTFromAnyCollection",
		  "outputs": [
			{
			  "internalType": "bool",
			  "name": "",
			  "type": "bool"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			}
		  ],
		  "name": "isBossKilled",
		  "outputs": [
			{
			  "internalType": "bool",
			  "name": "",
			  "type": "bool"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "listBossKilledSerials",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "listBossSerials",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "lockChoice",
			  "type": "uint256"
			}
		  ],
		  "name": "lockEther",
		  "outputs": [],
		  "stateMutability": "payable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			},
			{
			  "internalType": "uint256",
			  "name": "index",
			  "type": "uint256"
			}
		  ],
		  "name": "numberOfNFTsFromACollection",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "numberOfNFTsFromAllCollections",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "owner",
		  "outputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			},
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "playerKilledBosses",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "life",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "prize",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "entryFeeBoss",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "damage",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "category",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "reinitializeLeaderboard",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "index",
			  "type": "uint256"
			}
		  ],
		  "name": "removeNftContract",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "removePlayer",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "renounceOwnership",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "entryFee_",
			  "type": "uint256"
			}
		  ],
		  "name": "setEntryFee",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "_signer",
			  "type": "address"
			}
		  ],
		  "name": "setSigner",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "thresholdBonus_",
			  "type": "uint256"
			}
		  ],
		  "name": "setThresholdBonus",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "totalBosses",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "totalBossesKilled",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "newOwner",
			  "type": "address"
			}
		  ],
		  "name": "transferOwnership",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "whoKilledBosses",
		  "outputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "withdrawBlastTokens",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "withdrawUnlockedEther",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		}
	  ],
	pacNubAddress : '0x63297f90a703e405da48120530061a7c68c7eb84',
	pacNubABI : [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AlreadyInitialized","type":"error"},{"inputs":[],"name":"IncorrectMaxSupply","type":"error"},{"inputs":[],"name":"TransferFailed","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"baseURI","type":"string"}],"name":"BaseUriUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_toTokenId","type":"uint256"}],"name":"BatchMetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"minClaimRateBips","type":"uint256"}],"name":"GasFeesClaim","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"MetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"},{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint128","name":"value","type":"uint128"},{"indexed":false,"internalType":"uint24","name":"quantity","type":"uint24"},{"indexed":false,"internalType":"uint64","name":"lockPeriod","type":"uint64"},{"indexed":false,"internalType":"string","name":"mintType","type":"string"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"preRevealImageURI","type":"string"}],"name":"PreRevealImageUriUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint128","name":"mintPrice","type":"uint128"},{"indexed":false,"internalType":"uint64","name":"lockPeriod","type":"uint64"},{"indexed":false,"internalType":"uint24","name":"maxMintsPerTransaction","type":"uint24"},{"indexed":false,"internalType":"uint24","name":"maxMintsPerWallet","type":"uint24"},{"indexed":false,"internalType":"bool","name":"active","type":"bool"}],"name":"PrivateMintConfigUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"bool","name":"active","type":"bool"}],"name":"PrivateMintStateUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint128","name":"mintPrice","type":"uint128"},{"indexed":false,"internalType":"uint64","name":"lockPeriod","type":"uint64"},{"indexed":false,"internalType":"uint24","name":"maxMintsPerTransaction","type":"uint24"},{"indexed":false,"internalType":"uint24","name":"maxMintsPerWallet","type":"uint24"},{"indexed":false,"internalType":"bool","name":"active","type":"bool"}],"name":"PublicMintConfigUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"bool","name":"active","type":"bool"}],"name":"PublicMintStateUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"by","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Refund","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"by","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Upgrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"whitelistSigner","type":"address"}],"name":"WhitelistSignerUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"protocolFeeCollector","type":"address"},{"indexed":false,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint256","name":"ownerYield","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"protocolYield","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"referrerYield","type":"uint256"}],"name":"YieldClaim","type":"event"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"blastrStorage","outputs":[{"internalType":"contract IBlastrStorage","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minClaimRateBips","type":"uint256"}],"name":"claimGasFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimYield","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimableYield","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factoryAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"flipPrivateMintState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"flipPublicMintState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_ownerAddress","type":"address"},{"internalType":"address","name":"_storageAddress","type":"address"},{"internalType":"address","name":"_factoryAddress","type":"address"},{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"symbol_","type":"string"},{"internalType":"uint256","name":"_maxSupply","type":"uint256"},{"internalType":"string","name":"baseURI_","type":"string"},{"internalType":"string","name":"_preRevealImageURI","type":"string"},{"internalType":"address","name":"_referrer","type":"address"},{"internalType":"address","name":"_whitelistSigner","type":"address"},{"components":[{"internalType":"uint128","name":"mintPrice","type":"uint128"},{"internalType":"uint64","name":"lockPeriod","type":"uint64"},{"internalType":"uint24","name":"maxMintsPerTransaction","type":"uint24"},{"internalType":"uint24","name":"maxMintsPerWallet","type":"uint24"},{"internalType":"bool","name":"active","type":"bool"}],"internalType":"struct BlastrLibrary.MintConfig","name":"_publicMintConfig","type":"tuple"},{"components":[{"internalType":"uint128","name":"mintPrice","type":"uint128"},{"internalType":"uint64","name":"lockPeriod","type":"uint64"},{"internalType":"uint24","name":"maxMintsPerTransaction","type":"uint24"},{"internalType":"uint24","name":"maxMintsPerWallet","type":"uint24"},{"internalType":"bool","name":"active","type":"bool"}],"internalType":"struct BlastrLibrary.MintConfig","name":"_privateMintConfig","type":"tuple"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"initialized","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"locks","outputs":[{"internalType":"uint128","name":"value","type":"uint128"},{"internalType":"uint64","name":"lockPeriod","type":"uint64"},{"internalType":"uint64","name":"lockedAt","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint128","name":"_mintPrice","type":"uint128"},{"internalType":"uint64","name":"_lockPeriod","type":"uint64"},{"internalType":"uint24","name":"_quantity","type":"uint24"}],"name":"ownerMint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"preRevealImageURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint24","name":"_quantity","type":"uint24"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"privateMint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"privateMintConfig","outputs":[{"internalType":"uint128","name":"mintPrice","type":"uint128"},{"internalType":"uint64","name":"lockPeriod","type":"uint64"},{"internalType":"uint24","name":"maxMintsPerTransaction","type":"uint24"},{"internalType":"uint24","name":"maxMintsPerWallet","type":"uint24"},{"internalType":"bool","name":"active","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint24","name":"_quantity","type":"uint24"}],"name":"publicMint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"publicMintConfig","outputs":[{"internalType":"uint128","name":"mintPrice","type":"uint128"},{"internalType":"uint64","name":"lockPeriod","type":"uint64"},{"internalType":"uint24","name":"maxMintsPerTransaction","type":"uint24"},{"internalType":"uint24","name":"maxMintsPerWallet","type":"uint24"},{"internalType":"bool","name":"active","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"publicMintStartTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"referrer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"refund","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"refundedTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"baseURI_","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_preRevealImageURI","type":"string"}],"name":"setPreRevealImageURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint128","name":"mintPrice","type":"uint128"},{"internalType":"uint64","name":"lockPeriod","type":"uint64"},{"internalType":"uint24","name":"maxMintsPerTransaction","type":"uint24"},{"internalType":"uint24","name":"maxMintsPerWallet","type":"uint24"},{"internalType":"bool","name":"active","type":"bool"}],"internalType":"struct BlastrLibrary.MintConfig","name":"_privateMintConfig","type":"tuple"}],"name":"setPrivateMintConfig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint128","name":"mintPrice","type":"uint128"},{"internalType":"uint64","name":"lockPeriod","type":"uint64"},{"internalType":"uint24","name":"maxMintsPerTransaction","type":"uint24"},{"internalType":"uint24","name":"maxMintsPerWallet","type":"uint24"},{"internalType":"bool","name":"active","type":"bool"}],"internalType":"struct BlastrLibrary.MintConfig","name":"_publicMintConfig","type":"tuple"}],"name":"setPublicMintConfig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_whitelistSigner","type":"address"}],"name":"setWhitelistSigner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_ownerAddress","type":"address"}],"name":"tokensOwnedBy","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tvl","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"upgrade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"upgradedAt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"whitelistSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]

};


// Exporter correctement l'objet config
module.exports = config;