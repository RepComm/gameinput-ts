/**Listen to events on an element*/
export declare const on: (elem: HTMLElement | Window, type: string, callback: EventListener | any, options?: any | undefined) => void;
/**Stop listen to events on an element*/
export declare const off: (elem: HTMLElement | Window, type: string, callback: EventListener | any) => void;
export declare class MovementConsumer {
    private deltaX;
    private deltaY;
    constructor();
    setDelta(x: number, y: number): this;
    addDelta(x: number, y: number): this;
    getDeltaX(): number;
    getDeltaY(): number;
}
export declare class Input {
    private mouseButtons;
    private movementConsumers;
    private keyboard;
    private pointerX;
    private pointerY;
    onMouseMove: (evt: MouseEvent) => void;
    onTouchMove: (evt: TouchEvent) => void;
    onMouseDown: (evt: MouseEvent) => void;
    onTouchStart: (evt: TouchEvent) => void;
    onMouseUp: (evt: MouseEvent) => void;
    onTouchEnd: (evt: TouchEvent) => void;
    onTouchCancel: (evt: TouchEvent) => void;
    onKeyDown: (evt: any) => void;
    onKeyUp: (evt: KeyboardEvent) => void;
    onContextMenu: (evt: Event) => void;
    constructor();
    getMovementConsumer(): MovementConsumer;
    setPointerButton(button: number, value?: boolean): this;
    getPointerButton(button: number): boolean;
    setPointerMovement(x: number, y: number): void;
    setPointerPosition(x: number, y: number): void;
    getPointerX(): number;
    getPointerY(): number;
    unregisterEvents(): void;
    registerEvents(): void;
    pointerIsLocked(): boolean;
    pointerTryLock(canvas: HTMLCanvasElement): void;
    pointerUnlock(): void;
    getKeyboardButton(key: string): boolean;
}
