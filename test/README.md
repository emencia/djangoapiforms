# Tests

## Install the dev server

Clone the repository and go to the `test/testserver` folder. Create a virtualenv, activate it and install
the required packages:

```bash
pip install -r requirements
```

Initialize:

```bash
python manage.py migrate
```

Run:

```bash
python manage.py runserver
```

# Run the tests

Go to the root folder install the packages:

```bash
yarn
# or
npm install
```

Run the tests

```bash
yarn test
# or
npm run test
```