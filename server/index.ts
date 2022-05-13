import { ethers, Wallet } from 'ethers';
import express from 'express'
import bodyParser from 'body-parser';
import Uniswap from '../scripts/Uniswap';
import CONFIG from '../config.json';
import appLog from '../scripts/appLog';

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

const uniswap = new Uniswap(provider, CONFIG.max_fee_per_gas, wallets);

app.post('/swapExactETHForTokens', async (request, response) => {
  try {
    const startTime = Date.now();
    const body: {
      walletAddress: string;
      inputAmount: string;
      outputToken: string;
      slippage: string;
      timeout?: number;
    } = request.body;
  
    appLog(`START POST /swapExactETHForTokens. DATA: ${JSON.stringify(body, null, 4)}`);
    
    await uniswap.swapExactETHForTokens(
      body.walletAddress,
      body.inputAmount,
      body.outputToken,
      body.slippage,
      body.timeout
    );
  
    appLog(`END POST /swapExactETHForTokens.`);
    appLog(`All time ${Date.now() - startTime} ms`);
  } catch(e) {
    appLog(`EXCEPTION ${e}`);
  }
  response.end();
});

app.listen(port, () => console.log(`Running on port ${port}`));

