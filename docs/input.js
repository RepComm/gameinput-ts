/**Listen to events on an element*/
export const on = (elem, type, callback, options = undefined) => {
  if (!elem) throw "No element supplied";
  elem.addEventListener(type, callback, options);
};
/**Stop listen to events on an element*/

export const off = (elem, type, callback) => {
  if (!elem) throw "No element supplied";
  elem.removeEventListener(type, callback);
};
export class MovementConsumer {
  //TODO - possibly add mouse wheel here?
  constructor() {
    this.deltaX = 0;
    this.deltaY = 0;
  }

  setDelta(x, y) {
    this.deltaX = x;
    this.deltaY = y;
    return this;
  }

  addDelta(x, y) {
    this.setDelta(x + this.deltaX, y + this.deltaY);
    return this;
  }

  getDeltaX() {
    let result = this.deltaX;
    this.deltaX = 0;
    return result;
  }

  getDeltaY() {
    let result = this.deltaY;
    this.deltaY = 0;
    return result;
  }

}
export class Input {
  constructor() {
    this.mouseButtons = new Map();
    this.pointerX = 0;
    this.pointerY = 0;
    this.keyboard = new Map();
    this.movementConsumers = new Set();

    this.onMouseMove = evt => {
      if (evt.buttons > 0) {
        this.setPointerButton(evt.button);
      }

      this.setPointerPosition(evt.clientX, evt.clientY);
      this.setPointerMovement(evt.movementX, evt.movementY);
    };

    this.onTouchMove = evt => {
      let item = evt.changedTouches.item(0);
      this.setPointerButton(0);
      this.setPointerPosition(item.clientX, item.clientY);
    };

    this.onMouseDown = evt => {
      // evt.preventDefault();
      this.setPointerPosition(evt.clientX, evt.clientY);
      this.setPointerButton(evt.button);
    };

    this.onTouchStart = evt => {
      let item = evt.changedTouches.item(0);
      this.setPointerPosition(item.clientX, item.clientY);
      this.setPointerButton(0);
    };

    this.onMouseUp = evt => {
      this.setPointerPosition(evt.clientX, evt.clientY);
      this.setPointerButton(evt.button, false);
    };

    this.onTouchEnd = evt => {
      this.setPointerButton(0, false);
      let item = evt.changedTouches.item(0);
      this.setPointerPosition(item.clientX, item.clientY);
    };

    this.onTouchCancel = evt => {
      this.setPointerButton(0, true);
      let item = evt.changedTouches.item(0);
      this.setPointerPosition(item.clientX, item.clientY);
    };

    this.onKeyDown = evt => {
      this.keyboard.set(evt.key, true);
    };

    this.onKeyUp = evt => {
      this.keyboard.set(evt.key, false);
    };

    this.onContextMenu = evt => {// evt.preventDefault();
    };
  }

  getMovementConsumer() {
    let result = new MovementConsumer();
    this.movementConsumers.add(result);
    return result;
  }

  setPointerButton(button, value = true) {
    this.mouseButtons.set(button, value);
    return this;
  }

  getPointerButton(button) {
    return this.mouseButtons.get(button) == true;
  }

  setPointerMovement(x, y) {
    for (let consumer of this.movementConsumers) {
      consumer.addDelta(x, y);
    }
  }

  setPointerPosition(x, y) {
    this.pointerX = x;
    this.pointerY = y;
  }

  getPointerX() {
    return this.pointerX;
  }

  getPointerY() {
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

  pointerIsLocked() {
    return document.pointerLockElement != undefined && document.pointerLockElement != null;
  }

  pointerTryLock(canvas) {
    canvas.requestPointerLock();
  }

  pointerUnlock() {
    document.exitPointerLock();
  }

  getKeyboardButton(key) {
    return this.keyboard.get(key) === true;
  }

}