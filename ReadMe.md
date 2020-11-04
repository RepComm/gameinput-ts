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

## Future additions
- Gamepad Axis value caching
- Touch, mouse, and (optional) axis mapping to movement xy
- Standardized pointer movement cache
- Persistent sensitivity for axis and pointer

## Using
To install with npm run<br>`npm install @repcomm/gameinput-ts`<br><br>
and `import { GameInput } from "@repcomm/gameinput-ts";`<br><br>
If you need to import without npm, you want to import the `mod.js` file

This package comes with typescript definitions, and should work in both typescript and javascript.

## Example Usage
```js
import { GameInput } from "@repcomm/gameinput-ts";

let input = GameInput.get();

//Create a jump control
input.createBinding("jump")
//see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
//https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
.addKeys("w", "up", " ")
//add some buttons (you can use https://gamepad-tester.com/)
.addPadButtons(0, 1, 2)
//add an axis rule
.createPadAxisRule(0, AxisRule.GREATER_THAN, 0.5)

//lock cursor to canvas
input.raw.tryLock(myCanvas);

//unlock from canvas
input.raw.unlock();

//game/app loop
setInterval(()=>{
  //test the button
  if (input.getButton("jump")) {
    console.log("^ boing! ^");
  }

  //touch / mouse is down
  if (input.pointerPrimary) {

  }

  //mouse movement
  let mx = input.raw.consumeMovementX();
  let my = input.raw.consumeMovementY();
}, 1000 / 15);
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
