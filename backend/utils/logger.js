// utils/logger.js
export const logError = (message, error) => {
  console.error(message, error?.stack || error);
};
