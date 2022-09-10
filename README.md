# DAppzero

DAppzero Web SDK is a Javascript module to collect and log all the data and events of DApp for analytics.

## Table of Contents

- [dappzero](#dappzero)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [Initialization](#dzanalyticsinitoptions)
    - [Wallet Provider](#dzanalyticswalletproviderprovider)
    - [Wallet Connection](#dzanalyticstrackwalletconnectionwallettypeaccountchainid)
    - [Page View](#dzanalyticstrackpageviewpath)
    - [Value Contribution](#dzanalyticsvaluecontributionlabelvalueinusd)
  - [Supporting Wallets](#supporting-wallets)

## Installation

Install dappero by using npm

```bash
npm install dappzero --save
```

or yarn

```bash
yarn add dappzero
```

## Usage

Initialize and track wallet connection and transactions by passing web3 provider.

```js
import DZ_Analytics from 'dappzero';
DZ_Analytics.init({ appKey: 'eba6...28c' });
DZ_Analytics.walletProvider(window.ethereum);
```

## API

### DZ_Analytics.init(options)

DZ_Analytics must be initialized with `appKey` by invoking init method at the top level of application before using other methods.

```js
DZ_Analytics.init({ appKey: 'eba6...28c', debug: true });
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value                   | Type    | Description                                                 |
| ------------------------| --------| ------------------------------------------------------------|
|  appKey                 |`String` | Unique appKey obtained from [DAppzero](http://dappzero.io) for tracking, like `eba6...28c`.|
| **Optional**            | | |
|  debug                  |`Boolean`| Deafults to `false`. Enable consoles for all the tracking events.|
|  testMode               |`Boolean`| Deafults to `false`. Enable testMode in which you can test tracking events without logging data onto server. Inordre to avoid store testing data.|
|  inactivityTimeout      |`number` | Deafults to `30`. This field takes time in mins to specify the inactivity duration in which the session will expires.|

### DZ_Analytics.walletProvider(provider)

Pass `web3 provider` to track wallet connectinons for all [Supporting Wallets](#supporting-wallets) and transactions state that are submitted or rejected from DApp.

```js
DZ_Analytics.walletProvider(window.ethereum);
```

In-case of handling multiple wallets on DApp. Example in `React`.

```js
import { useWeb3React } from '@web3-react/core';

const { provider } = useWeb3React();

// in-order to pass updated provider if user changes wallet, account or chain.
useEffect(() => {
  if (provider?.provider) {
    DZ_Analytics.walletProvider(provider.provider);
  }
}, [provider]);
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value         | Type          | Description                                                    |
| --------------| --------------| ---------------------------------------------------------------|
| provider      |`Web3Provider` | EIP-1193 Standard Provider or Web3Provider-compatible Provider.|

### DZ_Analytics.trackWalletConnection(walletType,account,chainId)

To track other wallets that currently not include in [Supporting Wallets](#supporting-wallets).

```js
DZ_Analytics.trackWalletConnection('Ledger', '0x...96', 1);
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value           | Type    | Description                                        |
| ----------------| --------| ---------------------------------------------------|
| walletType      |`String` | Name of wallet |
| account         |`String` | User ethereum address |
| chainId         |`number` | User connected chainId |

### DZ_Analytics.trackPageView(path)

Track all the pages visited on a DApp.

```js
DZ_Analytics.trackPageView('/home');
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value           | Type    | Description                                        |
| ----------------| --------| ---------------------------------------------------|
| path            |`String` | Path of the page. e.g. '/about', '/dashboard/stats'|

### DZ_Analytics.valueContribution(label,valueInUSD)

Track amount in USD that end-user will contribute on protocol ecosystem through DApp. You can inovke this method in the callback of transaction submission.

```js
DZ_Analytics.valueContribution('Add Liquidity', 25_000);
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value           | Type    | Description                                        |
| ----------------| --------| ---------------------------------------------------|
| label           |`String` | Label to represent contribution. e.g. 'Add Liquidity', 'Stake'|
| valueInUSD      |`number` | Amount in USD that user has contributed.           |

## Supporting Wallets

- MetaMask
- WalletConnect
- Coinbase Wallet
- Portis
- Fortmatic

To track wallet not includling in the list you can use [trackWalletConnection](#dzanalyticstrackwalletconnectionwallettypeaccountchainid) method.
