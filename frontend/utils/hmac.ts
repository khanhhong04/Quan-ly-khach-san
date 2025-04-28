const CryptoJS = require("crypto-js");

export const createHmacSignature = (data: any, secretKey: string): string => {
  const sortedKeys = Object.keys(data).sort();
  const queryString = sortedKeys
    .map((key) => `${key}=${data[key] ?? ""}`)
    .join("&");
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
};