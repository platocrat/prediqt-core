import 'dotenv/config';
import {HardhatUserConfig} from 'hardhat/types';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-gas-reporter';
import 'hardhat-abi-exporter';
import 'hardhat-typechain';
import 'solidity-coverage';
import '@eth-optimism/hardhat-ovm';

import {accounts, keys, node_url} from './utils/network';
import {utils} from 'ethers';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
          metadata: {
            bytecodeHash: 'none',
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
      goerli: '0x59bBEbA0608959D8cC68e7367ca9bF937901b423',
    },
    USDC: {
      default: 1,
      mumbai: '0x4ebE0f746aC8AB8870C96F34e2a6aF42BA9A3654', // dummyERC20
      goerli: '0xBFf1365cF0A67431484c00C63bf14cFD9ABBce5D', // dummyERC20
    },
    weth: {
      default: 2,
      mumbai: '0x4ebE0f746aC8AB8870C96F34e2a6aF42BA9A3654', // dummyERC20 TODO: test if needed to be WMATIC
      goerli: '0xBFf1365cF0A67431484c00C63bf14cFD9ABBce5D', // dummyERC20
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: accounts(process.env.HARDHAT_FORK),
      forking: process.env.HARDHAT_FORK
        ? {
            url: node_url(process.env.HARDHAT_FORK),
            blockNumber: process.env.HARDHAT_FORK_NUMBER
              ? parseInt(process.env.HARDHAT_FORK_NUMBER)
              : undefined,
          }
        : undefined,
    },
    optimism: {
      url: 'http://127.0.0.1:8545',
      accounts: accounts(),
      gasPrice: 0,
      blockGasLimit: 8999999,
      ovm: true,
    },
    localhost: {
      url: node_url('localhost'),
      accounts: accounts(),
    },
    mainnet: {
      gasPrice: parseInt(utils.parseUnits('140', 'gwei').toString()),
      url: node_url('mainnet'),
      accounts: accounts('mainnet'),
    },
    rinkeby: {
      url: node_url('rinkeby'),
      accounts: accounts('rinkeby'),
    },
    kovan: {
      url: node_url('kovan'),
      accounts: accounts('kovan'),
    },
    goerli: {
      gasPrice: parseInt(utils.parseUnits('140', 'gwei').toString()),
      url: node_url('goerli'),
      accounts: keys('goerli')[0] !== '' ? keys('goerli') : accounts('goerli'),
    },
    mumbai: {
      url: node_url('mumbai'),
      accounts: keys('mumbai')[0] !== '' ? keys('mumbai') : accounts('mumbai'),
      chainId: 80001,
      gasPrice: parseInt(utils.parseUnits('1', 'gwei').toString()),
    },
    matic: {
      url: node_url('matic'),
      accounts: accounts('matic'),
      chainId: 137,
      gasPrice: parseInt(utils.parseUnits('1', 'gwei').toString()),
    },
    staging: {
      url: node_url('goerli'),
      accounts: accounts('goerli'),
    },
  },
  paths: {
    sources: 'src',
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 1,
    enabled: process.env.REPORT_GAS ? true : false,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    maxMethodDiff: 10,
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  abiExporter: {
    path: './data/abi',
    clear: true,
    flat: true,
    spacing: 2,
  },
  ovm: {
    solcVersion: '0.7.6',
  },
  mocha: {
    timeout: 0,
  },
  external: process.env.HARDHAT_FORK
    ? {
        deployments: {
          hardhat: ['deployments/' + process.env.HARDHAT_FORK],
        },
      }
    : undefined,
};
export default config;
