
import { Input, on, off } from "./input.js";

/**Defines a single input mapping (button as in <gameinput>.getButton)
 */
export interface InputBindingJson {
  /**keyboard keys
   * see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
   */
  keys: string[];
  /**Touch rectangles*/
  rects: TouchRectJson[];
  /**Gamepad buttons*/
  gpBtns: number[];
  /**Gamepad axis rules*/
  gpAxes: AxisRuleJson[];
}

/**A collection of InputBindingJson*/
export interface InputBindingsJson {
  [key: string]: InputBindingJson;
}

/**A single input mapping (button as in <gameinput>.getButton)
 */
export class InputBinding {
  private keys: Set<string>;
  private rects: Set<TouchRect>;
  private gpBtns: Set<number>;
  private gpAxes: Set<AxisRule>;
  constructor() {
    this.keys = new Set<string>();
    this.rects = new Set<TouchRect>();
    this.gpBtns = new Set<number>();
    this.gpAxes = new Set<AxisRule>();
  }
  setKeys(...keys: string[]): InputBinding {
    if (keys.length < 1) throw "Use at least one key";
    this.keys.clear();
    this.addKeys(...keys);
    return this;
  }
  addKeys(...keys: string[]): InputBinding {
    for (let k of keys) {
      this.addKey(k);
    }
    return this;
  }
  addKey(key: string): InputBinding {
    if (typeof (key) !== "string") throw `Key must be type of string, got ${typeof (key)}`;
    if (this.keys.has(key)) throw `Cannot add keyboard key ${key} twice!`;
    this.keys.add(key);
    return this;
  }
  addRect(r: TouchRect): InputBinding {
    if (!(r instanceof TouchRect)) throw `${r} not an instance of TouchRect`;
    if (this.rects.has(r)) throw "Cannot add TouchRect twice!";
    this.rects.add(r);
    return this;
  }
  addPadButton(btn: number): InputBinding {
    if (typeof (btn) !== "number") throw `${btn} not a number: is ${typeof (btn)}`;
    if (this.gpBtns.has(btn)) throw `Cannot add gamepad button ${btn} twice!`;
    this.gpBtns.add(btn);
    return this;
  }
  addPadButtons(...btns: number[]): InputBinding {
    for (let btn of btns) {
      this.addPadButton(btn);
    }
    return this;
  }
  addPadAxisRule(rule: AxisRule): InputBinding {
    if (!(rule instanceof AxisRule)) {
      throw `${rule} not instanceof AxisRule`;
    }
    if (this.gpAxes.has(rule)) throw "Cannot add axis rule twice";
    this.gpAxes.add(rule);
    return this;
  }
  createPadAxisRule(axisId: number, rule: number, compareValue: number): AxisRule {
    let result = new AxisRule()
      .setAxisId(axisId)
      .setCompareRule(rule)
      .setCompareValue(compareValue);
    this.addPadAxisRule(result);
    return result;
  }
  test(input: GameInput): boolean {
    //Test keyboard (quick when no keys have been pressed)
    for (let k of this.keys) {
      // if (input.raw.keyboard.get(k)) return true;
      if (input.raw.getKey(k)) return true;
    }
    //console.log("Gamepad found");
    //Test all the gamepad buttons assigned
    for (let gpBtn of this.gpBtns) {
      if (input.getGamePadManager().getPrimaryButton(gpBtn)) {
        return true;
      }
    }
    if (input.getGamePadManager().ensure()) {
      //Test all the gamepad axis rules
      for (let rule of this.gpAxes) {
        let gp = input.getGamePadManager().getPrimary();
        if (rule.test(gp)) {
          // if (gp.vibrationActuator) {
          //   gp.vibrationActuator.playEffect("dual-rumble", {
          //     startDelay: 0,
          //     duration: parseInt(30 * Math.random()),
          //     weakMagnitude: Math.random(),
          //     strongMagnitude: Math.random()
          //   })
          // }
          return true;
        }
      }
    } else {
      //console.log("No gamepad found");
    }

    //Check touch rectangles
    if (!input.pointerPrimary) return false;
    for (let r of this.rects) {
      if (r.pointInside(input.pointerNormalizedX, input.pointerNormalizedY)) return true;
    }
    return false;
  }
  toJson(): InputBindingJson {
    let keys: string[] = new Array(this.keys.size);
    let i: number = 0;
    this.keys.forEach((key) => {
      keys[i] = key;
      i++;
    });

    let rects: any[] = new Array(this.rects.size);
    i = 0;
    this.rects.forEach((rect) => {
      rects[i] = rect.toJson();
      i++;
    });

    let gpBtns: number[] = new Array(this.gpBtns.size);
    i = 0;
    this.gpBtns.forEach((btn) => {
      gpBtns[i] = btn;
      i++;
    });

    let gpAxes: any[] = new Array(this.gpAxes.size);
    i = 0;
    this.gpAxes.forEach((rule) => {
      gpAxes[i] = rule.toJson();
      i++;
    });

    return {
      keys: keys,
      rects: rects,
      gpBtns: gpBtns,
      gpAxes: gpAxes
    }
  }
  static fromJson(def: InputBindingJson): InputBinding {
    let result = new InputBinding();
    result.addKeys(...def.keys);
    result.addPadButtons(...def.gpBtns);

    def.gpAxes.forEach((json) => {
      result.createPadAxisRule(json.axisId, json.rule, json.compareValue);
    });

    def.rects.forEach((json) => {
      let rect = new TouchRect(json.left, json.top, json.width, json.height);
      result.addRect(rect);
    });
    return result;
  }
}

export class GamePadManager {
  static SINGLETON: GamePadManager;
  primary: Gamepad | undefined;
  allGamePadsFix: Array<Gamepad>;

  onGamePadConnected: (evt: GamepadEvent) => void;
  onGamePadDisconnected: (evt) => void;
  constructor() {
    if (!GamePadManager.SINGLETON) {
      GamePadManager.SINGLETON = this;
    } else {
      throw "GamePadManager should not be instantiated more than once";
    }
    this.primary = undefined;

    this.allGamePadsFix = new Array();

    this.onGamePadConnected = (evt) => {
      if (evt.gamepad !== null) {
        this.allGamePadsFix.push(evt.gamepad);
        console.log("Added gamepad", evt.gamepad);
      } else {
        console.log("Couldn't add null gamepad");
      }
    }
    this.onGamePadDisconnected = (evt) => {
      let ind = this.allGamePadsFix.indexOf(evt.gamepad);
      if (ind === -1) {
        console.warn("Cannot remove disconnected controller that was never added");
        return;
      }
      this.allGamePadsFix.splice(ind, 1);
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
    off(window, "gamepadconnected", this.onGamePadConnected);
    off(window, "gamepaddisconnected", this.onGamePadDisconnected);
  }
  nativeGetAllGamepads(): Array<Gamepad> {
    return navigator.getGamepads();
  }
  findGamepad(): Gamepad | undefined {
    let gps = this.nativeGetAllGamepads();
    for (let gp of gps) {
      if (gp && gp.connected) {
        return gp;
      }
    }
    return undefined;
  }
  /**Tries to populate the primary controller
   * Returns success or not
   */
  ensure() {
    if (!this.primary || !this.primary.connected) {
      this.primary = this.findGamepad();
      if (this.primary === undefined) {
        //console.warn("Couldn't find any valid game pads in navigator..");
        return false;
      }
      return true;
    }
    return true;
  }
  getPrimary(): Gamepad {
    return this.primary;
  }
  getPrimaryButton(btn: number): boolean {
    if (this.ensure()) {
      return this.getPrimary().buttons[btn].pressed;
    }
    return false;
  }
}

/**
 * 
 */
export interface RendererInterface {
  rect: { width: number, height: number };
  center: { x: number, y: number };
  zoom?: number;
}

/**Defines an axis rule to activate a button/input mapping
 */
export interface AxisRuleJson {
  axisId: number,
  rule: number,
  compareValue: number
}

/**An axis rule to activate a button/input mapping
 */
export class AxisRule {
  static GREATER_THAN;
  static LESS_THAN;

  axisId: number;
  rule: number;
  compareValue: number;

  constructor() {
    this.axisId = 0;
    this.rule = AxisRule.GREATER_THAN;
    this.compareValue = 0.5;
  }
  setAxisId(id: number): AxisRule {
    this.axisId = id;
    return this;
  }
  getAxisId(): number {
    return this.axisId;
  }
  setCompareValue(v: number): AxisRule {
    this.compareValue = v;
    return this;
  }
  getCompareValue(): number {
    return this.compareValue;
  }
  setCompareRule(rule: number): AxisRule {
    if (typeof (rule) !== "number") throw `Rule ${rule} not a number`;
    this.rule = rule;
    return this;
  }
  getCompareRule(): number {
    return this.rule;
  }
  test(gp: Gamepad): boolean {
    let ax = gp.axes[this.axisId];
    if (this.rule === AxisRule.GREATER_THAN) {
      return (ax > this.compareValue);
    } else if (this.rule === AxisRule.LESS_THAN) {
      return (ax < this.compareValue);
    }
  }
  toJson(): AxisRuleJson {
    return {
      axisId: this.axisId,
      rule: this.rule,
      compareValue: this.compareValue
    };
  }
}
AxisRule.GREATER_THAN = 0;
AxisRule.LESS_THAN = 1;

/**Defines a touch rectangle that activates a button/input mapping
 */
export interface TouchRectJson {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**A touch rectangle that activates a button/input mapping
 */
export class TouchRect {
  top: number;
  left: number;
  width: number;
  height: number;
  constructor(left = 0, top = 0, width = 1, height = 1) {
    if (typeof (top) !== "number") throw "top must be a number";
    if (typeof (left) !== "number") throw "left must be a number";
    if (typeof (width) !== "number") throw "width must be a number";
    if (typeof (height) !== "number") throw "height must be a number";
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
  }
  setPosition(top: number, left: number): TouchRect {
    this.top = top;
    this.left = left;
    return this;
  }
  setSize(width: number, height: number): TouchRect {
    this.width = width;
    this.height = height;
    return this;
  }
  pointInside(nx: number, ny: number): boolean {
    return (
      nx > this.left &&
      nx < this.left + this.width &&
      ny > this.top &&
      ny < this.top + this.height
    );
  }
  toJson(): TouchRectJson {
    return {
      top: this.top,
      left: this.left,
      width: this.width,
      height: this.height
    };
  }
}

export class GameInput {
  static SINGLETON: GameInput;
  raw: Input;
  private inputBindings: Map<string, InputBinding>;
  renderer: RendererInterface;
  gamePadManager: GamePadManager;

  constructor() {
    if (!GameInput.SINGLETON) {
      GameInput.SINGLETON = this;
    } else {
      throw "GameInput should not be instantiated more than once";
    }
    this.raw = new Input();
    this.raw.registerEvents();

    this.inputBindings = new Map();

    this.renderer = undefined;
    this.gamePadManager = GamePadManager.get();
  }

  /**Necessary for using pointer coordinates that are relative to a defined area
   * @param renderer
   */
  setRenderer(renderer: RendererInterface) {
    this.renderer = renderer;
  }
  /**Returns the singleton GameInput
   */
  static get(): GameInput {
    if (!GameInput.SINGLETON) {
      new GameInput();
    }
    return GameInput.SINGLETON;
  }
  /**See addBinding
   * Does not check if name exists already, will overwrite
   * @param name 
   * @param binding 
   */
  setBinding(name: string, binding: InputBinding): this {
    this.inputBindings.set(name, binding);
    return this;
  }
  /**Tries to add a binding, checking to see if one by the same name exists first
   * throws if same name already exists
   * @param name 
   * @param binding 
   */
  addBinding(name: string, binding: InputBinding): this {
    if (this.inputBindings.has(name)) throw `Cannot add ${name} as it is in use already`;
    this.setBinding(name, binding);
    return this;
  }
  /**Creates a binding and returns it
   * Handy for chaining commands
   * @param name 
   */
  createBinding(name: string): InputBinding {
    let result = new InputBinding();
    this.addBinding(name, result);
    return result;
  }
  hasBinding(name: string): boolean {
    return this.inputBindings.has(name);
  }
  getBinding(name: string): InputBinding {
    if (!this.hasBinding(name)) throw `No binding found for ${name}`;
    return this.inputBindings.get(name);
  }
  /**Returns true if the given input binding found
   * one of its inputs activated
   * @param name 
   */
  getButton(name: string): boolean {
    return this.getBinding(name).test(this);
  }
  /**Static version, no functionality change, see <gameinput>.getButton
   * @param name 
   */
  static getButton(name: string): boolean {
    return GameInput.SINGLETON.getButton(name);
  }
  /**Raw screen x
   */
  get pointerScreenX(): number {
    return this.raw.pointer.x;
  }
  /**Raw screen x
   */
  static get pointerScreenX(): number {
    return GameInput.SINGLETON.pointerScreenX;
  }
  /**Raw screen y
   */
  get pointerScreenY(): number {
    return this.raw.pointer.y;
  }
  /**Raw screen y
   */
  static get pointerScreenY(): number {
    return GameInput.SINGLETON.pointerScreenY;
  }
  /**Handy for 2d apps, subtracts the mapped RendererInterface (see <gameinput>.setRenderer) center coordinates
   */
  get pointerWorldX(): number {
    return this.pointerScreenCenteredX - this.renderer.center.x;
  }
  /**Handy for 2d apps, subtracts the mapped RendererInterface (see <gameinput>.setRenderer) center coordinates
   */
  static get pointerWorldX(): number {
    return GameInput.SINGLETON.pointerWorldX;
  }
  /**Handy for 2d apps, subtracts the mapped RendererInterface (see <gameinput>.setRenderer) center coordinates
   */
  get pointerWorldY(): number {
    return this.pointerScreenCenteredY - this.renderer.center.y;
  }
  /**Handy for 2d apps, subtracts the mapped RendererInterface (see <gameinput>.setRenderer) center coordinates
   */
  static get pointerWorldY(): number {
    return GameInput.SINGLETON.pointerWorldY;
  }
  /**Handy for 2d apps
   * Coordinates centered on the RendererInterface (see <gameinput>.setRenderer)
   * adjusted for zoom if present
   */
  get pointerScreenCenteredX(): number {
    return (this.pointerScreenX - (this.renderer.rect.width / 2)) / (this.renderer.zoom || 1);
  }
  /**Handy for 2d apps
   * Coordinates centered on the RendererInterface (see <gameinput>.setRenderer)
   * adjusted for zoom if present
   */
  static get pointerScreenCenteredX(): number {
    return GameInput.SINGLETON.pointerScreenCenteredX;
  }
  /**Handy for 2d apps
   * Coordinates centered on the RendererInterface (see <gameinput>.setRenderer)
   * adjusted for zoom if present
   */
  get pointerScreenCenteredY(): number {
    return (this.pointerScreenY - (this.renderer.rect.height / 2)) / (this.renderer.zoom || 1);
  }
  /**Handy for 2d apps
   * Coordinates centered on the RendererInterface (see <gameinput>.setRenderer)
   * adjusted for zoom if present
   */
  static get pointerScreenCenteredY(): number {
    return GameInput.SINGLETON.pointerScreenCenteredY;
  }
  /**Primary mouse/touch
   * TODO - allow gamepad mapping to this
   */
  get pointerPrimary(): boolean {
    return this.raw.pointer.leftDown;
  }
  /**Primary mouse/touch
   */
  static get pointerPrimary(): boolean {
    return GameInput.SINGLETON.pointerPrimary;
  }
  /**Secondary mouse/touch
   * TODO - allow gamepad mapping to this
   */
  get pointerSecondary(): boolean {
    return this.raw.pointer.rightDown;
  }
  /**Secondary mouse/touch
   */
  static get pointerSecondary(): boolean {
    return GameInput.SINGLETON.pointerSecondary;
  }
  /**Normalized (mapped 0 thru 1) coordinates
   * See <gameinput>.setRenderer
   */
  get pointerNormalizedX(): number {
    return this.raw.pointer.x / this.renderer.rect.width;
  }
  /**Normalized (mapped 0 thru 1) coordinates
   * See <gameinput>.setRenderer
   */
  static get pointerNormalizedX(): number {
    return GameInput.SINGLETON.pointerNormalizedX;
  }
  /**Normalized (mapped 0 thru 1) coordinates
   * See <gameinput>.setRenderer
   */
  get pointerNormalizedY(): number {
    return this.raw.pointer.y / this.renderer.rect.height;
  }
  /**Normalized (mapped 0 thru 1) coordinates
   * See <gameinput>.setRenderer
   */
  static get pointerNormalizedY(): number {
    return GameInput.SINGLETON.pointerNormalizedY;
  }
  getGamePadManager(): GamePadManager {
    return this.gamePadManager;
  }
  /**Create a serializable representation of the current mappings
   * Recursively copies all axis, button, key mappings
   */
  bindingsToJson(): InputBindingsJson {
    let result = {};
    this.inputBindings.forEach((bind, name) => {
      result[name] = bind.toJson();
    });
    return result;
  }
  /**Import mappings from serialized json representation
   * @param defs 
   * @param overwrite 
   */
  addBindingsFromJson(defs: InputBindingsJson, overwrite: boolean = false): this {
    let keys = Object.keys(defs);
    for (let key of keys) {
      if (overwrite) {
        this.setBinding(key, InputBinding.fromJson(defs[key]));
      } else {
        this.addBinding(key, InputBinding.fromJson(defs[key]));
      }
    }
    console.log("Added", keys.length, "bindings");
    return this;
  }
}
