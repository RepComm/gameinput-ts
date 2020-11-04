
//import { GameInput } from "@repcomm/gameinput-ts";
import { AxisRule, GameInput } from "./mod";

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