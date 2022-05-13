import { BigintIsh, ChainId, Fetcher, Pair, Route, Token, TokenAmount, Trade, TradeType, WETH } from '@uniswap/sdk'
import { ethers, Wallet } from 'ethers'
import { Percent } from '@uniswap/sdk'
import UniswapV2Router02Abi from '../abi/UniswapV2Router02.json';

interface ISwapData {
    amountOutMin: string;
    path: string[];
    deadline: number;
    value: string;
}

export default class Uniswap {
    readonly DEFAULT_TIMEOUT = 60 * 20;
    readonly UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    readonly WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

    wallets: { [key: string]: Wallet } = {};
    maxFeePerGas: number;

    constructor(
        readonly provider: ethers.providers.JsonRpcProvider,
        maxFeePerGas: number,
        wallets: Wallet[]
    ) {
        for (const wallet of wallets) {
            this.wallets[wallet.address] = wallet;
        }
        this.maxFeePerGas = maxFeePerGas * Math.pow(10, 9);
    }

    public async swapExactETHForTokens(walletAddress: string, inputAmount: BigintIsh, outputToken: string, slippage: BigintIsh, timeout?: number) {
        const wallet = this.wallets[walletAddress];
        const uniswapRouter = this._uniswapRouter(wallet);
        const swapData = await this._getSwapData(inputAmount, this._wethToken(), await Fetcher.fetchTokenData(1, outputToken), slippage, timeout);
        let feeData = await this.provider.getFeeData();
        console.log(JSON.stringify({
            maxFeePerGas: `${feeData.maxFeePerGas}`,
            maxPriorityFeePerGas: `${feeData.maxPriorityFeePerGas}`,
            gasPrice: `${feeData.gasPrice}`,
        }, null, 4));

        if(this.maxFeePerGas === 0 || feeData.maxFeePerGas.lte(this.maxFeePerGas)) {
            await uniswapRouter.swapExactETHForTokensSupportingFeeOnTransferTokens(
                swapData.amountOutMin,
                swapData.path,
                walletAddress,
                swapData.deadline,
                {
                    value: swapData.value,
                    maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"],
                    maxFeePerGas: this.maxFeePerGas !== 0 ? this.maxFeePerGas : feeData["maxFeePerGas"],
                }
            );
        }
    }

    protected _uniswapRouter(wallet: Wallet): ethers.Contract {
        return new ethers.Contract(this.UNISWAP_ROUTER, UniswapV2Router02Abi, wallet);
    }

    protected _wethToken(): Token {
        return new Token(1, this.WETH, 18);
    }

    protected async _getSwapData(inputAmount: BigintIsh, inputToken: Token, outputToken: Token, slippage: BigintIsh, timeout?: number): Promise<ISwapData> {
        const pair = await Fetcher.fetchPairData(inputToken, outputToken);
        const route = new Route([pair], inputToken);
        const trade = new Trade(route, new TokenAmount(inputToken, inputAmount), TradeType.EXACT_INPUT);

        const slippageTolerance = new Percent(slippage, '10000');
        const toHex = (currencyAmount) => `0x${currencyAmount.toString(16)}`;
        const amountOutMin = toHex(trade.minimumAmountOut(slippageTolerance).raw);
        const path = [inputToken.address, outputToken.address];
        const deadline = Math.floor(Date.now() / 1000) + (timeout ?? this.DEFAULT_TIMEOUT);
        const value = toHex(trade.inputAmount.raw);

        return {
            amountOutMin,
            path,
            deadline,
            value
        };
    }
}