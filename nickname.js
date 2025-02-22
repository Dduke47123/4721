export function setupNicknameEdit(socket) {
  const editNicknameButton = document.getElementById('edit-nickname-button');
  const nicknameForm = document.getElementById('nickname-form');
  const nicknameInput = document.getElementById('nickname-input');
  const nicknameSubmitButton = document.getElementById('nickname-submit-button');

  // Edit Nickname Button (Toggle Form Visibility)
  editNicknameButton.addEventListener('click', () => {
    if (nicknameForm.style.display === 'none' || nicknameForm.style.display === '') {
      nicknameForm.style.display = 'block'; // Show the form
    } else {
      nicknameForm.style.display = 'none'; // Hide the form
    }
  });

  // Submit New Nickname
  nicknameSubmitButton.addEventListener('click', () => {
    const newNickname = nicknameInput.value;
    const walletAddressElement = document.getElementById('wallet-address');
    const walletAddress = walletAddressElement.textContent.split(' ')[2]; // Assumes wallet address is at this position
    socket.emit('change_nickname', {
      wallet: walletAddress,
      newNickname
    });

    // Hide the form and reload the page to reflect the new nickname
    nicknameForm.style.display = 'none';
    window.location.reload();
  });

  // WebSocket event listener for nickname_changed
  socket.on('nickname_changed', (data) => {
    window.nickname = data.nickname;
    alert(`Nickname changed to: ${data.nickname}`);
  });
}

export function displayConnectedWallet(data) {
  const truncatedWallet = `${data.wallet.slice(0, 7)}`; // Truncate wallet address
  const walletAddressDisplay = document.getElementById('wallet-address');

  // Clear previous content
  walletAddressDisplay.innerHTML = '';

  // Create a container for the connected wallet information
  const walletContainer = document.createElement('div');
  walletContainer.classList.add('wallet-container'); // Add class for styling

  // Wallet address and nickname text
  const walletText = document.createElement('div');
  walletText.textContent = `${truncatedWallet} (Nickname: ${data.nickname})`;
  walletText.style.fontSize = '16px'; 
  walletText.style.color = '#ffffff'; 

  // Append the wallet text to the container
  walletContainer.appendChild(walletText);

  // Append the container to the wallet address display element
  walletAddressDisplay.appendChild(walletContainer);

  // Show the edit nickname button
  document.getElementById('edit-nickname-button').style.display = 'block';
}

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';

// Fetch SOL price in USD from CoinGecko API
async function getSolPriceInUsd() {
  try {
    const response = await fetch(COINGECKO_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.solana.usd;
  } catch (err) {
    console.error('Failed to fetch SOL price in USD:', err);
    return NaN;
  }
}

export async function displayWalletBalance(balance) {
  try {
    const solPriceInUsd = await getSolPriceInUsd();
    if (isNaN(solPriceInUsd)) {
      throw new Error('Failed to fetch SOL price in USD');
    }

    // Calculate balance in USD
    const balanceInUsd = (balance * solPriceInUsd).toFixed(2);

    const walletBalanceElement = document.getElementById('wallet-balance');
    walletBalanceElement.innerHTML = ''; // Clear previous content

    // Create a container for the wallet balance
    const balanceContainer = document.createElement('div');
    balanceContainer.classList.add('balance-container'); // Add class for styling

    // Balance text
    const balanceText = document.createElement('div');
    balanceText.textContent = `(${balance.toFixed(5)} SOL) ~ (${balanceInUsd} USD)`;
    balanceText.style.fontSize = '16px';
    balanceText.style.color = '#ffffff'; 

    // Append the balance text to the container
    balanceContainer.appendChild(balanceText);

    // Append the balanceContainer to the wallet balance display element
    walletBalanceElement.appendChild(balanceContainer);
  } catch (err) {
    console.error('Failed to display wallet balance:', err);
    document.getElementById('wallet-balance').textContent = 'Failed to display wallet balance. Please try again.';
  }
}