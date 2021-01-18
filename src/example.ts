
//import { GameInput } from "@repcomm/gameinput-ts";
import { GameInput } from "./mod";

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
