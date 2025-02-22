const HELIUS_RPC_URL = `https://api.mainnet-beta.solana.com`;
const SOLANA_RPC_URL = `https://api.mainnet-beta.solana.com`;

export async function connectWallet(walletProvider, socket) {
  try {
    if (!walletProvider) {
      alert('Wallet not installed. Please install it.');
      return;
    }

    await walletProvider.connect();
    const connectedWallet = walletProvider;

    if (!walletProvider.publicKey) {
      throw new Error('Failed to retrieve publicKey from wallet');
    }

    const walletAddressString = walletProvider.publicKey.toString();

    // Notify the server about the wallet connection
    socket.emit('wallet_connected', {
      wallet: walletAddressString
    });
    // Emit an event to save user data
    socket.emit('save_user_data', {
      wallet: walletAddressString
    });
    console.log('Wallet connected:', walletAddressString);
    return connectedWallet;
  } catch (err) {
    console.error('Failed to connect wallet:', err);
    alert(`Failed to connect wallet: ${err.message}`);
    document.getElementById('wallet-address').textContent = 'Failed to connect wallet. Please try again.';
  }
}

export async function disconnectWallet(connectedWallet, socket) {
  if (connectedWallet) {
    try {
      await connectedWallet.disconnect();
      const walletAddressElement = document.getElementById('wallet-address');
      const walletBalanceElement = document.getElementById('wallet-balance');
      const allTokensDisplayElement = document.getElementById('all-tokens-display');
      const connectWalletButtonElement = document.getElementById('connect-wallet-button');
      const walletButtonsElement = document.getElementById('wallet-buttons');
      const editNameButtonElement = document.getElementById('edit-nickname-button');

      if (walletAddressElement) walletAddressElement.textContent = 'Wallet disconnected';
      if (walletBalanceElement) walletBalanceElement.textContent = '';
      if (allTokensDisplayElement) allTokensDisplayElement.textContent = '';
      if (connectWalletButtonElement) connectWalletButtonElement.textContent = 'Connect Wallet';
      if (walletButtonsElement) walletButtonsElement.style.display = 'none';
      if (editNameButtonElement) editNameButtonElement.style.display = 'none';

      console.log('Wallet disconnected');

      // Notify the server about the wallet disconnection
      socket.emit('wallet_disconnected');
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      alert(`Failed to disconnect wallet: ${err.message}`);
      const walletAddressElement = document.getElementById('wallet-address');
      if (walletAddressElement) walletAddressElement.textContent = 'Failed to disconnect wallet. Please try again.';
    }
  }
}

export function detectWallet(walletName) {
  switch (walletName) {
    case 'phantom':
      return window.solana?.isPhantom ? window.solana : null;
    case 'backpack':
      return window.backpack?.isBackpack ? window.backpack : null;
    case 'solflare':
      return window.solflare?.isSolflare ? window.solflare : null;
    case 'magiceden':
      return window.magicEden?.solana ? window.magicEden.solana : null;
    case 'coinbase':
      return window.coinbaseSolana ? window.coinbaseSolana : null;
    default:
      return null;
  }
}