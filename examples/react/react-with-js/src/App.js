import Web3Analytics from 'projectsdk';
import { Web3ReactProvider } from '@web3-react/core';

import WalletConnect from './components/WalletConnect';
import { getLibrary } from './utils';

Web3Analytics.init({ debug: true });

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div>
        <h1>Test Web3Analytics</h1>
        <WalletConnect />
      </div>
    </Web3ReactProvider>
  );
}

export default App;
