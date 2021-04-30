import {expect} from './chai-setup';
import {
  deployments,
  ethers,
  getNamedAccounts,
  getUnnamedAccounts,
} from 'hardhat';
import {DummyERC20, MarketFactory} from '../typechain';
import {setupUser, setupUsers} from './utils';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('MarketFactory');
  const {deployer} = await getNamedAccounts();

  await deployments.deploy('DummyERC20', {
    from: deployer,
    args: [],
    log: true,
  });
  const contracts = {
    MarketFactory: <MarketFactory>await ethers.getContract('MarketFactory'),
    USDC: <DummyERC20>await ethers.getContract('DummyERC20'),
  };
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    users,
    deployer: await setupUser(deployer, contracts),
  };
});

describe('Market Factory', function () {
  const IPFS = 'QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t';

  it('Successfully create market', async function () {
    const {deployer} = await setup();
    const resolution = Math.round(new Date().getTime() / 1000) + 10000;

    await expect(
      deployer.MarketFactory.create(
        IPFS,
        ['yes', 'no'],
        deployer.address,
        deployer.address,
        resolution,
        deployer.USDC.address
      )
    ).to.emit(deployer.MarketFactory, 'Deployed');
  });

  it('Fail at creating a Market w/ one outcome', async function () {
    const {deployer} = await setup();
    const resolution = Math.round(new Date().getTime() / 1000) + 10000;

    await expect(
      deployer.MarketFactory.create(
        IPFS,
        ['yes'],
        deployer.address,
        deployer.address,
        resolution,
        deployer.USDC.address
      )
    ).to.be.reverted;
  });
});
