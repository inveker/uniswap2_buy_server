import requests
import json

r = requests.post('http://127.0.0.1:5017/swapExactETHForTokens', headers={"Content-Type": "application/json"}, data = json.dumps( {
    'walletPrivateKey': "0x27f64677f87074404da76c1dd2530c3491322d13a19b8195f1a6b2af3b0e633f",
    'inputAmount': str(10**18), # 1ETH
    'outputToken': '0x6B175474E89094C44Da98b954EedeAC495271d0F', # DAI
    'slippage': '50', # 50%
    'maxFeePerGas': 0, # 0(gwei) - not aktive.
    'timeout': 20 * 60 # 20 min. is deafault value,
}))