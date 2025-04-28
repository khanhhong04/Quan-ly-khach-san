const crypto = require("crypto");

exports.createHmacSignature = (data, secretKey) => {
  const sortedKeys = Object.keys(data)
    .filter(key => key !== "signature")
    .sort();
  const queryString = sortedKeys
    .map((key) => `${key}=${String(data[key] ?? "")}`)
    .join("&");
  return crypto
    .createHmac("sha256", secretKey)
    .update(queryString)
    .digest("hex");
};