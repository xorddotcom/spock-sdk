import { InjectedConnector } from '@web3-react/injected-connector';

let networkLibrary;
export function getNetworkLibrary() {
  return (networkLibrary = networkLibrary);
}

export function setNetworkLibrary(provider) {
  networkLibrary = provider;
}

export const injected = new InjectedConnector({
  supportedChainIds: [1, 4],
});
