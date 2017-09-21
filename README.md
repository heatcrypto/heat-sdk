# HEAT Nodejs / Browser libraries

[![Travis](https://img.shields.io/travis/Heat-Ledger-Ltd/heat-sdk.svg)](https://travis-ci.org/Heat-Ledger-Ltd/heat-sdk)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Dev Dependencies](https://david-dm.org/Heat-Ledger-Ltd/heat-sdk/dev-status.svg)](https://david-dm.org/Heat-Ledger-Ltd/heat-sdk?type=dev)

HEAT support libraries for Node.js and the browser

### Extended API documentation

[HEAT-SDK API](https://heat-ledger-ltd.github.io/heat-sdk/) browse all classes, interfaces, methods includes links to their source code implementation.

### Functionality

With HEAT-SDK you get full client-side/offline functionality of everything involving HEAT cryptocurrency. 
This includes but is not limited to:

- Full HEAT API wrapper
- Support for real-time updates through HEAT websocket API
- Complete client side support for both constructing and parsing binary transaction data
- Full client side encryption/decryption support for transaction attachments
- Support for all other low-level HEAT functionality. But all client side, no server needed! (publickeys, accountids, transaction signatures etc.)

### Usage

#### Node

Install heat-sdk

```bash
npm install heat-sdk --save
```

Require heat-sdk and use it in your project

```javascript
var heatsdk = require('heat-sdk').default
heatsdk.payment("mike@heatwallet.com","99.95").publicMessage("Happy birthday!").sign("my secret phrase").broadcast()
```

#### Browser

heat-sdk comes as an UMD module which means you could either `require` or `import {heatsdk} from 'heat-sdk'` or simply load as `<script src="">` and access it through `window.heatsdk`

```html
<html>
  <head>
    <script src="heat-sdk.js"></script>
    <script>
      window.heatsdk.payment("mike@heatwallet.com","99.95").publicMessage("Happy birthday!").sign("my secret phrase").broadcast()
    </script>
  </head>
</html>
```