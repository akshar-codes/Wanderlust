const AppError = require("../utils/AppError");
const { flattenZodErrors } = require("../validators/schemas");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = flattenZodErrors(result.error);
    // Human-readable summary joins all messages; details array gives field-level info
    const summary = details.map((d) => d.message).join(", ");
    return next(AppError.validationError(details, summary));
  }

  // Replace body with Zod-parsed value (trimmed strings, coerced numbers, etc.)
  req.body = result.data;
  return next();
};

module.exports = validate;
