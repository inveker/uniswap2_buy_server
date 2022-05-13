import requests
import json

r = requests.post('http://127.0.0.1:5017/swapExactETHForTokens', headers={"Content-Type": "application/json"}, data = json.dumps( {
    'walletAddress': "0x283974839c9610a0f8de3c49B3a7eB8b3e578Eff",
    'inputAmount': str(10**18), # 1ETH
    'outputToken': '0x6B175474E89094C44Da98b954EedeAC495271d0F', # DAI
    'slippage': '5000' # 10000 = 100%
    # 'timeout': 20 * 60 # 20 min. is deafault value
}))