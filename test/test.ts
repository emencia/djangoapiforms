import { useForms } from "../src/main";
import { ApiResponse, useApi } from 'restmix';

let api = useApi({
  serverUrl: 'http://localhost:8000',
});

const forms = useForms(api, { validation: 200, schema: 200 });

function _printRes(res: ApiResponse | Record<string, string>) {
  console.log("-----------------------------------");
  const r = JSON.stringify(res, null, "  ");
  console.log(r)
  console.log("-----------------------------------");
}

describe('test forms', () => {
  it('form ok', async () => {
    const payload = { username: "testuser", password: "testpwd" };
    const { error, res, errors } = await forms.post("/formtest/", payload, false, true);
    //_printRes(res.data);
    expect(res.data).toEqual({ errors: [] });
    expect(error).toBeNull();
    expect(errors).toEqual({});
  });
  it('form invalid', async () => {
    const payload = { username: "testuser", password: "wrong" };
    const { error, res, errors } = await forms.post("/formtest/", payload, false, true);
    expect(error).toEqual({ "type": "validation" });
    _printRes(errors);
    //expect(errors).toEqual({});
  });
});