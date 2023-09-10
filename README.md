# Spock Analytics SDK

Spock analytics SDK `analytics-web3` is a Javascript module to collect and log all the data and events of DApp for analytics.

## Spock

Spock aims to accelerate your growth by tracking & analyzing crucial and opportunity-centric metrics that will help you to amplify your growth and reach to the right customer segment.

## Table of contents

- [Spock Analytics SDK](#spock-analytics-sdk)
  - [About Spock](#spock)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [Initialization](#web3analyticsinitoptions)
    - [Wallet provider](#web3analyticswalletproviderprovider)
    - [Wallet connection](#web3analyticstrackwalletconnectionwallettypeaccountchainid)
    - [Page view](#web3analyticstrackpageviewpathnamesearch)
    - [Opt out](#web3analyticsoptouttrackingexpiration)
    - [Opt in](#web3analyticsoptintrackingexpiration)
    - [Opt out status](#web3analyticshasoptedouttracking)
  - [Supporting wallets](#supporting-wallets)
  - [Datapoints](#datapoints)
  - [License](#license)
  - [Demo](#demo)
  - [Documentation](#documentation)
  - [Credits](#credits)

## Installation

Install analytics-web3 sdk by using npm

```bash
npm install --save analytics-web3
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
|  dataPoints             |`string[]`| By default SDK will track all data points. But you can limit them by passing the desired [datapoints](#datapoints). |
|  inactivityTimeout      |`number` | Defaults to `30`. This field takes time in mins to specify the inactivity duration in which the session will expires.|
|  optOut      |`Boolean` | Defaults to `false`. Opt users out of tracking. |
|  testENV                |`Boolean`| Defaults to `false`. Enable testing version of SDK in which SDK will interact with testing servers.|
|  testMode               |`Boolean`| Defaults to `false`. Enable testMode in which you can test tracking events without logging data onto server. Inordre to avoid store testing data.|

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

### Web3Analytics.trackPageView(pathname,search)

Track all the pages visited on a DApp.

```js
Web3Analytics.trackPageView('/home');
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value           | Type    | Description                                        |
| ----------------| --------| ---------------------------------------------------|
| pathname            |`String` | Path of the page. e.g. '/about', '/dashboard/stats'|
| search            |`String` | Query string of the pgae. eg: '?id=ab02'|

### Web3Analytics.optOutTracking(expiration)

Opt user out from tracking.

```js
Web3Analytics.optOutTracking();
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value           | Type    | Description                                        |
| ----------------| --------| ---------------------------------------------------|
| expiration            |`number` | Default `365`. Duration in days for which user is opt-out.|

### Web3Analytics.optInTracking(expiration)

Opt user in tracking.

```js
Web3Analytics.optInTracking();
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value           | Type    | Description                                        |
| ----------------| --------| ---------------------------------------------------|
| expiration            |`number` | Default `365`. Duration in days for which user is opt-in.|

### Web3Analytics.hasOptedOutTracking()

Getter method for the status of user tracking consent.

```js
Web3Analytics.hasOptedOutTracking();
```

<!-- Disable table formatting because Prettier messing it up. -->
<!-- prettier-ignore -->
| Value           | Return Type    | Description                                        |
| ----------------| --------| ---------------------------------------------------|
| -            |`Boolean` | Status of user tracking consent.|

## Supporting wallets

- MetaMask
- WalletConnect
- Coinbase Wallet
- Portis
- Fortmatic

To track wallet not including in the list you can use [trackWalletConnection](#web3analyticstrackwalletconnectionwallettypeaccountchainid) method.

## Datapoints

- **_web3_**: Track user wallet address, connections, transactions etc.
- **_browser_profile_** - Track browser properties like browser, device, os etc.
- **_demographics_**- Track geolocation data like city, country, region.
- **_navigation_** - Track page-views and outbound-links.
- **_utm_params_** - Track all utm parameters like source, campaign, method etc
- **_engage_**: Campaign Pop-ups, campaign tracking.

## License

[UNLICENSED](https://github.com/xorddotcom/spock-sdk/blob/main/LICENSE)

## Demo

Example code for `analytics-web3` integration [Spock Analytics Demo](https://github.com/xorddotcom/spock-analytics-demo)

## Documentation

You can use these [docs](https://spock-analytics.gitbook.io) for knowing more about Spock Analytics.

## Credits

Backed by [xord.com](https://xord.com)
