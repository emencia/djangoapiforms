# Django Api forms

[![npm package](https://img.shields.io/npm/v/djangoapiforms)](https://www.npmjs.com/package/djangoapiforms)

A composable to handle Django forms in json

- Post and put forms methods
- Errors management from Django form errors

## Install

```bash
yarn add djangoapiforms
# or
npm install djangoapiforms
```

## Usage

### Declare an instance

Create a `forms` object with the composable, passing it an api instance

```ts
import { useApi } from "restmix";
import { useForms } from "djangoapiforms";

const api = useApi();
const forms = useForms(api);

export { forms }
```

#### Parameters

- `api`: An instance of the useApi function from the "restmix" library.
- `statusCodes`: (Optional) An object with custom form status codes for schema and validation

Documentation of the api object: check the [Restmix documentation](https://synw.github.io/restmix/ts/get)

### Post a form

To post a form with a payload:

```ts
import { forms } from "@/state";

async function postLogin() {
  const { error, res, errors } = await forms.post("/api/account/login", {
    username: "foo",
    password: "bar",
  });
  if (!error) {
    console.log("Everything is ok, the response status code is > 200 and < 299");
  } else {
    if (error.type == "validation") {
      const errorsObject: Record<string,string>  = errors;
      console.log("The form has validation errors:", errorsObject)
    }
    else if (res.status == 401) {
      // the status code of the response is 401
    }
  }
}
```

## Errors

Form error types:

```ts
type FormResponseErrorType = "schema" | "validation" | "error";
```

- The `schema` level indicates a schema validation error from a <kbd>418</kbd> status code by default. A schema
error will throw an error in the console. This is to be used with things 
like [django-ninja](https://github.com/vitalik/django-ninja) that takes advantage of [Pydantic](https://github.com/pydantic/pydantic)
schemas
- The `validation` level indicates a Django form validation error with a <kbd>422</kbd> status code by default. The
error messages can then be printed to the user
- The `error` level happens when the response status code is > <kbd>299</kbd> and is not handled, like a <kbd>500</kbd>

To customize the status codes for validation and schema levels:

```ts
import { useApi } from "restmix";
import { useForms } from "djangoapiforms";

const api = useApi();
const forms = useForms(api, {
  schema: 418,
  validation: 200,
});
```

The example above uses the <kbd>200</kbd> status code for a response with some form
validation errors: this is the default behavior of Django. If possible we
recommend using a specific status code for form validation error: <kbd>422</kbd> by
default

## Types

Post and put form have the same signature:

```ts
const put: <T extends {
    errors?: FormErrors | undefined;
} = Record<string, any>>(uri: string, formData: Record<string, any>, multipart: false) => Promise<{
    error: null | {
        type: FormResponseErrorType;
    };
    res: ApiResponse<T>;
    errors: Record<string, string>;
}>
```

`T` is the expected response payload interface from the backend. This is to use
with schemas, like this:

```ts
interface LoginPostResponse {
  // required
  errors?: FormErrors;
  // other user defined fields
  foo: number;
  bar: Array<string>;
}

const { error, res, errors } = await forms.postForm<LoginPostResponse>("/api/account/login", {
  username: "foo",
  password: "bar",
});
if (!error) {
  const responseData: LoginPostResponse = res.data;
}
```