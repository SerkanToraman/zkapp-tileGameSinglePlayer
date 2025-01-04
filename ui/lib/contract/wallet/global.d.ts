interface MinaProvider {
  requestAccounts(): Promise<string[]>;
  requestNetwork(): Promise<ChainInfoArgs>;
  switchChain(args: SwitchChainArgs): Promise<unknown>;
}

interface Window {
  mina?: MinaProvider;
}
