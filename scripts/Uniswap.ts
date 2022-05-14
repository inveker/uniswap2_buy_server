import { BigintIsh, Fetcher, Route, Token, TokenAmount, Trade, TradeType } from '@uniswap/sdk'
import { ethers, Wallet } from 'ethers'
import { Percent } from '@uniswap/sdk'
import UniswapV2Router02Abi from '../abi/UniswapV2Router02.json';
import appLog from './appLog';
import IERC20 from '../abi/IERC20.json';

interface ISwapData {
    amountOutMin: string;
    path: string[];
    deadline: number;
    value: string;
}

export default class Uniswap {
    readonly UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    readonly WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';


    constructor(
        readonly provider: ethers.providers.JsonRpcProvider
    ) {
        appLog(`Uniswap initializated: router = ${this.UNISWAP_ROUTER};`);
    }

    public async swapExactETHForTokens(walletPrivateKey: string, inputAmount: BigintIsh, outputToken: string, slippage: number, maxFeePerGas: number, timeout: number) {
        const privateKey = walletPrivateKey.slice(0, 2) == '0x' ? walletPrivateKey : `0x${walletPrivateKey}`;
        const wallet = new Wallet(privateKey, this.provider);
        const uniswapRouter = this._uniswapRouter(wallet);
        const swapData = await this._getSwapData(inputAmount, this._wethToken(), await Fetcher.fetchTokenData(1, outputToken), slippage, timeout);
        let feeData = await this.provider.getFeeData();

        const maxFee = maxFeePerGas * Math.pow(10, 9);
        if(maxFee === 0  || feeData.maxFeePerGas.lte(maxFee)) {
            const token = new ethers.Contract(outputToken, IERC20, wallet);
            const initialBalance = await token.balanceOf(wallet.address);
            await uniswapRouter.swapExactETHForTokensSupportingFeeOnTransferTokens(
                swapData.amountOutMin,
                swapData.path,
                wallet.address,
                swapData.deadline,
                {
                    value: swapData.value,
                    maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"],
                    maxFeePerGas: maxFee !== 0 ? maxFee : feeData["maxFeePerGas"],
                }
            );
            appLog(`Swap result = ${(await token.balanceOf(wallet.address)).sub(initialBalance)}`);
        } else {
            appLog(`Gas error. maxFeePerGas = ${maxFee}; network.maxFeePerGas = ${feeData.maxFeePerGas}`);
        }
    }

    protected _uniswapRouter(wallet: Wallet): ethers.Contract {
        return new ethers.Contract(this.UNISWAP_ROUTER, UniswapV2Router02Abi, wallet);
    }

    protected _wethToken(): Token {
        return new Token(1, this.WETH, 18);
    }

    protected async _getSwapData(inputAmount: BigintIsh, inputToken: Token, outputToken: Token, slippage: number, timeout: number): Promise<ISwapData> {
        const pair = await Fetcher.fetchPairData(inputToken, outputToken);
        const route = new Route([pair], inputToken);
        const trade = new Trade(route, new TokenAmount(inputToken, inputAmount), TradeType.EXACT_INPUT);

        const slippageTolerance = new Percent(`${slippage}`, '100');
        const toHex = (currencyAmount) => `0x${currencyAmount.toString(16)}`;
        const amountOutMin = toHex(trade.minimumAmountOut(slippageTolerance).raw);
        const path = [inputToken.address, outputToken.address];
        const deadline = Math.floor(Date.now() / 1000) + timeout;
        const value = toHex(trade.inputAmount.raw);

        return {
            amountOutMin,
            path,
            deadline,
            value
        };
    }
}