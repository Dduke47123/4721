import { connectWallet, disconnectWallet, detectWallet } from './wallet.js';
import { getBalance, displayTokens, getAllTokens, getTokenDetails, getSolPriceInUsd } from './walletBalance.js';
import { setupNicknameEdit, displayConnectedWallet, displayWalletBalance } from './nickname.js';

document.addEventListener('DOMContentLoaded', function () {
  const connectWalletButton = document.getElementById('connect-wallet-button');
  const walletButtons = document.getElementById('wallet-buttons');
  const phantomButton = document.getElementById('phantom-button');
  const backpackButton = document.getElementById('backpack-button');
  const solflareButton = document.getElementById('solflare-button');
  const magicedenButton = document.getElementById('magiceden-button');
  const coinbaseButton = document.getElementById('coinbase-button');
  const fetchTokensButton = document.getElementById('fetch-tokens-button'); // New button to fetch tokens
  let connectedWallet;

  // WebSocket connection setup
  const socket = io();

  // Show wallet options when Connect Wallet button is clicked
  connectWalletButton.addEventListener('click', async () => {
    if (connectWalletButton.textContent === 'Connect Wallet') {
      walletButtons.style.display = 'block';
    } else {
      await disconnectWallet(connectedWallet, socket);
      connectWalletButton.textContent = 'Connect Wallet';
      walletButtons.style.display = 'none';
      const walletAddressElement = document.getElementById('wallet-address');
      const walletBalanceElement = document.getElementById('wallet-balance');
      const allTokensDisplayElement = document.getElementById('all-tokens-display');
      if (walletAddressElement) walletAddressElement.textContent = '';
      if (walletBalanceElement) walletBalanceElement.textContent = '';
      if (allTokensDisplayElement) allTokensDisplayElement.textContent = '';
      fetchTokensButton.style.display = 'none'; // Hide the fetch tokens button
    }
  });

  // Event Listeners for Wallet Buttons
  const walletButtonHandler = async (walletName) => {
    connectedWallet = await connectWallet(detectWallet(walletName), socket);
    if (connectedWallet) {
      connectWalletButton.textContent = 'Disconnect Wallet';
      walletButtons.style.display = 'none';
      const nickname = 'wAZE';  // Assuming nickname is hardcoded as 'wAZE' for now
      const walletAddress = connectedWallet.publicKey.toString();
      displayConnectedWallet({ wallet: walletAddress.slice(0, 7), nickname });
      socket.emit('wallet_connected_ack', { wallet: walletAddress, nickname });

      // Automatically display balance without tokens
      const balance = await getBalance(walletAddress);
      displayWalletBalance(balance);

      // Show the fetch tokens button
      fetchTokensButton.style.display = 'block';

      // Add event listener to the fetch tokens button
      fetchTokensButton.addEventListener('click', async () => {
        const tokens = await getAllTokens(walletAddress);
        const tokenDetails = await getTokenDetails(tokens);
        displayTokens(walletAddress, tokenDetails);
      });
    }
  };

  phantomButton.addEventListener('click', () => walletButtonHandler('phantom'));
  backpackButton.addEventListener('click', () => walletButtonHandler('backpack'));
  solflareButton.addEventListener('click', () => walletButtonHandler('solflare'));
  magicedenButton.addEventListener('click', () => walletButtonHandler('magiceden'));
  coinbaseButton.addEventListener('click', () => walletButtonHandler('coinbase'));

  // WebSocket event listener for wallet_connected_ack
  socket.on('wallet_connected_ack', (data) => {
    displayConnectedWallet(data);
  });

  // WebSocket event listener for wallet_error
  socket.on('wallet_error', (data) => {
    alert(data.message);
    console.error('Wallet error:', data.message);
  });

  setupNicknameEdit(socket);
});
