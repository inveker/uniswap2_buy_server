import { ethers, Wallet } from 'ethers';
import express from 'express'
import bodyParser from 'body-parser';
import Uniswap from '../scripts/Uniswap';
import CONFIG from '../config.json';



const port = CONFIG.port;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const provider = new ethers.providers.JsonRpcProvider(CONFIG.prod_rpc);

const wallets: Wallet[] = [];
for (const privateKey of CONFIG.prod_wallets_private_key) {
  wallets.push(new Wallet(privateKey));
}

const uniswap = new Uniswap(provider, wallets);

app.post('/swapExactETHForTokens', async (request, response) => {
  console.log('start swapExactETHForTokens');
  const body: {
    walletAddress: string;
    inputAmount: string;
    outputToken: string;
    slippage: string;
    timeout?: number;
  } = request.body;
  console.log(JSON.stringify(request.body, null, 4))
  await uniswap.swapExactETHForTokens(
    body.walletAddress,
    body.inputAmount,
    body.outputToken,
    body.slippage,
    body.timeout
  );
  console.log('end swapExactETHForTokens');
});

app.listen(port, () => console.log(`Running on port ${port}`));

