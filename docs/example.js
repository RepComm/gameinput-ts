//import { GameInput } from "@repcomm/gameinput-ts";
import { GameInput } from "./mod.js"; //so we can use await

async function main() {
  //get the singleton
  let input = GameInput.get(); //create an axis

  input.getOrCreateAxis("forward").addInfluence({
    //value when triggered by boolean state (such as keys, mouse buttons, gamepad buttons)
    value: 1.0,
    //make it influenced by first mouse button
    mouseButtons: [0],
    //you can also make it take on the value of the mouse axes
    mouseAxes: [0],
    //scale factor when activated by mouse/touch
    pointerAxisScale: 0.5,
    //use gamepad axes!
    gpAxes: [0],
    //scale factor when activated by gamepad axes
    gpAxisScale: 2,
    //force use of specific connected gamepad
    gpIndex: 0
  }); //You can also supply JSON!

  const inputMapFile = "./demo.input.json";
  console.log(`Fetching ${inputMapFile}`);
  let config = await (await fetch(inputMapFile)).json(); //button and axis definitions will merge with pre-existing buttons and axes

  input.addJsonConfig(config); //loop

  let fps = 30;
  setInterval(() => {
    //get the axis value
    let fwd = input.getAxisValue("forward");
    console.log(fwd);
  }, 1000 / fps);
}

main();