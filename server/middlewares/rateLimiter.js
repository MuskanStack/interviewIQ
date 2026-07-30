const rateStore = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

export const checkEmailRateLimit = (req, res, next) => {
  const key = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const now = Date.now();
  const entry = rateStore.get(key) || { count: 0, firstRequest: now };

  if (now - entry.firstRequest > WINDOW_MS) {
    entry.count = 0;
    entry.firstRequest = now;
  }

  entry.count += 1;
  rateStore.set(key, entry);

  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({ message: "Too many requests. Please try again later." });
  }

  next();
};
