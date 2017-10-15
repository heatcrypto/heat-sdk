import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import sourceMaps from "rollup-plugin-sourcemaps"
import globals from "rollup-plugin-node-globals"
const pkg = require("./package.json")
const camelCase = require("lodash.camelcase")
import json from 'rollup-plugin-json'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'
import typescript from 'rollup-plugin-typescript2'
import alias from 'rollup-plugin-alias'

const path = require('path')
const libraryName = "heat-sdk"
export default [
  // heat-sdk.js
  {
    input: `src/${libraryName}.ts`,
    plugins: [
      typescript(/*{ plugin options }*/),
      json(),
      resolve({
        preferBuiltins: true
      }),
      commonjs({
        ignore: [ 'memcpy' ]
      }),
      sourceMaps()
    ],
    sourcemap: true,
    external: 'buffer,memcpy,url,http,https,zlib,stream,util'.split(','),
    output: [
			{ file: 'dist/heat-sdk.js', format: 'cjs' }
    ]
  },
  // heat-sdk.umd.js
  {
    input: `src/${libraryName}.ts`,
    plugins: [
      alias({
        'ws': path.resolve(__dirname, 'src/ws.browser.js'),
        'bytebuffer': path.resolve(__dirname, 'node_modules/bytebuffer/dist/bytebuffer.js'),
        'node-fetch': path.resolve(__dirname, 'src/node-fetch.browser.js')
      }),
      typescript(/*{ plugin options }*/),
      json(),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs({
        ignoreGlobal: true
      }),
      globals(),
      sourceMaps()      
    ],
    output: [
			{ file: 'dist/heat-sdk.umd.js', format: 'umd', name: 'heatsdk' }
    ]
  },
  // heat-sdk.umd.min.js
  {
    input: `src/${libraryName}.ts`,
    plugins: [
      alias({
        'ws': path.resolve(__dirname, 'src/ws.browser.js'),
        'bytebuffer': path.resolve(__dirname, 'node_modules/bytebuffer/dist/bytebuffer.js'),
        'node-fetch': path.resolve(__dirname, 'src/node-fetch.browser.js')
      }),
      typescript(/*{ plugin options }*/),
      json(),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs({
        ignoreGlobal: true
      }),
      globals(),
      sourceMaps(),
      uglify({}, minify)
    ],
    sourcemap: true,
    output: [
			{ file: 'dist/heat-sdk.umd.min.js', format: 'umd', name: 'heatsdk' }
    ]
  }  
]