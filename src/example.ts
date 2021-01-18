
//import { GameInput } from "@repcomm/gameinput-ts";
import { GameInput } from "./mod.js";

let input = GameInput.get();

input.createAxis ("forward")
.addInfluence ({
  keys: ["w", "ArrowUp"],
  value: 1.0,
  mouseButtons:[0],
  mouseAxes:[0]
}).addInfluence ({
  keys: ["s", "ArrowDown"],
  value: -1.0
});

input.createButton("jump")
.addInfluence({
  keys: [" "]
});

setInterval(()=>{
  //console.log(input.getAxisValue ("forward"));
  if (input.getButtonValue("jump")) console.log("Jump");
}, 1000/15);

