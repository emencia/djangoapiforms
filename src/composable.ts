import { useApi, ApiResponse } from "restmix";
import { FormErrors, FormResponseErrorType, FormStatusCodes } from "./interfaces";


const useForms = (api: ReturnType<typeof useApi>, statusCodes: FormStatusCodes = {
  schema: 418,
  validation: 422,
}) => {
  let codes = statusCodes;

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

  const _postFormData = async <T extends { errors?: FormErrors } = Record<string, any>>(
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
      console.log("POST FORM", uri, JSON.stringify(data, null, "  "));
      resp = await api.post<T>(uri, data, multipart, verbose);
      console.log("RES FORM", resp);
    } else {
      resp = await api.put<T>(uri, data, verbose);
    }
    if (!resp.ok) {
      // status code is > 299
      switch (resp.status) {
        case codes.schema:
          const msg = JSON.stringify(resp.data, null, "  ");
          return { error: { type: "schema" }, errors: { "error": msg }, res: resp }
        //throw new Error(`${codes.schema} Invalid schema for form data ${msg}`)
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
    if (codes.validation == 200) {
      // check form validation errors 
      const rawerrs = resp.data["errors"] as FormErrors;
      if (Object.keys(rawerrs).length > 0) {
        const errors = processErrors(rawerrs);
        return { error: { type: "validation" }, errors: errors, res: resp }
      }
    }
    //console.log("RESP", JSON.stringify(resp, null, "  "))
    return { error: null, res: resp, errors: {} }
  }

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
    console.log("POST PAYLOAD", formData);
    const data = await _postFormData<T>(uri, formData, false, multipart, verbose)
    console.log("DATA", data)
    return data
  }

  return {
    post,
    put,
    processErrors,
    codes,
  }
}

export { useForms }