import { useWeb3React } from '@web3-react/core';

import { injected } from '../connectors';

const WalletConnect = () => {
  const { activate } = useWeb3React();
  return <button onClick={() => activate(injected, undefined, true)}>Metamask</button>;
};

export default WalletConnect;
