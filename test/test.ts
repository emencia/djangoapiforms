import { useForms } from "../src/main";
import { useApi } from 'restmix';
import { CustomResponseType } from "./interfaces";

let api = useApi({
  serverUrl: 'http://localhost:8000',
});

const forms = useForms(api, { validation: 200, schema: 200 });
const forms2 = useForms(api);

function _printRes(res: Record<string, any>) {
  console.log("-----------------------------------");
  const r = JSON.stringify(res, null, "  ");
  console.log(r)
  console.log("-----------------------------------");
}

describe('test forms', () => {
  it('form ok', async () => {
    const payload = { username: "testuser", password: "testpwd" };
    const { error, res, errors } = await forms.post("/formtest/", payload);
    //_printRes(res.data);
    expect(res.ok).toBe(true);
    expect(res.status).toBe(204);
    expect(error).toBeNull();
    expect(errors).toEqual({});
  });
  it('form invalid validation 200', async () => {
    const payload = { username: "testuser", password: "wrong" };
    const { error, res, errors } = await forms.post("/formtest/", payload);
    //_printRes(errors);
    //expect(res.ok).toBe(false);
    expect(error).toEqual({ "type": "validation" });
    expect(errors).toEqual({
      "__all__": "Please enter a correct username and password. Note that both fields may be case-sensitive."
    });
  });
  it('schema invalid 200', async () => {
    const payload = { username: "testuser" };
    const { error, res, errors } = await forms.post("/formtest/", payload);
    expect(error).toEqual({ "type": "schema" });
    //_printRes(errors);
  });
  it('form invalid validation 422', async () => {
    const payload = { username: "testuser", password: "wrong" };
    const { error, res, errors } = await forms2.post("/formtest/status", payload);
    //_printRes(errors);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(422);
    expect(error).toEqual({ "type": "validation" });
    expect(errors).toEqual({
      "__all__": "Please enter a correct username and password. Note that both fields may be case-sensitive."
    });
  });
  it('schema invalid 418', async () => {
    const payload = { username: "testuser" };
    const { error, res, errors } = await forms2.post("/formtest/status", payload);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(418);
    expect(error).toEqual({ "type": "schema" });
    expect(JSON.parse(errors.error)).toEqual({
      "error": {
        "type": "schema"
      },
      "errors": [
        {
          "type": "missing",
          "loc": [
            "password"
          ],
          "msg": "Field required",
          "input": {
            "username": "testuser"
          },
          "url": "https://errors.pydantic.dev/2.3/v/missing"
        }
      ]
    })
  });
  it('error 500', async () => {
    const { error, res, errors } = await forms.post("/formtest/error", {});
    expect(error).toEqual({ "type": "error" });
  });
  it('response type', async () => {
    const payload = { username: "testuser", password: "testpwd" };
    const { error, res, errors } = await forms.post<CustomResponseType>("/formtest/custom", payload);
    expect(res.data.extra).toBe("foo");
  });
});
