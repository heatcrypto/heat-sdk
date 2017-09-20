# HEAT Nodejs / Browser libraries

[![Travis](https://img.shields.io/travis/Heat-Ledger-Ltd/heat-sdk.svg)](https://travis-ci.org/Heat-Ledger-Ltd/heat-sdk)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Dev Dependencies](https://david-dm.org/Heat-Ledger-Ltd/heat-sdk/dev-status.svg)](https://david-dm.org/Heat-Ledger-Ltd/heat-sdk?type=dev)

HEAT support libraries for Node.js and the browser

### Usage

```bash
npm install heat-sdk --save
```

### Functionality

With HEAT-SDK you get full client-side/offline functionality of everything involving HEAT cryptocurrency. 
This includes but is not limited to:

- Full HEAT API wrapper
- Support for real-time updates through HEAT websocket API
- Complete client side support for both constructing and parsing binary transaction data
- Full client side encryption/descryption support for transaction attachments
- Support for all other lower-level HEAT functionality, but all client side (publickeys, accountids, transaction signatures etc.)

### NPM scripts

 - `npm t`: Run test suite
 - `npm start`: Runs `npm run build` in watch mode
 - `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
 - `npm run test:prod`: Run linting and generate coverage
 - `npm run build`: Generage bundles and typings, create docs
 - `npm run lint`: Lints code
 - `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)