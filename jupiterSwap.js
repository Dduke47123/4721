// jupiterSwap.js

const JUPITER_API_URL = "https://quote-api.jup.ag/v1";
const FEE_WALLET = 'CUF8P851rexvZuxspPcLhEKAzGH6bWNdhvSv3P9Sxcpv';
const FEE_PERCENTAGE = 4.7; // 4.7% fee

// Fetch a quote from Jupiter API
async function getQuote(inputMint, outputMint, amount) {
  try {
    const response = await fetch(
      `${JUPITER_API_URL}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const quote = await response.json();
    return quote;
  } catch (err) {
    console.error('Failed to fetch quote:', err);
    throw err;
  }
}

// Execute a swap using Jupiter API
async function executeSwap(quote, userPublicKey, feePercentage, feeWallet) {
  try {
    // Calculate fee amount
    const outputAmount = quote.outAmount;
    const feeAmount = (outputAmount * feePercentage) / 100;
    const finalOutputAmount = outputAmount - feeAmount;

    // Update the quote with the fee-adjusted output amount
    quote.outAmount = finalOutputAmount.toString();

    // Add fee transfer instruction
    quote.route.fee = {
      amount: feeAmount.toString(),
      mint: quote.outputMint,
      pct: feePercentage.toString(),
    };

    const response = await fetch(`${JUPITER_API_URL}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: userPublicKey,
        feeAccount: feeWallet, // Send fee to this wallet
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const swapResult = await response.json();
    return swapResult;
  } catch (err) {
    console.error('Failed to execute swap:', err);
    throw err;
  }
}

// Swap token function
export async function swapToken(mint, userPublicKey) {
  try {
    const inputMint = 'So11111111111111111111111111111111111111112'; // SOL mint address
    const outputMint = mint;
    const amount = 1000000; // Amount in lamports (1 SOL = 1000000000 lamports)

    // Fetch a quote
    const quote = await getQuote(inputMint, outputMint, amount);

    // Execute the swap with fee
    const swapResult = await executeSwap(quote, userPublicKey, FEE_PERCENTAGE, FEE_WALLET);

    console.log('Swap successful:', swapResult);
    alert('Swap successful!');
  } catch (err) {
    console.error(`Failed to swap token ${mint}:`, err);
    alert(`Failed to swap token: ${err.message}`);
  }
}

// Buy token function
export async function buyToken(mint, userPublicKey) {
  try {
    const inputMint = 'So11111111111111111111111111111111111111112'; // SOL mint address
    const outputMint = mint;
    const amount = 1000000; // Amount in lamports (1 SOL = 1000000000 lamports)

    // Fetch a quote
    const quote = await getQuote(inputMint, outputMint, amount);

    // Execute the swap with fee
    const swapResult = await executeSwap(quote, userPublicKey, FEE_PERCENTAGE, FEE_WALLET);

    console.log('Buy successful:', swapResult);
    alert('Buy successful!');
  } catch (err) {
    console.error(`Failed to buy token ${mint}:`, err);
    alert(`Failed to buy token: ${err.message}`);
  }
}

// Sell token function
export async function sellToken(mint, userPublicKey) {
  try {
    const inputMint = mint;
    const outputMint = 'So11111111111111111111111111111111111111112'; // SOL mint address
    const amount = 1000000; // Amount in lamports (1 SOL = 1000000000 lamports)

    // Fetch a quote
    const quote = await getQuote(inputMint, outputMint, amount);

    // Execute the swap with fee
    const swapResult = await executeSwap(quote, userPublicKey, FEE_PERCENTAGE, FEE_WALLET);

    console.log('Sell successful:', swapResult);
    alert('Sell successful!');
  } catch (err) {
    console.error(`Failed to sell token ${mint}:`, err);
    alert(`Failed to sell token: ${err.message}`);
  }
}