import {expect} from './chai-setup';
import {
  deployments,
  ethers,
  getNamedAccounts,
  getUnnamedAccounts,
} from 'hardhat';
import {DummyERC20, MarketFactory} from '../typechain';
import {setupUser, setupUsers} from './utils';

// TODO: move to AMM tests
export enum FeeAmount {
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000,
}

export const TICK_SPACINGS: {[amount in FeeAmount]: number} = {
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 200,
};

const setup = deployments.createFixture(async () => {
  await deployments.fixture('MarketFactory');
  await deployments.fixture('AMM');
  const {deployer} = await getNamedAccounts();

  await deployments.deploy('DummyERC20', {
    from: deployer,
    args: [],
    log: true,
  });
  const contracts = {
    MarketFactory: <MarketFactory>await ethers.getContract('MarketFactory'),
    UniswapFactory: await ethers.getContract('UniswapV3Factory'),
    USDC: <DummyERC20>await ethers.getContract('DummyERC20'),
  };
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    users,
    deployer: await setupUser(deployer, contracts),
  };
});

// TODO: split in small parts
describe('Market Dapp', function () {
  const resolution = Math.round(new Date().getTime() / 1000) + 10000;
  const IPFS = 'QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t';

  it('Should be able to create a market', async function () {
    const {deployer} = await setup();
    await deployer.USDC.mint(deployer.address, 10000);

    await deployer.MarketFactory.create(
      IPFS,
      ['YES', 'NO'],
      deployer.address,
      deployer.address,
      resolution,
      deployer.USDC.address
    );
    expect(await deployer.MarketFactory.marketsLength()).to.equal(1);

    const addr = await deployer.MarketFactory.markets(0);
    const marketContract = await ethers.getContractAt('MarketERC721', addr);
    expect(await marketContract.ipfs()).to.equal(IPFS);
    const addr1 = await marketContract.tokens(0);
    const token1Contract = await ethers.getContractAt('MarketERC20', addr1);
    expect(await token1Contract.symbol()).to.equal('YES');
    const addr2 = await marketContract.tokens(1);
    const token2Contract = await ethers.getContractAt('MarketERC20', addr2);
    expect(await token2Contract.symbol()).to.equal('NO');

    // mint
    expect(await token1Contract.balanceOf(deployer.address)).to.equal(0);
    expect(await token2Contract.balanceOf(deployer.address)).to.equal(0);
    await deployer.USDC.approve(marketContract.address, 10000);
    await marketContract.mint(10000);
    expect(await deployer.USDC.balanceOf(deployer.address)).to.equal(0);
    expect(await token1Contract.balanceOf(deployer.address)).to.equal(10000);
    expect(await token2Contract.balanceOf(deployer.address)).to.equal(10000);
    expect(await marketContract.status()).to.equal(1);

    // resolve
    expect(
      marketContract.resolve([
        {
          token: token1Contract.address,
          result: 100,
        },
        {
          token: token2Contract.address,
          result: 0,
        },
      ])
    ).to.be.revertedWith('Market: TOO_EARLY');
    expect(await marketContract.status()).to.equal(1);

    await ethers.provider.send('evm_setNextBlockTimestamp', [resolution]);
    await marketContract.resolve([
      {
        token: token1Contract.address,
        result: 100,
      },
      {
        token: token2Contract.address,
        result: 0,
      },
    ]);
    expect(await marketContract.status()).to.equal(2);
    await expect(
      marketContract.claim(deployer.address, 1000)
    ).to.be.revertedWith('Market: TOKEN_DOES_NOT_EXIST');

    await token2Contract.burn(10000); // TODO: test contract is not attached to market
    expect(await deployer.USDC.balanceOf(deployer.address)).to.equal(0);
    expect(await token2Contract.balanceOf(deployer.address)).to.equal(0);
    await token1Contract.burn(10000);
    expect(await token1Contract.balanceOf(deployer.address)).to.equal(0);
    expect(await deployer.USDC.balanceOf(deployer.address)).to.equal(10000);

    await token1Contract.burn(5000).catch((e: Error) => {
      expect(e).to.be.an('error');
    });

    await expect(
      deployer.UniswapFactory.createPool(
        token1Contract.address,
        token2Contract.address,
        FeeAmount.MEDIUM
      )
    ).to.emit(deployer.UniswapFactory, 'PoolCreated');
  });
});
