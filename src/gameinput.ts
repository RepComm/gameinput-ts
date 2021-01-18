
import { Input, on, off, MovementConsumer } from "./input.js";

export class GamePadManager {
  static SINGLETON: GamePadManager;
  private allGamepads: Array<Gamepad>;

  onGamePadConnected: (evt: GamepadEvent) => void;
  onGamePadDisconnected: (evt) => void;

  /**Store this variable to reduce memory spam*/
  private getGamepadTemp: Gamepad;

  constructor() {
    if (!GamePadManager.SINGLETON) {
      GamePadManager.SINGLETON = this;
    } else {
      throw "GamePadManager should not be instantiated more than once";
    }

    this.allGamepads = new Array();

    this.onGamePadConnected = (evt) => {
      if (evt.gamepad !== null) {
        this.allGamepads.push(evt.gamepad);
        console.log("Added gamepad", evt.gamepad);
      } else {
        console.log("Couldn't add null gamepad");
      }
    }
    this.onGamePadDisconnected = (evt) => {
      let ind = this.allGamepads.indexOf(evt.gamepad);
      if (ind === -1) {
        console.warn("Cannot remove disconnected controller that was never added");
        return;
      }
      this.allGamepads.splice(ind, 1);
    }
    this.registerEvents();
  }
  static get(): GamePadManager {
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
    off(window, "gamepadconnected", this.onGamePadConnected as any);
    off(window, "gamepaddisconnected", this.onGamePadDisconnected);
  }
  nativeGetAllGamepads(): Array<Gamepad> {
    return navigator.getGamepads();
  }
  /**Returns true when this is at least one connected gamepad*/
  hasGamepads (): boolean {
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
  getGamepad(index: number = undefined): Gamepad {
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
  getButton(btn: number, index: number = -1): boolean {
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
  getAxis(axis: number, index: number = -1): number {
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
export interface ButtonInfluence {
  /**Apply specific keyboard keys*/
  keys?: Array<string>;
  /**Apply specific gamepad buttons*/
  gpButtons?: Array<number>;
  /**Apply specific gamepad axes
   *
   * The first gamepad axis value will be used
   */
  gpAxes?: Array<number>;
  /**Select for a specific gamepad index, default is undefined (any)*/
  gamepad?: number;
  /**Apply specific mouse buttons*/
  mouseButtons?: Array<number>;
  /**Apply specific mouse axes*/
  mouseAxes?: Array<number>;
}

export interface AxisInfluence extends ButtonInfluence {
  /**The value to apply when triggered */
  value: number;
}

export class Button {
  private influences: Set<ButtonInfluence>;
  constructor() {
    this.influences = new Set();
  }
  addInfluence(info: ButtonInfluence): this {
    this.influences.add(info);
    return this;
  }
  test(input: GameInput): boolean {
    for (let inf of this.influences) {
      if (inf.keys) {
        for (let key of inf.keys) {
          if (input.raw.getKeyboardButton(key)) return true;
        }
      }
      if (inf.gpButtons) {
        for (let btn of inf.gpButtons) {
          if (input.gamePadManager.getButton(btn, inf.gamepad)) return true;
        }
      }
      if (inf.mouseButtons) {
        for (let btn of inf.mouseButtons) {
          if (input.raw.getPointerButton(btn)) return true;
        }
      }

      //I admit this is a weird way to do a button
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
          current = input.gamePadManager.getAxis(axis, inf.gamepad);
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
  private influences: Set<AxisInfluence>;
  constructor() {
    this.influences = new Set();
  }
  addInfluence(info: AxisInfluence): this {
    this.influences.add(info);
    return this;
  }
  test(input: GameInput): number {
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
        if (largest !== 0) return largest;
      }
      if (inf.gpButtons) {
        for (let btn of inf.gpButtons) {
          if (input.gamePadManager.getButton(btn, inf.gamepad)) {
            return inf.value;
          }
        }
      }
      if (inf.gpAxes) {
        let largest = 0;
        let current = 0;
        for (let axis of inf.gpAxes) {
          current = input.gamePadManager.getAxis(axis, inf.gamepad);
          if (Math.abs(current) > Math.abs(largest)) {
            largest = current;
          }
        }
        if (largest !== 0) return largest;
      }
    }
    return 0;
  }
}

export class GameInput {
  static SINGLETON: GameInput;
  raw: Input;
  gamePadManager: GamePadManager;

  private axes: Map<string, Axis>;
  private buttons: Map<string, Button>;
  builtinMovementConsumer: MovementConsumer;

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
  static get(): GameInput {
    if (!GameInput.SINGLETON) {
      new GameInput();
    }
    return GameInput.SINGLETON;
  }

  /**Checks if a axis name is already in use
   * @param name the unique name of the axis
   */
  hasAxis(name: string): boolean {
    return this.axes.has(name);
  }
  /**Create an axis to track
   * 
   * You can assign any input to an axis, including keyboard, mouse, gamepad, and UI
   * @param name a unique name for the axis
   */
  createAxis(name: string): Axis {
    if (this.hasAxis(name)) throw `Already have an axis by name of "${name}" !`;
    const result = new Axis();
    this.axes.set(name, result);
    return result;
  }
  getAxis(name: string): Axis {
    return this.axes.get(name);
  }
  /**Get the current value of an axis input
   * @param name the unique name of the axis input
   */
  getAxisValue(name: string): number {
    return this.getAxis(name).test(this);
  }
  deleteAxis(name: string): this {
    this.axes.delete(name);
    return this;
  }

  hasButton(name: string): boolean {
    return this.buttons.has(name);
  }
  createButton(name: string): Button {
    if (this.hasButton(name)) throw `Button name "${name}" already in use`;
    const result = new Button();
    this.buttons.set(name, result);
    return result;
  }
  getButton(name: string): Button {
    return this.buttons.get(name);
  }
  getButtonValue(name: string): boolean {
    return this.getButton(name).test(this);
  }
  deleteButton(name: string): this {
    this.buttons.delete(name);
    return this;
  }
  getGamePadManager(): GamePadManager {
    return this.gamePadManager;
  }
}
