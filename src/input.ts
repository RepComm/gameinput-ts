
/**Listen to events on an element*/
export const on = (elem: HTMLElement|Window, type: string, callback: EventListener|any, options: any|undefined = undefined) => {
  if (!elem) throw "No element supplied";
  elem.addEventListener(type, callback, options);
}

/**Stop listen to events on an element*/
export const off = (elem: HTMLElement|Window, type: string, callback: EventListener) => {
  if (!elem) throw "No element supplied";
  elem.removeEventListener(type, callback);
}

export interface InputPointerState {
  x: number;
  y: number;
  lx: number;
  ly: number;
  leftDown: boolean;
  rightDown: boolean;
  locked: boolean;
  mx: number;
  my: number;
}

interface InputEventCallback {
  (type: string)
}

export class Input {
  pointer: InputPointerState;
  private keyboard: Map<string, boolean>;
  onMouseMove: (evt: MouseEvent) => void;
  onTouchMove: (evt: TouchEvent) => void;
  onMouseDown: (evt: MouseEvent) => void;
  onTouchStart: (evt: TouchEvent) => void;
  onMouseUp: (evt: MouseEvent) => void;
  onTouchEnd: (evt: TouchEvent) => void;
  onTouchCancel: (evt: TouchEvent) => void;
  onKeyDown: (evt) => void;
  onKeyUp: (evt: KeyboardEvent) => void;
  onContextMenu: (evt: Event) => void;
  private listeners: Set<InputEventCallback>;
  pointerLockElement: HTMLCanvasElement;
  pointerLockChange: (e: Event) => void;

  constructor() {
    this.pointer = {
      x: 0,
      y: 0,
      lx: 0,
      ly: 0,
      leftDown: false,
      rightDown: false,
      locked: false,
      mx: 0,
      my: 0
    };

    this.keyboard = new Map<string, boolean>();

    this.onMouseMove = (evt) => {
      if (evt.buttons > 0) {
        if (evt.button === 0) {
          this.pointer.leftDown = true;
        } else if (evt.button === 2) {
          this.pointer.rightDown = true;
        }
      }
      this.setPointerXY(evt.clientX, evt.clientY);
      this.setMovementXY(evt.movementX, evt.movementY);
      this.onEvent("pointer-move");
    };
    this.onTouchMove = (evt: TouchEvent) => {
      let item = evt.changedTouches.item(0);
      this.pointer.leftDown = true;
      this.setPointerXY(item.clientX, item.clientY);
      this.onEvent("pointer-move");
    };

    this.onMouseDown = (evt: MouseEvent) => {
      evt.preventDefault();
      this.setPointerXY(evt.clientX, evt.clientY);
      if (evt.button === 0) {
        this.pointer.leftDown = true;
      } else if (evt.button === 2) {
        this.pointer.rightDown = true;
      }
      this.onEvent("pointer-down");
    }
    this.onTouchStart = (evt: TouchEvent) => {
      this.pointer.leftDown = true;
      let item = evt.changedTouches.item(0);
      this.setPointerXY(item.clientX, item.clientY);
      this.onEvent("pointer-down");
    }
    this.onMouseUp = (evt: MouseEvent) => {
      this.setPointerXY(evt.clientX, evt.clientY);
      if (evt.button === 0) {
        this.pointer.leftDown = false;
      } else if (evt.button === 2) {
        this.pointer.rightDown = false;
      }
      this.onEvent("pointer-up");
    }
    this.onTouchEnd = (evt: TouchEvent) => {
      this.pointer.leftDown = false;
      let item = evt.changedTouches.item(0);
      this.setPointerXY(item.clientX, item.clientY);
      this.onEvent("pointer-up");
    }
    this.onTouchCancel = (evt: TouchEvent) => {
      this.pointer.leftDown = false;
      let item = evt.changedTouches.item(0);
      this.setPointerXY(item.clientX, item.clientY);
      this.onEvent("pointer-up");
    }
    /**@param {KeyboardEvent} evt*/
    this.onKeyDown = (evt) => {
      this.keyboard.set(evt.key, true);
      this.onEvent("key-down");
    }
    this.onKeyUp = (evt: KeyboardEvent) => {
      this.keyboard.set(evt.key, false);
      this.onEvent("key-up");
    }
    this.onContextMenu = (evt: Event) => {
      evt.preventDefault();
    }
    this.listeners = new Set<InputEventCallback>();

    this.pointerLockChange = (e: Event) => {
      this.pointer.locked = document.pointerLockElement !== null;
    }
  }
  setMovementXY(x: number, y: number) {
    this.pointer.mx = x;
    this.pointer.my = y;
  }
  consumeMovementX(): number {
    let result = this.pointer.mx;
    this.pointer.mx = 0;
    return result;
  }
  consumeMovementY(): number {
    let result = this.pointer.my;
    this.pointer.my = 0;
    return result;
  }
  setPointerXY(x: number, y: number) {
    this.pointer.lx = this.pointer.x;
    this.pointer.ly = this.pointer.y;
    this.pointer.x = x;
    this.pointer.y = y;
  }
  listen(cb: InputEventCallback) {
    if (!cb) throw "Callback cannot be " + cb;
    if (this.listeners.has(cb)) throw "Cannot add same listener twice";
    this.listeners.add(cb);
  }
  deafen(cb: InputEventCallback): boolean {
    if (!this.listeners.has(cb)) return false;
    this.listeners.delete(cb);
    return true;
  }
  unregisterEvents() {
    off(window, "mousemove", this.onMouseMove);
    off(window, "touchmove", this.onTouchMove);

    off(window, "mousedown", this.onMouseDown);
    off(window, "touchstart", this.onTouchStart);

    off(window, "mouseup", this.onMouseUp);
    off(window, "touchend", this.onTouchEnd);
    off(window, "touchcancel", this.onTouchCancel);

    off(window, "keyup", this.onKeyUp);
    off(window, "keydown", this.onKeyDown);
    off(window, "contextmenu", this.onContextMenu);
  }
  registerEvents() {
    on(window, "mousemove", this.onMouseMove);
    on(window, "touchmove", this.onTouchMove);

    on(window, "mousedown", this.onMouseDown);
    on(window, "touchstart", this.onTouchStart);

    on(window, "mouseup", this.onMouseUp);
    on(window, "touchend", this.onTouchEnd);
    on(window, "touchcancel", this.onTouchCancel);

    on(window, "keyup", this.onKeyUp);
    on(window, "keydown", this.onKeyDown);
    on(window, "contextmenu", this.onContextMenu);
  }
  onEvent(type: "key-up"|"key-down"|"pointer-up"|"pointer-down"|"pointer-move") {
    for (let l of this.listeners) {
      l(type);
    }
  }
  tryLock(canvas: HTMLCanvasElement) {
    this.pointerLockElement = canvas;
    document.addEventListener("pointerlockchange", (e) => this.pointerLockChange(e));
    this.pointerLockElement.requestPointerLock();
  }
  unlock() {
    document.exitPointerLock();
  }
  getKey (key: string): boolean {
    return this.keyboard.get(key) || false;
  }
}
