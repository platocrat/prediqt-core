import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
import { ethers } from 'hardhat';

/* OPTIMISM
import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from '../external/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
*/
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} = await getNamedAccounts();

  const result = await deploy('UniswapV3Factory', {
    from: deployer,
    args: [],
    log: true,
    gasPrice: ethers.BigNumber.from('0'), 
    gasLimit: 8999999, 
    contract: {
      abi: FACTORY_ABI,
      bytecode: FACTORY_BYTECODE,
    },
  });
  deployments.log(
    `🚀 contract UniswapV3Factory deployed at ${result.address} using ${result.receipt?.gasUsed} gas`
  );
};
export default func;
func.tags = ['AMM'];
