import { FormErrors, FormResponseErrorType } from "../src/interfaces";

interface CustomResponseType {
  error?: { type: FormResponseErrorType },
  errors?: FormErrors,
  extra: string,
}

export { CustomResponseType }