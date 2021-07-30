import { Input, on, off } from "./input.js";
export class GamePadManager {
  /**Store this variable to reduce memory spam*/
  constructor() {
    if (!GamePadManager.SINGLETON) {
      GamePadManager.SINGLETON = this;
    } else {
      throw "GamePadManager should not be instantiated more than once";
    }

    this.allGamepads = new Array();

    this.onGamePadConnected = evt => {
      if (evt.gamepad !== null) {
        this.allGamepads.push(evt.gamepad);
        console.log("Added gamepad", evt.gamepad);
      } else {
        console.log("Couldn't add null gamepad");
      }
    };

    this.onGamePadDisconnected = evt => {
      let ind = this.allGamepads.indexOf(evt.gamepad);

      if (ind === -1) {
        console.warn("Cannot remove disconnected controller that was never added");
        return;
      }

      this.allGamepads.splice(ind, 1);
    };

    this.registerEvents();
  }

  static get() {
    if (!GamePadManager.SINGLETON) {
      new GamePadManager();
    }

    return GamePadManager.SINGLETON;
  }

  registerEvents() {
    on(window, "gamepadconnected", this.onGamePadConnected);
    on(window, "gamepaddisconnected", this.onGamePadDisconnected);
  }

  unregisterEvents() {
    off(window, "gamepadconnected", this.onGamePadConnected);
    off(window, "gamepaddisconnected", this.onGamePadDisconnected);
  }

  nativeGetAllGamepads() {
    return navigator.getGamepads();
  }
  /**Returns true when this is at least one connected gamepad*/


  hasGamepads() {
    for (let gp of this.allGamepads) {
      if (gp && gp.connected) return true;
    }

    return false;
  }
  /**Get a gamepad
   * 
   * When an index is undefined, or negative, the first non-falsy gamepad is returned
   * 
   * If no gamepads available, return will be falsy (undefined)
   * 
   * @param index 
   */


  getGamepad(index = undefined) {
    if (!index || index < 0) {
      for (let gp of this.allGamepads) {
        if (gp && gp.connected) return gp;
      }
    } else {
      return this.allGamepads[index];
    }
  }
  /**Get a gamepad button
   * 
   * If index is not specified, the first available gamepad will be used
   * 
   * If no gamepads available, result will be false
   * 
   * @param btn 
   * @param index 
   */


  getButton(btn, index = -1) {
    this.getGamepadTemp = this.getGamepad(index);
    if (this.getGamepadTemp) return this.getGamepadTemp.buttons[btn].pressed;
    return false;
  }
  /**Get a gamepad axis
   * 
   * If no index is specified, the first available gamepad will be used
   * 
   * If no gamepads available, return will be 0.0
   * 
   * @param axis 
   * @param index 
   */


  getAxis(axis, index = -1) {
    this.getGamepadTemp = this.getGamepad(index);
    if (this.getGamepadTemp) return this.getGamepadTemp.axes[axis];
    return 0;
  }

}
/**An input axis influence
 * 
 * Anything can influence an axis:
 * - gamepad buttons
 * - gamepad axes
 * - keyboard
 * - mouse buttons
 * - mouse axis
 * - HTML element pointer events
 */

export class Button {
  constructor() {
    this.influences = new Set();
  }

  addInfluence(info) {
    this.influences.add(info);
    return this;
  }

  removeInfluence(info) {
    this.influences.delete(info);
    return this;
  }

  hasInfluence(info) {
    return this.influences.has(info);
  }

  getInfluences() {
    let result = new Array(this.influences.size);
    let i = 0;

    for (let inf of this.influences) {
      result[i] = inf;
      i++;
    }

    return result;
  }

  test(input) {
    for (let inf of this.influences) {
      if (inf.keys) {
        for (let key of inf.keys) {
          if (input.raw.getKeyboardButton(key)) return true;
        }
      }

      if (inf.gpButtons) {
        for (let btn of inf.gpButtons) {
          if (input.gamePadManager.getButton(btn, inf.gpIndex)) return true;
        }
      }

      if (inf.mouseButtons) {
        for (let btn of inf.mouseButtons) {
          if (input.raw.getPointerButton(btn)) return true;
        }
      } //I admit this is a weird way to do a button


      if (inf.mouseAxes) {
        let largest = 0;
        let current = 0;

        for (let axis of inf.mouseAxes) {
          switch (axis) {
            case 0:
              current = input.builtinMovementConsumer.getDeltaX();
              break;

            case 1:
              current = input.builtinMovementConsumer.getDeltaY();
              break;

            default:
              break;
            // case 2: //TODO - maybe add mouse wheel here?
            //   current = input.builtinMovementConsumer.getDeltaX();
            //   break;
          }

          if (Math.abs(current) > Math.abs(largest)) {
            largest = current;
          }
        }

        if (largest !== 0) return true;
      }

      if (inf.gpAxes) {
        let largest = 0;
        let current = 0;

        for (let axis of inf.gpAxes) {
          current = input.gamePadManager.getAxis(axis, inf.gpIndex);

          if (Math.abs(current) > Math.abs(largest)) {
            largest = current;
          }
        }

        if (largest !== 0) return true;
      }
    }

    return false;
  }

}
export class Axis {
  constructor() {
    this.influences = new Set();
  }

  addInfluence(info) {
    if (!info.gpAxisScale) info.gpAxisScale = 1;
    if (!info.pointerAxisScale) info.pointerAxisScale = 1;
    this.influences.add(info);
    return this;
  }

  removeInfluence(info) {
    this.influences.delete(info);
    return this;
  }

  hasInfluence(info) {
    return this.influences.has(info);
  }

  getInfluences() {
    let result = new Array(this.influences.size);
    let i = 0;

    for (let inf of this.influences) {
      result[i] = inf;
      i++;
    }

    return result;
  }

  test(input) {
    for (let inf of this.influences) {
      if (inf.keys) {
        for (let key of inf.keys) {
          if (input.raw.getKeyboardButton(key)) {
            return inf.value;
          }
        }
      }

      if (inf.mouseButtons) {
        for (let btn of inf.mouseButtons) {
          if (input.raw.getPointerButton(btn)) {
            return inf.value;
          }
        }
      }

      if (inf.mouseAxes) {
        let largest = 0;
        let current = 0;

        for (let axis of inf.mouseAxes) {
          switch (axis) {
            case 0:
              current = input.builtinMovementConsumer.getDeltaX();
              break;

            case 1:
              current = input.builtinMovementConsumer.getDeltaY();
              break;

            default:
              break;
            // case 2: //TODO - maybe add mouse wheel here?
            //   current = input.builtinMovementConsumer.getDeltaX();
            //   break;
          }

          if (Math.abs(current) > Math.abs(largest)) {
            largest = current;
          }
        }

        if (largest !== 0) return largest * inf.pointerAxisScale;
      }

      if (inf.gpButtons) {
        for (let btn of inf.gpButtons) {
          if (input.gamePadManager.getButton(btn, inf.gpIndex)) {
            return inf.value;
          }
        }
      }

      if (inf.gpAxes) {
        let largest = 0;
        let current = 0;

        for (let axis of inf.gpAxes) {
          current = input.gamePadManager.getAxis(axis, inf.gpIndex);

          if (Math.abs(current) > Math.abs(largest)) {
            largest = current;
          }
        }

        if (largest !== 0) return largest * inf.gpAxisScale;
      }
    }

    return 0;
  }

}
export class GameInput {
  constructor() {
    if (!GameInput.SINGLETON) {
      GameInput.SINGLETON = this;
    } else {
      throw "GameInput should not be instantiated more than once";
    }

    this.raw = new Input();
    this.raw.registerEvents();
    this.builtinMovementConsumer = this.raw.getMovementConsumer();
    this.axes = new Map();
    this.buttons = new Map();
    this.gamePadManager = GamePadManager.get();
  }
  /**Returns the singleton GameInput
   */


  static get() {
    if (!GameInput.SINGLETON) {
      new GameInput();
    }

    return GameInput.SINGLETON;
  }
  /**Get a list of all known axes id's at current time*/


  getAxes() {
    let result = new Array(this.axes.size);
    let i = 0;

    for (let key of this.axes.keys()) {
      result[i] = key;
      i++;
    }

    return result;
  }
  /**Get a list of all known button id's at current time*/


  getButtons() {
    let result = new Array(this.buttons.size);
    let i = 0;

    for (let key of this.buttons.keys()) {
      result[i] = key;
      i++;
    }

    return result;
  }
  /**Checks if a axis name is already in use
   * @param name the unique name of the axis
   */


  hasAxis(name) {
    return this.axes.has(name);
  }
  /**Create an axis to track
   * 
   * You can assign any input to an axis, including keyboard, mouse, gamepad, and UI
   * @param name a unique name for the axis
   */


  createAxis(name) {
    if (this.hasAxis(name)) throw `Already have an axis by name of "${name}" !`;
    const result = new Axis();
    this.axes.set(name, result);
    return result;
  }

  getAxis(name) {
    return this.axes.get(name);
  }
  /**Get the current value of an axis input
   * @param name the unique name of the axis input
   */


  getAxisValue(name) {
    return this.getAxis(name).test(this);
  }

  deleteAxis(name) {
    this.axes.delete(name);
    return this;
  }

  hasButton(name) {
    return this.buttons.has(name);
  }

  createButton(name) {
    if (this.hasButton(name)) throw `Button name "${name}" already in use`;
    const result = new Button();
    this.buttons.set(name, result);
    return result;
  }

  getButton(name) {
    return this.buttons.get(name);
  }

  getButtonValue(name) {
    return this.getButton(name).test(this);
  }

  deleteButton(name) {
    this.buttons.delete(name);
    return this;
  }

  getGamePadManager() {
    return this.gamePadManager;
  }

  getOrCreateButton(name) {
    let result;

    if (!this.hasButton(name)) {
      result = this.createButton(name);
    } else {
      result = this.getButton(name);
    }

    return result;
  }

  getOrCreateAxis(name) {
    let result;

    if (!this.hasAxis(name)) {
      result = this.createAxis(name);
    } else {
      result = this.getAxis(name);
    }

    return result;
  }
  /**Create all the buttons and axes you want with JSON!*/


  addJsonConfig(config) {
    console.log("Added input layout", config.name);

    if (config.buttons) {
      //loop all button declarations
      for (let btnCfg of config.buttons) {
        //no need to add if no influences
        if (!btnCfg.influences) continue; //get or create the button

        let btn = this.getOrCreateButton(btnCfg.id); //add all influences

        for (let infCfg of btnCfg.influences) {
          btn.addInfluence(infCfg);
        }
      }
    }

    if (config.axes) {
      //loop all axes declarations
      for (let axisCfg of config.axes) {
        //no need to add if no influences
        if (!axisCfg.influences) continue; //get or create the axis

        let axis = this.getOrCreateAxis(axisCfg.id); //add all influences

        for (let infCfg of axisCfg.influences) {
          axis.addInfluence(infCfg);
        }
      }
    }

    return this;
  }

}