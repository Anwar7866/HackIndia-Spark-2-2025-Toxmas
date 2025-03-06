from fastapi import FastAPI, Query
import requests
from hyperon import MeTTa, S
from pydantic import BaseModel
import uvicorn

app = FastAPI()
metta = MeTTa()

metta.run(
    """
    (FAQ "What is a stock?" "A stock is a share in the ownership of a company.")
    (FAQ "What is a cryptocurrency?" "A cryptocurrency is a digital currency using cryptography for security.")
    (FAQ "How do I invest in stocks?" "You can invest in stocks through a brokerage account.")
    (FAQ "What affects stock prices?" "Stock prices are influenced by supply, demand, earnings, and economic conditions.")
    (FAQ "What is an ETF?" "An ETF is an exchange-traded fund that tracks an index or sector.")
    (FAQ "What is a mutual fund?" "A mutual fund is a pooled investment fund managed by professionals.")
    (FAQ "What is a dividend?" "A dividend is a portion of a company's earnings distributed to shareholders.")
    (FAQ "What is market capitalization?" "Market cap is the total value of a company’s shares.")
    (FAQ "What is a bull market?" "A bull market is a period of rising stock prices.")
    (FAQ "What is a bear market?" "A bear market is a period of declining stock prices.")
    (FAQ "What is an IPO?" "An IPO is an initial public offering when a company first sells stock to the public.")
    (FAQ "What is a stock split?" "A stock split increases the number of shares while reducing the price per share.")
    (FAQ "What is dollar-cost averaging?" "DCA is an investment strategy of regularly buying fixed amounts of an asset.")
    (FAQ "What is diversification?" "Diversification is spreading investments to reduce risk.")
    (FAQ "What is a bond?" "A bond is a fixed-income investment where an investor lends money to an entity.")
    (FAQ "What is a blue-chip stock?" "A blue-chip stock belongs to a well-established, financially stable company.")
    (FAQ "What is a penny stock?" "A penny stock is a low-priced, high-risk stock.")
    (FAQ "What is a hedge fund?" "A hedge fund is an investment fund that uses various strategies to maximize returns.")
    (FAQ "What is an index fund?" "An index fund is a type of mutual fund that tracks a market index.")
    (FAQ "What is a portfolio?" "A portfolio is a collection of investments owned by an individual or institution.")
    (FAQ "What is a brokerage account?" "A brokerage account allows investors to buy and sell securities.")
    (FAQ "What is a margin account?" "A margin account allows investors to borrow money to buy securities.")
    (FAQ "What is short selling?" "Short selling is borrowing and selling stock to buy it back at a lower price.")
    (FAQ "What is an option?" "An option is a financial contract that gives the right to buy or sell an asset at a set price.")
    (FAQ "What is a futures contract?" "A futures contract is an agreement to buy or sell an asset at a future date for a set price.")
    (FAQ "What is cryptocurrency mining?" "Crypto mining is the process of verifying transactions and adding them to a blockchain.")
    (FAQ "What is a blockchain?" "A blockchain is a decentralized, digital ledger used to record transactions.")
    (FAQ "What is Bitcoin?" "Bitcoin is the first decentralized cryptocurrency.")
    (FAQ "What is Ethereum?" "Ethereum is a blockchain platform with smart contract functionality.")
    (FAQ "What is a stablecoin?" "A stablecoin is a cryptocurrency pegged to a stable asset like USD.")
    (FAQ "What is DeFi?" "DeFi, or Decentralized Finance, refers to blockchain-based financial services.")
    (FAQ "What is an NFT?" "An NFT is a non-fungible token representing ownership of a unique asset.")
    (FAQ "What is an altcoin?" "An altcoin is any cryptocurrency other than Bitcoin.")
    (FAQ "What is a crypto wallet?" "A crypto wallet stores private keys for accessing cryptocurrencies.")
    (FAQ "What is a private key?" "A private key is a secret code allowing access to cryptocurrency holdings.")
    (FAQ "What is staking?" "Staking involves locking up cryptocurrency to support a blockchain network.")
    (FAQ "What is yield farming?" "Yield farming is earning rewards by lending or staking crypto assets.")
    (FAQ "What is liquidity?" "Liquidity is how easily an asset can be converted into cash.")
    (FAQ "What is an annuity?" "An annuity is a financial product that pays out income over time.")
    (FAQ "What is inflation?" "Inflation is the rate at which the general level of prices for goods and services rises.")
    (FAQ "What is deflation?" "Deflation is a decrease in the general price level of goods and services.")
    (FAQ "What is a central bank?" "A central bank controls a country's currency and monetary policy.")
    (FAQ "What is a stock?" "A stock is a share in the ownership of a company.")
    (FAQ "What is a cryptocurrency?" "A cryptocurrency is a digital currency using cryptography for security.")
    (FAQ "How do I invest in stocks?" "You can invest in stocks through a brokerage account.")
    (FAQ "What affects stock prices?" "Stock prices are influenced by supply, demand, earnings, and economic conditions.")
    (FAQ "What is an ETF?" "An ETF is an exchange-traded fund that tracks an index or sector.")
    (FAQ "What is a mutual fund?" "A mutual fund is a pooled investment fund managed by professionals.")
    (FAQ "What is a dividend?" "A dividend is a portion of a company's earnings distributed to shareholders.")
    (FAQ "What is market capitalization?" "Market cap is the total value of a company’s shares.")
    (FAQ "What is a bull market?" "A bull market is a period of rising stock prices.")
    (FAQ "What is a stock?" "A stock is a share in the ownership of a company.")
    (FAQ "What is a cryptocurrency?" "A cryptocurrency is a digital currency using cryptography for security.")
    (FAQ "How do I invest in stocks?" "You can invest in stocks through a brokerage account.")
    (FAQ "What affects stock prices?" "Stock prices are influenced by supply, demand, earnings, and economic conditions.")
    (FAQ "What is an ETF?" "An ETF is an exchange-traded fund that tracks an index or sector.")
    (FAQ "What is a mutual fund?" "A mutual fund is a pooled investment fund managed by professionals.")
    (FAQ "What is a dividend?" "A dividend is a portion of a company's earnings distributed to shareholders.")
    (FAQ "What is market capitalization?" "Market cap is the total value of a company’s shares.")
    (FAQ "What is a bull market?" "A bull market is a period of rising stock prices.")
    (FAQ "What is a bear market?" "A bear market is a period of declining stock prices.")
    (FAQ "What is an IPO?" "An IPO is an initial public offering when a company first sells stock to the public.")
    (FAQ "What is a stock split?" "A stock split increases the number of shares while reducing the price per share.")
    (FAQ "What is dollar-cost averaging?" "DCA is an investment strategy of regularly buying fixed amounts of an asset.")
    (FAQ "What is diversification?" "Diversification is spreading investments to reduce risk.")
    (FAQ "What is a bond?" "A bond is a fixed-income investment where an investor lends money to an entity.")
    (FAQ "What is a blue-chip stock?" "A blue-chip stock belongs to a well-established, financially stable company.")
    (FAQ "What is a penny stock?" "A penny stock is a low-priced, high-risk stock.")
    (FAQ "What is a hedge fund?" "A hedge fund is an investment fund that uses various strategies to maximize returns.")
    (FAQ "What is an index fund?" "An index fund is a type of mutual fund that tracks a market index.")
    (FAQ "What is a portfolio?" "A portfolio is a collection of investments owned by an individual or institution.")
    (FAQ "What is a brokerage account?" "A brokerage account allows investors to buy and sell securities.")
    (FAQ "What is a margin account?" "A margin account allows investors to borrow money to buy securities.")
    (FAQ "What is a bear market?" "A bear market is a period of declining stock prices.")
    (FAQ "What is an IPO?" "An IPO is an initial public offering when a company first sells stock to the public.")
    (FAQ "What is a stock split?" "A stock split increases the number of shares while reducing the price per share.")
    (FAQ "What is dollar-cost averaging?" "DCA is an investment strategy of regularly buying fixed amounts of an asset.")
    (FAQ "What is diversification?" "Diversification is spreading investments to reduce risk.")
    (FAQ "What is a bond?" "A bond is a fixed-income investment where an investor lends money to an entity.")
    (FAQ "What is a blue-chip stock?" "A blue-chip stock belongs to a well-established, financially stable company.")
    (FAQ "What is a penny stock?" "A penny stock is a low-priced, high-risk stock.")
    (FAQ "What is a hedge fund?" "A hedge fund is an investment fund that uses various strategies to maximize returns.")
    (FAQ "What is an index fund?" "An index fund is a type of mutual fund that tracks a market index.")
    (FAQ "What is a portfolio?" "A portfolio is a collection of investments owned by an individual or institution.")
    (FAQ "What is a brokerage account?" "A brokerage account allows investors to buy and sell securities.")
    (FAQ "What is a margin account?" "A margin account allows investors to borrow money to buy securities.")
    (FAQ "What is quantitative easing?" "Quantitative easing is a monetary policy to increase money supply and encourage lending.")
    """
)

class StockRequest(BaseModel):
    symbol: str
    market: str = "usd"

def get_price(symbol: str, market: str):
    url = f"https://api.coingecko.com/api/v3/simple/price?ids={symbol}&vs_currencies={market}"
    response = requests.get(url).json()
    return response.get(symbol, {}).get(market, "Price not found")

@app.get("/faq")
def get_faq(question: str = Query(..., description="Enter your finance-related question")):
    result = metta.run(f"(FAQ {question} ?)" )
    return {"answer": result[0] if result else "I don't know that yet."}

@app.post("/stock")
def stock_price(request: StockRequest):
    return {"symbol": request.symbol, "market": request.market, "price": get_price(request.symbol.lower(), request.market.lower())}

@app.post("/crypto")
def crypto_price(request: StockRequest):
    return {"symbol": request.symbol, "market": request.market, "price": get_price(request.symbol.lower(), request.market.lower())}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8080)
