export const sendSuccess = (res, data, status = 200, meta = null) => {
  const response = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(status).json(response);
};

export const sendError = (
  res,
  message,
  status = 500,
  { code, details } = {},
) => {
  const body = { success: false, message };
  if (code) body.code = code;
  if (details) body.details = details;
  return res.status(status).json(body);
};
