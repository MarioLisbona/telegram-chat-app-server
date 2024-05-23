import { config as dotenvConfig } from "dotenv";

// Load environment variables from .env file
dotenvConfig();

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    "x-cg-demo-api-key": COINGECKO_API_KEY,
  },
};

// This endpoint allows you to query all the supported coins on CoinGecko with coins id, name and symbol.
export const getCoinsList = async () => {
  const url = "https://api.coingecko.com/api/v3/coins/list";
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching coins list:", error);
    // Optionally, you can throw the error to be handled by the caller
    throw error;
  }
};

// This endpoint allows you to query the prices of one or more coins by using their unique Coin API IDs.
export const getPriceById = async (id, symbol) => {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd%2Caud`;

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();

    // create variables and message to return price information
    const usdPrice = json[`${id}`]["usd"];
    const audPrice = json[`${id}`]["aud"];
    const data = {
      msg: `The current price for ${id} is:\n $USD: ${usdPrice}\n $AUD: ${audPrice}`,
      price: `USD ${usdPrice}`,
      symbol: symbol,
    };
    return data;
  } catch (err) {
    console.error("Error getting price ID:", err);
    const data = {
      msg: `Error: There is no price data for $${symbol}`,
    };
    return data;
  }
};

// find the token name from array returned from getCoinsList() using symbol entered by user
export const getIdBySymbol = (coinsList, symbol) => {
  try {
    const foundObject = coinsList.find(
      (obj) => obj.symbol.toLowerCase() === symbol.toLowerCase()
    );
    return foundObject ? foundObject.id : null;
  } catch (error) {
    console.error("Error in getIdBySymbol:", error);
    return null; // Or you could throw an error or return a specific error message/object
  }
};

export const handleTokenQuery = async (match) => {
  try {
    // strip the $
    const symbol = match[1];

    // query coingecko Coins List (ID Map)
    const coinsList = await getCoinsList();

    // retrieve id from coinsList using user input symbol
    const id = getIdBySymbol(coinsList, symbol);

    // Check if id was found
    if (!id) {
      throw new Error(`No ID found for symbol: ${symbol}`);
    }

    // use coingecko Coin Price by ID api to get price and return message
    return await getPriceById(id, symbol);
  } catch (error) {
    console.error("Error in handleTokenQuery:", error);
    return { msg: `Error handling token query: ${error.message}` };
  }
};

export async function getFirstAndLast20Coins() {
  try {
    const tokenData = await getCoinsList(); // Assuming getCoinsList() returns a Promise that resolves to an array of objects

    // Get the first 20 elements from the tokenData array
    const first20Tokens = tokenData.slice(0, 10);

    // Get the last 20 elements from the tokenData array
    const last20Tokens = tokenData.slice(-10);

    // Map over the first20Tokens array and call getPriceById for each token
    const firstTwentyPricesPromises = first20Tokens.map((token) =>
      getPriceById(token.id, token.symbol)
    );

    // Use Promise.all to wait for all promises to resolve
    const firstTwentyPrices = await Promise.all(firstTwentyPricesPromises);

    // Map over the last20Tokens array and call getPriceById for each token
    const lastTwentyPricesPromises = last20Tokens.map((token) =>
      getPriceById(token.id, token.symbol)
    );

    // Use Promise.all to wait for all promises to resolve
    const lastTwentyPrices = await Promise.all(lastTwentyPricesPromises);

    // Do something with the last 20 prices
    console.log("First 20 tokens prices:", firstTwentyPrices);

    // Do something with the last 20 prices
    console.log("Last 20 tokens prices:", lastTwentyPrices);

    return {
      firstTwentyPrices,
      lastTwentyPrices,
    };
  } catch (error) {
    console.error("Error fetching coin data:", error);
    return {
      firstTwentyPrices: [],
      lastTwentyPrices: [],
    };
  }
}
