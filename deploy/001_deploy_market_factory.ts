import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} = await getNamedAccounts();

  const result = await deploy('MarketFactory', {
    from: deployer,
    args: [],
    log: true,
    gasLimit: 8999999,
  });
  deployments.log(
    `🚀 contract MarketFactory deployed at ${result.address} using ${result.receipt?.gasUsed} gas`
  );
};
export default func;
func.tags = ['MarketFactory'];
