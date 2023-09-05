import { useApi, ApiResponse } from "restmix";
import { FormErrors, FormResponseErrorType, FormStatusCodes } from "./interfaces";


/**
 * `useForms` is a custom hook designed to simplify the process of form submission 
 * and error handling in a Django REST API environment. 
 * 
 * @param {ReturnType<typeof useApi>} api - The API handler.
 * @param {FormStatusCodes} statusCodes - Customizable status codes for form responses.
 * 
 * @returns {object} - An object containing methods (`post`, `put`, `processErrors`) 
 *                     for interacting with the API and the status codes.
 */

const useForms = (api: ReturnType<typeof useApi>, statusCodes: FormStatusCodes = {
  schema: 418,
  validation: 422,
}) => {
  let codes = statusCodes;

  /**
   * Takes a `FormErrors` object and converts it to a simpler errors object.
   * The simpler errors object has field names as keys and concatenated error messages as values.
   * 
   * @param {FormErrors} formErrors - Errors object containing details for each form field.
   * 
   * @returns {Record<string, string>} - A simplified errors object.
   */
  const processErrors = (formErrors: FormErrors): Record<string, string> => {
    const errors: Record<string, string> = {};
    for (const [name, errs] of Object.entries(formErrors)) {
      let msgs = new Array<string>();
      errs.forEach((err) => {
        msgs.push(err.message)
      })
      errors[name] = msgs.join("<br />");
    }
    return errors
  }

  /**
   * Sends a PUT request to the specified URI with the given form data.
   * This method takes care of error processing and standardizes the response.
   * 
   * @param {string} uri - The URI to send the PUT request to.
   * @param {Record<string, any> | Array<any>} formData - The form data to be sent in the PUT request.
   * @param {boolean} [verbose=false] - Flag for logging detailed information. Useful for debugging.
   * 
   * @returns {Promise<object>} - Returns a Promise that resolves to an object containing:
   *                             - `error`: null if the request was successful, or an object containing
   *                                       the error type if an error occurred.
   *                             - `res`: The ApiResponse object containing details of the response.
   *                             - `errors`: A simplified errors object with field names as keys and 
   *                                        concatenated error messages as values.
   * 
   * @example
   * ```ts
   * const { error, res, errors } = await put('/api/resource', { field1: 'value1' });
   * ```
   */
  const put = async <T extends { errors?: FormErrors } = Record<string, any>>(
    uri: string,
    formData: Record<string, any> | Array<any>,
    verbose = false,
  ): Promise<{
    error: null | {
      type: FormResponseErrorType,
    },
    res: ApiResponse<T>,
    errors: Record<string, string>
  }> => {
    return await _postFormData<T>(uri, formData, true, false, verbose)
  }

  /**
   * Sends a POST request to the specified URI with the given form data.
   * This method can optionally handle multipart data and takes care of error processing,
   * providing a standardized response.
   * 
   * @param {string} uri - The URI to send the POST request to.
   * @param {Record<string, any> | Array<any>} formData - The form data to be sent in the POST request.
   * @param {boolean} [multipart=false] - Flag to indicate if the request should be multipart.
   * @param {boolean} [verbose=false] - Flag for logging detailed information. Useful for debugging.
   * 
   * @returns {Promise<object>} - Returns a Promise that resolves to an object containing:
   *                             - `error`: null if the request was successful, or an object containing
   *                                       the error type if an error occurred.
   *                             - `res`: The ApiResponse object containing details of the response.
   *                             - `errors`: A simplified errors object with field names as keys and 
   *                                        concatenated error messages as values.
   * 
   * @example
   * ```ts
   * const { error, res, errors } = await post('/api/resource', { field1: 'value1' });
   * ```
   */
  const post = async <T extends { errors?: FormErrors } = Record<string, any>>(
    uri: string,
    formData: Record<string, any> | Array<any>,
    multipart = false,
    verbose = false,
  ): Promise<{
    error: null | {
      type: FormResponseErrorType,
    },
    res: ApiResponse<T>,
    errors: Record<string, string>
  }> => {
    const data = await _postFormData<T>(uri, formData, false, multipart, verbose)
    return data
  }

  // Private method that powers both `post` and `put` methods
  // The `put` argument is a flag that decides whether to use the POST or PUT HTTP method  
  const _postFormData = async <T extends {
    error?: { type: FormResponseErrorType },
    errors?: FormErrors,
  } = Record<string, any>>(
    uri: string,
    data: Record<string, any> | Array<any>,
    put: boolean,
    multipart: boolean,
    verbose: boolean,
  ): Promise<{
    error: null | {
      type: FormResponseErrorType,
    },
    res: ApiResponse<T>,
    errors: Record<string, string>
  }> => {
    let resp: ApiResponse<T>;
    if (!put) {
      resp = await api.post<T>(uri, data, multipart, verbose);
    } else {
      resp = await api.put<T>(uri, data, verbose);
    }
    if (codes.validation == 200 && codes.schema == 200) {
      // check form validation errors
      if ("error" in resp.data) {
        switch (resp.data.error?.type) {
          case "validation":
            if ("errors" in resp.data) {
              const rawerrs = resp.data["errors"] as FormErrors;
              if (Object.keys(rawerrs).length > 0) {
                const errors = processErrors(rawerrs);
                return { error: { type: "validation" }, errors: errors, res: resp }
              }
            }
            break;
          case "schema":
            if ("errors" in resp.data) {
              const errs = JSON.stringify(resp.data.errors, null, "  ")
              return { error: { type: "schema" }, errors: { "error": errs }, res: resp }
            }
          case "error":
            return { error: { type: "error" }, res: resp, errors: { "error": "internal server error" } }
          default:
            throw new Error("Unknown error:\n" + JSON.stringify(resp.data, null, "  "))
        }
      }
    }
    if (!resp.ok) {
      // status code is > 299
      switch (resp.status) {
        case codes.schema:
          const msg = JSON.stringify(resp.data, null, "  ");
          return { error: { type: "schema" }, errors: { "error": msg }, res: resp }
        case codes.validation:
          // check form validation errors 
          const rawerrs = resp.data["errors"] as FormErrors;
          const errors = processErrors(rawerrs);
          return { error: { type: "validation" }, errors: errors, res: resp }
        default:
          const err = JSON.stringify(resp.data, null, "  ");
          console.warn(`Unmanaged error status code ${resp.status}, ${err}`)
          return { error: { type: "error" }, res: resp, errors: {} }
      }
    }
    return { error: null, res: resp, errors: {} }
  }

  return {
    post,
    put,
    processErrors,
    codes,
  }
}

export { useForms }