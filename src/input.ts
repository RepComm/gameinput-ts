
/**Listen to events on an element*/
export const on = (elem: HTMLElement | Window, type: string, callback: EventListener | any, options: any | undefined = undefined) => {
  if (!elem) throw "No element supplied";
  elem.addEventListener(type, callback, options);
}

/**Stop listen to events on an element*/
export const off = (elem: HTMLElement | Window, type: string, callback: EventListener | any) => {
  if (!elem) throw "No element supplied";
  elem.removeEventListener(type, callback);
}

export class MovementConsumer {
  private deltaX: number;
  private deltaY: number;
  //TODO - possibly add mouse wheel here?

  constructor() {
    this.deltaX = 0;
    this.deltaY = 0;
  }
  setDelta(x: number, y: number): this {
    this.deltaX = x;
    this.deltaY = y;
    return this;
  }
  addDelta(x: number, y: number): this {
    this.setDelta(x + this.deltaX, y + this.deltaY);
    return this;
  }
  getDeltaX(): number {
    let result = this.deltaX;
    this.deltaX = 0;
    return result;
  }
  getDeltaY(): number {
    let result = this.deltaY;
    this.deltaY = 0;
    return result;
  }
}

export class Input {
  private mouseButtons: Map<number, boolean>;
  private movementConsumers: Set<MovementConsumer>;
  private keyboard: Map<string, boolean>;
  private pointerX: number;
  private pointerY: number;

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

  constructor() {
    this.mouseButtons = new Map();
    this.pointerX = 0;
    this.pointerY = 0;

    this.keyboard = new Map<string, boolean>();
    this.movementConsumers = new Set();

    this.onMouseMove = (evt) => {
      if (evt.buttons > 0) {
        this.setPointerButton(evt.button);
      }
      this.setPointerPosition(evt.clientX, evt.clientY);
      this.setPointerMovement(evt.movementX, evt.movementY);
    };
    this.onTouchMove = (evt: TouchEvent) => {
      let item = evt.changedTouches.item(0);
      this.setPointerButton(0);
      this.setPointerPosition(item.clientX, item.clientY);
    };
    this.onMouseDown = (evt: MouseEvent) => {
      // evt.preventDefault();
      this.setPointerPosition(evt.clientX, evt.clientY);

      this.setPointerButton(evt.button);
    }
    this.onTouchStart = (evt: TouchEvent) => {
      let item = evt.changedTouches.item(0);
      this.setPointerPosition(item.clientX, item.clientY);
      this.setPointerButton(0);
    }
    this.onMouseUp = (evt: MouseEvent) => {
      this.setPointerPosition(evt.clientX, evt.clientY);
      this.setPointerButton(evt.button, false);
    }
    this.onTouchEnd = (evt: TouchEvent) => {
      this.setPointerButton(0, false);
      let item = evt.changedTouches.item(0);
      this.setPointerPosition(item.clientX, item.clientY);
    }
    this.onTouchCancel = (evt: TouchEvent) => {
      this.setPointerButton(0, true);
      let item = evt.changedTouches.item(0);
      this.setPointerPosition(item.clientX, item.clientY);
    }
    this.onKeyDown = (evt) => {
      this.keyboard.set(evt.key, true);
    }
    this.onKeyUp = (evt: KeyboardEvent) => {
      this.keyboard.set(evt.key, false);
    }
    this.onContextMenu = (evt: Event) => {
      // evt.preventDefault();
    }
  }
  getMovementConsumer(): MovementConsumer {
    let result = new MovementConsumer();
    this.movementConsumers.add(result);
    return result;
  }
  setPointerButton(button: number, value: boolean = true): this {
    this.mouseButtons.set(button, value);
    return this;
  }
  getPointerButton(button: number): boolean {
    return this.mouseButtons.get(button) == true;
  }
  setPointerMovement(x: number, y: number) {
    for (let consumer of this.movementConsumers) {
      consumer.addDelta(x, y);
    }
  }
  setPointerPosition(x: number, y: number) {
    this.pointerX = x;
    this.pointerY = y;
  }
  getPointerX(): number {
    return this.pointerX;
  }
  getPointerY(): number {
    return this.pointerY;
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
  pointerIsLocked(): boolean {
    return (document.pointerLockElement != undefined && document.pointerLockElement != null);
  }
  pointerTryLock(canvas: HTMLCanvasElement) {
    canvas.requestPointerLock();
  }
  pointerUnlock() {
    document.exitPointerLock();
  }
  getKeyboardButton(key: string): boolean {
    return this.keyboard.get(key) === true;
  }
}
