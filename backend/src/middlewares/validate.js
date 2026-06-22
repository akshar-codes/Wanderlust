import AppError from "../utils/AppError.js";
import { flattenZodErrors } from "../validators/index.js";

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = flattenZodErrors(result.error);
    const summary = details.map((d) => d.message).join(", ");
    return next(AppError.validationError(details, summary));
  }

  req.body = result.data;
  return next();
};

export default validate;
