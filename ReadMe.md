# gameinput-ts
Runtime re-mappable, reusable, procedural input that supports<br>
controllers, keyboards, mice, and touch

All with an easy to use API for developers<br>

## Implemented Classes
- InputBinding
- GamePadManager
- Input
- GameInput
- AxisRule
- TouchRect
## Implemented Interfaces
- AxisRuleJson
- TouchRectJson
- InputPointerState
- InputBindingJson
- InputBindingsJson
- RendererInterface

## Features
- import/export mappings to json
- mapping keyboard, touch, mouse, and gamepads
- runtime remapping

## Using
To install with npm run<br>`npm install @repcomm/gameinput-ts`<br><br>
and `import { GameInput } from "@repcomm/gameinput-ts";`<br><br>
If you need to import without npm, you want to import the `mod.js` file

This package comes with typescript definitions, and should work in both typescript and javascript.

## Compiling
TS -> JS is done using babel.js<br>
You can check out [ts-esm-babel-template](https://github.com/RepComm/ts-esm-babel-template)<br>
Which shows esmodule + typescript w/ babel -> js output<br><br>

or [webpack-ts-template](https://github.com/RepComm/webpack-ts-template) <br>
Which shows esmodule + typescript w/ babel + npm package integration<br>
<br>

To build you'll want to clone the repo<br>
`git clone https://github.com/RepComm/gameinput-ts.git`

Run `npm install` to get dependencies

Run `build.sh` (note: runs `npm run build`)
for compiling to javascript

----

For compiling ts defs you'll need [typescript](https://www.npmjs.com/package/typescript)<br>
Run `npm install -g typescript`

Run `build-types.sh`
