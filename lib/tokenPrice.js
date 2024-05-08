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
export async function getCoinsList() {
  const url = "https://api.coingecko.com/api/v3/coins/list";
  return fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      return json;
    })
    .catch((err) => console.error("error:" + err));
}

// This endpoint allows you to query the prices of one or more coins by using their unique Coin API IDs.
export async function getPriceById(id, symbol) {
  let url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd%2Caud`;

  return fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      // create variables and message to return price information
      const usdPrice = json[`${id}`]["usd"];
      const audPrice = json[`${id}`]["aud"];
      const data = {
        msg: `The current price for ${id} is:\n $USD: ${usdPrice}\n $AUD: ${audPrice}`,
      };
      return data;
    })
    .catch((err) => {
      console.error("error in getPriceById:" + err);
      const data = {
        msg: `Error: There is no price data for ${symbol}`,
      };
      return data;
    });
}

// find the token name from array returned from getCoinsList() using symbol entered by user
export function getIdBySymbol(coinsList, symbol) {
  const foundObject = coinsList.find(
    (obj) => obj.symbol.toLowerCase() === symbol.toLowerCase()
  );
  return foundObject ? foundObject.id : null;
}

export async function handleTokenQuery(match) {
  // strip the $
  const symbol = match[1];

  // query coingecko Coins List (ID Map)
  const coinsList = await getCoinsList();

  // retrieve id from coinsList using user input symbol
  const id = getIdBySymbol(coinsList, symbol);

  // use coingecko Coin Price by ID api to get price and return message
  return await getPriceById(id, symbol);
}