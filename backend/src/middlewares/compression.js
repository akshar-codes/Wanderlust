import compression from "compression";

const compressionMiddleware = compression({
  threshold: 1024,
  level: process.env.NODE_ENV === "production" ? 6 : 1,
  filter(req, res) {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
});

export default compressionMiddleware;
