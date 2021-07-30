
# gameinput-ts
Runtime re-mappable procedural input for the web

# current-support
- keyboard
- mouse
- touch
- gamepad

# future-support
- UI elements
- WebSocket API

# how it works
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
- Input (raw, hooks into browser APIs, used by GameInput)
- GameInput - main API
- Button - unique names, boolean state
- Axis - unique names, floating point state

## Using
### Installing
- Via NPM (usage with webpack or snowpack, which are tested)
<br>
```
npm install @repcomm/gameinput-ts
```
```ts
import { GameInput } from "@repcomm/gameinput-ts";
```
- Browser ESM script:
<br>
```js
<script type="module">
import { GameInput } from "/path/to/gameinput/mod.js";
</script>
```

### Example Usage
```js
//get the singleton
let input = GameInput.get();

//create an axis
input.createAxis ("forward")
.addInfluence ({
  
  //make it influenced by up and w keys
  keys: ["w", "up"],
  
  //value when triggered by boolean state (such as keys, mouse buttons, gamepad buttons)
  value: 1.0,

  //make it influenced by first mouse button
  mouseButtons:[0],

  //you can also make it take on the value of the mouse axes
  mouseAxes:[0],
  //scale factor when activated by mouse/touch
  pointerAxisScale: 0.5

  //use gamepad axes!
  gpAxes:[0],
  //scale factor when activated by gamepad axes
  gpAxisScale: 2,
  //force use of specific connected gamepad
  gamepad: 0
})
//make it influenced by down and s keys
.addInfluence ({
  keys: ["s", "down"],
  value: -1.0
});

//loop
let fps = 30;
setInterval (()=>{
  //get the axis value
  let fwd = input.getAxisValue ("forward");

  console.log(fwd);

}, 1000/fps);
```

## Compiling
To build you'll want to clone the repo<br>
`git clone https://github.com/RepComm/gameinput-ts.git`

## Install dev dependencies
`npm install`
## Build
`npm run build`
