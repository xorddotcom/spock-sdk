declare namespace Web3Analytics {
  export function init(config: {
    appKey: string;
    debug?: boolean;
    geolocation?: boolean;
    inactivityTimeout?: number;
    optOut?: boolean;
    testENV?: boolean;
    testMode?: boolean;
  }): void;

  export function hasOptedOutTracking(): boolean;

  export function optInTracking(expiration?: number): void;

  export function optOutTracking(expiration?: number): void;

  export function trackPageView(pathname?: string, search?: string): void;

  export function trackWalletConnection(walletType: string, account: string, chainId: number): void;

  export function walletProvider(provider: any): void;
}

export default Web3Analytics;
