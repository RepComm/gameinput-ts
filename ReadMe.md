# gameinput-ts
Runtime re-mappable, reusable, procedural input that supports<br>
controllers, keyboards, mouse, touch, and UI

This repo is being refactored to have a simpler, more complete API

The main idea:
- Anything can be a button
- Anything can be an axis

Anything being:
- keyboard buttons
- mouse buttons
- mouse axes
- touch
- gamepad buttons
- gamepad axes
- HTML elements

## Classes
- Input (raw, used by GameInput)
- GameInput - main API
- Button
- Axis

## Using
To install with npm run<br>`npm install @repcomm/gameinput-ts`<br><br>
and `import { GameInput } from "@repcomm/gameinput-ts";`<br><br>
If you need to import without npm, you want to import the `mod.js` file

This package comes with typescript definitions, and should work in both typescript and javascript.

## Example Usage
```js
import { GameInput } from "@repcomm/gameinput-ts";
// import { GameInput } from "./mod";

let input = GameInput.get();

input.createAxis ("forward")
.addInfluence ({
  keys: ["w", "up"],
  value: 1.0
}).addInfluence ({
  keys: ["s", "down"],
  value: -1.0
});

input.getAxisValue ("forward");
```

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
