# Kimaex

Kimaex is a Naira-first decentralized trading platform built to make on-chain trading simpler and more accessible for users in Nigeria and emerging markets. Users can trade meme tokens, access perpetual trading, pay bills, and spend with a Kimaex card all while using Naira throughout the experience.

## Links

| | |
|---|---|
| Live app | https://token-port-dex.lovable.app |
| Source code | https://github.com/kimaex/token-port-dex |
| Lovable project | https://lovable.dev/projects/aa5dc4de-b2f1-43ed-ac80-60de2dda2b2e |
| Demo video | https://x.com/Jibkid_khakima1/status/2118766278978555959|

## The problem

In Nigeria, getting into crypto usually means P2P dollar rates, unclear fees and several apps for trading, sending and cashing out. Naira volatility makes every step harder to price. Kimaex keeps the whole experience in ₦.

**Wallet home**
- One total balance in ₦ with a 24h change.
- Quick actions: Add, Send, Receive, Bills.
- Asset list priced in ₦ (BTC, ETH, SOL, ADA and more).
- Bottom navigation: Wallet, Swap, History, Futures, Settings.

**Swap**
- Pay in Naira, receive an asset (e.g. NEAR) at a live ₦ rate.
- Quote screen with price, 2% trading fee and max slippage (1%) shown before you confirm.
- Quick-amount buttons (25% / 50% / 75% / 100%).
- Meme tokens (PEPE, BONK, DOGE) listed and priced in ₦ with market cap and 24h change.

**Send and receive crypto**
- Send BTC, ETH, SOL, NEAR, USDC and USDT.
- Network picker per asset, with the network fee shown up front (e.g. USDT on NEAR Protocol: 0.1 USDT).
- Minimum of ₦500 and a 2% service fee shown on the screen.
- Receive flow with a network selector. Fees are shown in ₦ for Ethereum (ERC20), BNB Smart Chain, Solana, Polygon, Arbitrum, Avalanche, Tron and Base.
- Confirmation toast after sending (e.g. "Sending 2000 USDT to 09ab29902b...").

**Naira withdrawal**
- Enter bank account number, account name and amount in ₦.
- Quick amounts (₦1,000 to ₦50,000), "use all" balance, and "save as beneficiary".

**Perpetual futures**
- NEAR/NGN and other markets (BTC, ETH, SOL and more) with Naira margin.
- Simple mode and Pro mode.
- Cross and isolated margin, long and short, market and limit orders.
- Leverage slider (1x to 125x), order book, funding rate, estimated liquidation price.
- Open positions with entry, margin, position size, fees, TP/SL and close.
- Realized PnL shown after closing a position.

## How it uses NEAR

- **NEAR as a supported network:** USDT can be sent over the NEAR Protocol network from the Send flow.
- **NEAR as a core asset:** NEAR can be bought with Naira in Swap and traded as a NEAR/NGN perpetual market.

## Status: what's live vs. simulated

| Feature | Status |
|---|---|
| Mobile-first UI for all flows above | Working prototype (try the testnet app) |
| Naira-priced swaps | [testnet] |
| Send / receive crypto | [testnet] |
| Naira bank withdrawal | [testnet] |
| Futures trading engine | [testnet] |
| Bills payments | Entry point in UI; [ Planned] |
| Kimaex card | [Planned] |

## Run locally

Requires Node.js and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone https://github.com/kimaex/token-port-dex.git
cd token-port-dex
npm i
npm run dev
```

## Built with Lovable

This project was built with [Lovable](https://lovable.dev). Changes made in the Lovable editor are committed to this repository, and pushes to `main` sync back into Lovable.

## Risk and compliance

Leveraged trading carries serious risk of loss. [ADD: leverage limits, risk warnings and compliance plans you have actually built or decided on, including how you will approach Nigerian SEC digital-asset rules.]

## Roadmap

1. Move swaps and transfers fully on-chain on NEAR
2. Bills payments and Kimaex card
3. Agent or intent-based features on NEAR
4. Expansion to other emerging markets

## Team

jibrin Ibrahim 
