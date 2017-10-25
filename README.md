# HEAT Nodejs / Browser libraries

[![Travis](https://img.shields.io/travis/Heat-Ledger-Ltd/heat-sdk.svg)](https://travis-ci.org/Heat-Ledger-Ltd/heat-sdk)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Dev Dependencies](https://david-dm.org/Heat-Ledger-Ltd/heat-sdk/dev-status.svg)](https://david-dm.org/Heat-Ledger-Ltd/heat-sdk?type=dev)
[![NPM version](https://img.shields.io/npm/v/heat-sdk.svg)](https://www.npmjs.com/package/heat-sdk)

HEAT support libraries for Node.js and the browser

### Links

[**HEAT-SDK API**](https://heat-ledger-ltd.github.io/heat-sdk/) browse all classes, interfaces, methods includes links to their source code implementation.

[**HEAT REST API**](https://heatwallet.com/api/#/) OpenAPI, heat server

[**GITHUB**](https://github.com/Heat-Ledger-Ltd/heat-sdk) Heat-Ledger-Ltd/heat-sdk

### Functionality

With HEAT-SDK you get full client-side/offline functionality of everything involving HEAT cryptocurrency. 
This includes but is not limited to:

- Full HEAT API wrapper
- Support for real-time updates through HEAT websocket API
- Complete client side support for both constructing and parsing binary transaction data
- Full client side encryption/decryption support for transaction attachments
- Support for all other low-level HEAT functionality. But all client side, no server needed! (publickeys, accountids, transaction signatures etc.)

### Samples

All samples open in https://runkit.com/ which gives you a live Nodejs environment, feel free to play around change the code samples, click RUN and see the output.

[![NODEJS | API ACCESS](https://img.shields.io/badge/NODEJS-API%20ACCESS-orange.svg)](https://runkit.com/dmdeklerk/heat-sdk-api-access)

[![NODEJS | GENERATE ACCOUNT](https://img.shields.io/badge/NODEJS-GENERATE%20ACCOUNT-orange.svg)](https://runkit.com/dmdeklerk/heat-sdk-generate-account)

[![BROWSER | GENERATE ACCOUNT](https://img.shields.io/badge/BROWSER-GENERATE%20ACCOUNT-orange.svg)](https://embed.plnkr.co/ySpykW/)

[![NODEJS | DEX USD to HEAT  ](https://img.shields.io/badge/NODEJS-DEX%20USD%20to%20HEAT-orange.svg)](https://runkit.com/dmdeklerk/heat-sdk-live-dex-usd-to-heat)

[![BROWSER | DEX USD to HEAT  ](https://img.shields.io/badge/BROWSER-DEX%20USD%20to%20HEAT-orange.svg)](https://embed.plnkr.co/rsVVcU/)

[![BROWSER | BLOCK WHEN?  ](https://img.shields.io/badge/BROWSER-BLOCK%20WHEN-orange.svg)](https://embed.plnkr.co/gVZVlH/)

[![BROWSER | WEBSOCKETS  ](https://img.shields.io/badge/BROWSER-WEBSOCKETS-orange.svg)](https://embed.plnkr.co/h57qe7NRprjB409Vhb6f/)

### Usage

#### Node

Install heat-sdk

```bash
npm install heat-sdk --save
```

When using TypeScript install @typings with

```bash
npm install @types/heat-sdk --save
```

Require heat-sdk and use it in your project

```javascript
var {HeatSDK} = require('heat-sdk')
var sdk = new HeatSDK()
sdk.payment("mike@heatwallet.com","99.95")
   .publicMessage("Happy birthday!")
   .sign("my secret phrase")
   .broadcast()
```

#### Browser

heat-sdk comes as an UMD module which means you could either `require` or `import {heatsdk} from 'heat-sdk'` or simply load as `<script src="">` and access it through `window.heatsdk`

```html
<html>
  <head>
    <script src="heat-sdk.js"></script>
    <script>
      var sdk = new heatsdk.HeatSDK()
      sdk.payment("mike@heatwallet.com","99.95")
         .publicMessage("Happy birthday!")
         .sign("my secret phrase")
         .broadcast()
    </script>
  </head>
</html>
```