import AppError from "../utils/AppError.js";
import { flattenZodErrors } from "../validators/index.js";

/**
 * Generic query-string validator. Parses `req.query` against `schema` and
 * replaces it with the coerced/defaulted result. Mirrors the body-validation
 * pattern in `validate.js` so query-param validation follows the same
 * conventions (and error shape) as body validation across the API.
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const details = flattenZodErrors(result.error);
    const summary = details.map((d) => d.message).join(", ");
    return next(AppError.validationError(details, summary));
  }

  req.query = result.data;
  return next();
};

export default validateQuery;
