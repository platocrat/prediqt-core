import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

/* OPTIMISM
import {
  abi as SWAP_ROUTER_ABI,
  bytecode as SWAP_ROUTER_BYTECODE,
} from '../external/contracts/SwapRouter.sol/SwapRouter.json';
*/

import {
  abi as SWAP_ROUTER_ABI,
  bytecode as SWAP_ROUTER_BYTECODE,
} from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import { ethers } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer, weth} = await getNamedAccounts();
  const factory = await deployments.get('UniswapV3Factory');

  const result = await deploy('SwapRouter', {
    from: deployer,
    args: [factory.address, weth],
    log: true,
    gasPrice: ethers.BigNumber.from('0'),
    gasLimit: 8999999,
    contract: {
      abi: SWAP_ROUTER_ABI,
      bytecode: SWAP_ROUTER_BYTECODE,
    },
  });
  deployments.log(
    `🚀 contract SwapRouter deployed at ${result.address} using ${result.receipt?.gasUsed} gas`
  );
};
export default func;
func.tags = ['AMM'];
module.exports.runAtTheEnd = true;
