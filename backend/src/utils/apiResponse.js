const sendSuccess = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

const sendError = (res, message, status = 500, { code, details } = {}) => {
  const body = { success: false, message };
  if (code) body.code = code;
  if (details) body.details = details;
  return res.status(status).json(body);
};

module.exports = { sendSuccess, sendError };
