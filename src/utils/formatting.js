export function normalizeChainId(chainId) {
  if (typeof chainId === 'string') {
    chainId = chainId.replace(/^Ox/, '0x');
    const parsedChainId = Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10);
    return parsedChainId;
  } else {
    return chainId;
  }
}
