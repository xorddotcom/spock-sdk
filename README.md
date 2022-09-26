# Spock Analytics SDK

Spock analytics SDK `analytics-web3` is a Javascript module to collect and log all the data and events of DApp for analytics.

## Spock

Spock aims to accelerate your growth by tracking & analyzing crucial and opportunity-centric metrics that will help you to amplify your growth and reach to the right customer segment.

## Table of Contents

- [Spock Analytics SDK](#spock-analytics-sdk)
  - [About Spock](#spock)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [Initialization](#web3analyticsinitoptions)
    - [Wallet Provider](#web3analyticswalletproviderprovider)
    - [Wallet Connection](#web3analyticstrackwalletconnectionwallettypeaccountchainid)
    - [Page View](#web3analyticstrackpageviewpath)
    - [Value Contribution](#web3analyticsvaluecontributionlabelvalueinusd)
    - [Value Extraction](#web3analyticsvalueextractionlabelvalueinusd)
  - [Supporting Wallets](#supporting-wallets)
  - [License](#license)
  - [Demo](#demo)
  - [Onboarding](#onboarding)
  - [Credits](#credits)

## Installation

Install analytics-web3 sdk by using npm

```bash
npm install analytics-web3 --save
```

or yarn

```bash
yarn add analytics-web3
```

## Usage

Initialize and track wallet connection and transactions by passing web3 provider.

```js
import Web3Analytics from 'analytics-web3';
Web3Analytics.init({ appKey: 'eba6...28c' });
Web3Analytics.walletProvider(window.ethereum);
```

## API

### Web3Analytics.init(options)

Web3Analytics must be initialized with `appKey` by invoking init method at the top level of application before using other methods.

```js
Web3Analytics.init({ appKey: 'eba6...28c', debug: true });
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value                   | Type    | Description                                                 |
| ------------------------| --------| ------------------------------------------------------------|
|  appKey                 |`String` | Unique appKey like `eba6...28c` for tracking. Can be obtained by getting [onboarded](#onboarding) in Spock.|
| **Optional**            | | |
|  debug                  |`Boolean`| Defaults to `false`. Enable consoles for all the tracking events.|
|  testENV                |`Boolean`| Defaults to `false`. Enable testing version of SDK in which SDK will interact with testing servers.|
|  testMode               |`Boolean`| Defaults to `false`. Enable testMode in which you can test tracking events without logging data onto server. Inordre to avoid store testing data.|
|  inactivityTimeout      |`number` | Defaults to `30`. This field takes time in mins to specify the inactivity duration in which the session will expires.|

### Web3Analytics.walletProvider(provider)

Pass `web3 provider` to track wallet connections for all [Supporting Wallets](#supporting-wallets) and transactions state that are submitted or rejected from DApp.

```js
Web3Analytics.walletProvider(window.ethereum);
```

In-case of handling multiple wallets on DApp. Example in `React`.

```js
import { useWeb3React } from '@web3-react/core';

const { provider } = useWeb3React();

// in-order to pass updated provider if user changes wallet, account or chain.
useEffect(() => {
  if (provider?.provider) {
    Web3Analytics.walletProvider(provider.provider);
  }
}, [provider]);
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value         | Type          | Description                                                    |
| --------------| --------------| ---------------------------------------------------------------|
| provider      |`Web3Provider` | EIP-1193 Standard Provider or Web3Provider-compatible Provider.|

### Web3Analytics.trackWalletConnection(walletType,account,chainId)

To track other wallets that currently not include in [Supporting Wallets](#supporting-wallets).

```js
Web3Analytics.trackWalletConnection('Ledger', '0x...96', 1);
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value           | Type    | Description                                        |
| ----------------| --------| ---------------------------------------------------|
| walletType      |`String` | Name of wallet |
| account         |`String` | User ethereum address |
| chainId         |`number` | User connected chainId |

### Web3Analytics.trackPageView(path)

Track all the pages visited on a DApp.

```js
Web3Analytics.trackPageView('/home');
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value           | Type    | Description                                        |
| ----------------| --------| ---------------------------------------------------|
| path            |`String` | Path of the page. e.g. '/about', '/dashboard/stats'|

### Web3Analytics.valueContribution(label,valueInUSD)

Track amount in USD that end-user has contribute in protocol ecosystem through DApp. You can invoke this method in the callback of transaction submission.

```js
Web3Analytics.valueContribution('Add Liquidity', 25_000);
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value           | Type    | Description                                        |
| ----------------| --------| ---------------------------------------------------|
| label           |`String` | Label to represent contribution. e.g. 'Add Liquidity', 'Stake'|
| valueInUSD      |`number` | Amount in USD that user has contributed.           |

### Web3Analytics.valueExtraction(label,valueInUSD)

Track amount in USD that end-user has removed from protocol ecosystem through DApp. You can invoke this method in the callback of transaction submission.

```js
Web3Analytics.valueExtraction('Remove Liquidity', 25_000);
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value           | Type    | Description                                        |
| ----------------| --------| ---------------------------------------------------|
| label           |`String` | Label to represent extraction. e.g. 'Remove Liquidity', 'Unstake'|
| valueInUSD      |`number` | Amount in USD that user has removed.           |

## Supporting Wallets

- MetaMask
- WalletConnect
- Coinbase Wallet
- Portis
- Fortmatic

To track wallet not including in the list you can use [trackWalletConnection](#web3analyticstrackwalletconnectionwallettypeaccountchainid) method.

## License

[UNLICENSED](https://github.com/xorddotcom/spock-sdk/blob/main/LICENSE)

## Demo

Example code for `analytics-web3` integration [Spock Analytics Demo](https://github.com/xorddotcom/spock-analytics-demo)

## Onboarding

Follow this [README.md](https://github.com/xorddotcom/spock-analytics-demo/blob/main/README.md) to get onboarded in Spock.

## Credits

Backed by [xord.com](https://xord.com)
