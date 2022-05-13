import { assert } from 'chai';
import { Wallet } from 'ethers';
import { ethers } from 'hardhat';
import Uniswap from '../scripts/Uniswap';
import IERC20 from '../abi/IERC20.json';

describe(`Uniswap`, () => {
    it(`swapExactETHForTokens test`, async () => {
        const accounts = await ethers.getSigners();
        const owner = accounts[0];
        const testWallet = Wallet.createRandom().connect(ethers.provider);

        await owner.sendTransaction({
            to: testWallet.address,
            value: ethers.utils.parseEther('1000'),
        });

        const uniswap = new Uniswap(
            ethers.provider,
            0,
            [testWallet]
        );
        
        const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
        const dai = new ethers.Contract(DAI, IERC20, owner);

        console.log(`${await dai.balanceOf(testWallet.address)}`)
        await uniswap.swapExactETHForTokens(testWallet.address, ethers.utils.parseEther('100').toString(), DAI, '10000');

        const resultBalance = await dai.balanceOf(testWallet.address);
        console.log(`${resultBalance}`);
        assert(resultBalance.gt(0));
    });
});