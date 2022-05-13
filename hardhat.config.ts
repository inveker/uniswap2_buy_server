import { HardhatUserConfig } from 'hardhat/types/config';
import "@nomiclabs/hardhat-ethers";
import '@nomiclabs/hardhat-waffle';
import "@nomiclabs/hardhat-web3";
import "hardhat-abi-exporter";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import CONFIG from './config.json';

let config: HardhatUserConfig = {
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            chainId: 1337,
            forking: {
                url: CONFIG.dev_rpc,
                // blockNumber: 14679632,
            },
            loggingEnabled: true,
            blockGasLimit: 0x1fffffffffffff,
            accounts: [{
                privateKey: '0x27f64677f87074404da76c1dd2530c3491322d13a19b8195f1a6b2af3b0e633f',
                balance: '100000000000000000000000000000000000000000',
            }],
            gas: 120e9,
        },
    },
    abiExporter: {
        path: './abi',
    },
    mocha: {
        reporter: 'eth-gas-reporter',
        timeout: 300000,
    },
};
export default config;