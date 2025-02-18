interface MinaProvider {
  sendTransaction: any;
  requestAccounts(): Promise<string[]>;
  requestNetwork(): Promise<ChainInfoArgs>;
  switchChain(args: SwitchChainArgs): Promise<unknown>;
  signMessage(message: string): Promise<string>;
}

interface Window {
  mina?: MinaProvider;
}
