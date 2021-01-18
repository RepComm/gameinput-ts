
import { Input, on, off } from "./input.js";

export class GamePadManager {
  static SINGLETON: GamePadManager;
  private allGamepads: Array<Gamepad>;

  onGamePadConnected: (evt: GamepadEvent) => void;
  onGamePadDisconnected: (evt) => void;
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
  /**Get a gamepad
   * 
   * When an index is undefined, or negative, the first non-falsy gamepad is returned
   * 
   * @param index 
   */
  getGamepad (index: number = undefined): Gamepad {
    if (!index || index < 0) {
      for (let gp of this.allGamepads) {
        if (gp && gp.connected) return gp;
      }
    } else {
      return this.allGamepads[index];
    }
  }
  getButton (btn: number, index: number = -1): boolean {
    return this.getGamepad(index).buttons[btn].pressed;
  }
  getAxis (axis: number, index: number = -1): number {
    return this.getGamepad(index).axes[axis];
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
  protected influences: Set<ButtonInfluence>;
  constructor () {
    this.influences = new Set();
  }
  addInfluence (info: AxisInfluence): this {
    this.influences.add(info);
    return this;
  }
  test (input: GameInput): boolean {
    for (let inf of this.influences) {
      for (let key of inf.keys) {
        if (input.raw.getKey(key)) return true;
      }

      // inf.gamepad
      for (let btn of inf.gpButtons) {
        if (input.gamePadManager.getButton(btn, inf.gamepad)) return true;
      }
      // for (let btn of inf.mouseButtons) {
      //   // if (input.raw.pointer.)
      //   //TODO - implement multiple buttons
      // }

      //TODO - implement axis rules
      // inf.gpAxes
      // inf.gamepad

      //TODO - implement axis rules
      // inf.mouseAxes
    }
    return false;
  }
}

export class Axis {
  protected influences: Set<AxisInfluence>;
  constructor () {
    this.influences = new Set();
  }
  addInfluence (info: AxisInfluence): this {
    this.influences.add(info);
    return this;
  }
  test (input: GameInput): number {
    for (let inf of this.influences) {
      for (let key of inf.keys) {
        if (input.raw.getKey(key)) {
          return inf.value;
        }
      }
      for (let btn of inf.gpButtons) {
        if (input.gamePadManager.getButton(btn, inf.gamepad)) {
          return inf.value;
        }
      }
      let largest = 0;
      let current = 0;
      for (let axis of inf.gpAxes) {
        current = input.gamePadManager.getAxis(axis, inf.gamepad);
        if (Math.abs(current) > Math.abs(largest)) {
          largest = current;
        }
      }

      return current;
    }
  }
}

export class GameInput {
  static SINGLETON: GameInput;
  raw: Input;
  gamePadManager: GamePadManager;

  protected axes: Map<string, Axis>;
  protected buttons: Map<string, Button>;

  constructor() {
    if (!GameInput.SINGLETON) {
      GameInput.SINGLETON = this;
    } else {
      throw "GameInput should not be instantiated more than once";
    }
    this.raw = new Input();
    this.raw.registerEvents();

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
  hasAxis (name: string): boolean {
    return this.axes.has(name);
  }
  /**Create an axis to track
   * 
   * You can assign any input to an axis, including keyboard, mouse, gamepad, and UI
   * @param name a unique name for the axis
   */
  createAxis (name: string): Axis {
    if (this.hasAxis(name)) throw `Already have an axis by name of "${name}" !`;
    const result = new Axis();
    this.axes.set(name, result);
    return result;
  }
  getAxis (name: string): Axis {
    return this.axes.get(name);
  }
  /**Get the current value of an axis input
   * @param name the unique name of the axis input
   */
  getAxisValue (name: string): number {
    return this.getAxis(name).test(this);
  }
  deleteAxis (name: string): this {
    this.axes.delete(name);
    return this;
  }

  hasButton (name: string): boolean {
    return this.buttons.has(name);
  }
  createButton (name: string): Button {
    if (this.hasButton(name)) throw `Button name "${name}" already in use`;
    const result = new Button();
    this.buttons.set(name, result);
    return result;
  }
  getButton(name: string): Button {
    return this.buttons.get(name);
  }
  getButtonValue (name: string): boolean {
    return this.getButton(name).test(this);
  }
  deleteButton (name: string): this {
    this.buttons.delete(name);
    return this;
  }
  getGamePadManager(): GamePadManager {
    return this.gamePadManager;
  }
}
