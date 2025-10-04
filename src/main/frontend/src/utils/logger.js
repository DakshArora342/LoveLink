const isProd = process.env.NODE_ENV === 'production';

const logger = {
  log: (...args) => {
    if (!isProd) console.log(...args);
  },
  warn: (...args) => {
    if (!isProd) console.warn(...args);
  },
  error: (...args) => {
    if (!isProd) {
      console.error(...args);
    } else {
      // In production, optionally send errors to a remote service
      // e.g., sendErrorToService(args[0]);
    }
  }
};

export default logger;