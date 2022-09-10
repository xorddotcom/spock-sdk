declare namespace Web3Analytics {
  export function init(config: {
    appKey: string;
    debug?: boolean;
    testMode?: boolean;
    inactivityTimeout?: number;
  }): void;

  export function trackPageView(path: string): void;

  export function trackWalletConnection(walletType: string, account: string, chainId: number): void;

  export function valueContribution(label: string, valueInUSD: number): void;

  export function walletProvider(provider: any): void;
}

export default Web3Analytics;
