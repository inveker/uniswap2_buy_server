import { ethers } from 'ethers';
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

const uniswap = new Uniswap(provider);

app.post('/swapExactETHForTokens', async (request, response) => {
  try {
    const startTime = Date.now();
    const body: {
      walletPrivateKey: string;
      inputAmount: string;
      outputToken: string;
      slippage: number;
      maxFeePerGas: number;
      timeout: number;
    } = request.body;
  
    appLog(`START POST /swapExactETHForTokens. DATA: ${JSON.stringify(body, null, 4)}`);
    
    await uniswap.swapExactETHForTokens(
      body.walletPrivateKey,
      body.inputAmount,
      body.outputToken,
      body.slippage,
      body.maxFeePerGas,
      body.timeout,
    );
  
    appLog(`END POST /swapExactETHForTokens.`);
    appLog(`All time ${Date.now() - startTime} ms`);
  } catch(e) {
    appLog(`EXCEPTION ${e}`);
  }
  response.end();
});

app.listen(port, () => console.log(`Running on port ${port}`));

