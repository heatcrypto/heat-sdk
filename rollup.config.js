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

const libraryName = "heat-sdk"
export default [
  // heat-sdk.js
  {
    input: `compiled/${libraryName}.js`,
    plugins: [
      typescript(/*{ plugin options }*/),
      json(),
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      sourceMaps()
    ],
    sourcemap: true,
    external: ['fs', 'path', 'events', 'module'],
    output: [
			{ file: 'dist/heat-sdk.js', format: 'es' }
    ]
  },
  // heat-sdk.umd.js
  {
    input: `compiled/${libraryName}.js`,
    plugins: [
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
    input: `compiled/${libraryName}.js`,
    plugins: [
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