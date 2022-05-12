import requests
import json

headers = {"Content-Type": "application/json"}

body = {
    'inputAmount': str(10**18), # 1ETH
    'outputToken': '0x6B175474E89094C44Da98b954EedeAC495271d0F', # DAI
    'slippage': '5000' # 10000 = 100%
    # 'timeout': 20 * 60 # 20 min. is deafault value
}

r = requests.post('http://127.0.0.1:5017/swapExactETHForTokens', headers=headers, data = json.dumps(body))