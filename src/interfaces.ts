/**
 * Represents an individual form error.
 *
 * @example
 * ```ts
 * const formError: FormError = {
 *   message: "an error message",
 *   code: "invalid field",
 * }
 * ```
 */
interface FormError {
  /** Error message describing the issue. */
  message: string;
  /** Error code identifying the specific error. */
  code: string;
}

/**
 * Type representing the possible form response error types.
 *
 * @example
 * ```ts
 * const errorType: FormResponseErrorType = "validation";
 * ```
 */
type FormResponseErrorType = "schema" | "validation" | "error";

/**
 * Represents a collection of form errors organized by field name.
 *
 * @example
 * ```ts
 * const formErrors: FormErrors = {
 *   fieldName: [
 *     { message: "an error message", code: "invalid field" },
 *   ],
 * }
 * ```
 */
type FormErrors = Record<string, Array<FormError>>;

/**
 * Represents the status codes used for identifying form errors.
 *
 * @example
 * ```ts
 * const customStatusCodes: FormStatusCodes = {
 *   schema: 418,
 *   validation: 422,
 * }
 * ```
 */
interface FormStatusCodes {
  /** Status code representing a schema error. */
  schema: number;
  /** Status code representing a validation error. */
  validation: number;
}

export {
  FormError,
  FormErrors,
  FormResponseErrorType,
  FormStatusCodes,
}