import { Input, MovementConsumer } from "./input.js";
export declare class GamePadManager {
    static SINGLETON: GamePadManager;
    private allGamepads;
    onGamePadConnected: (evt: GamepadEvent) => void;
    onGamePadDisconnected: (evt: any) => void;
    /**Store this variable to reduce memory spam*/
    private getGamepadTemp;
    constructor();
    static get(): GamePadManager;
    registerEvents(): void;
    unregisterEvents(): void;
    nativeGetAllGamepads(): Array<Gamepad>;
    /**Returns true when this is at least one connected gamepad*/
    hasGamepads(): boolean;
    /**Get a gamepad
     *
     * When an index is undefined, or negative, the first non-falsy gamepad is returned
     *
     * If no gamepads available, return will be falsy (undefined)
     *
     * @param index
     */
    getGamepad(index?: number): Gamepad;
    /**Get a gamepad button
     *
     * If index is not specified, the first available gamepad will be used
     *
     * If no gamepads available, result will be false
     *
     * @param btn
     * @param index
     */
    getButton(btn: number, index?: number): boolean;
    /**Get a gamepad axis
     *
     * If no index is specified, the first available gamepad will be used
     *
     * If no gamepads available, return will be 0.0
     *
     * @param axis
     * @param index
     */
    getAxis(axis: number, index?: number): number;
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
    gpIndex?: number;
    /**Apply specific mouse buttons*/
    mouseButtons?: Array<number>;
    /**Apply specific mouse axes*/
    mouseAxes?: Array<number>;
}
export interface AxisInfluence extends ButtonInfluence {
    /**The value to apply when triggered by a button type*/
    value: number;
    /**Gamepad axes will scale their value by this, default is 1*/
    gpAxisScale?: number;
    /**Mouse axes will scale their value by this, default is 1*/
    pointerAxisScale?: number;
}
export interface ButtonJson {
    id: string;
    influences?: ButtonInfluence[];
}
export declare class Button {
    private influences;
    constructor();
    addInfluence(info: ButtonInfluence): this;
    removeInfluence(info: ButtonInfluence): this;
    hasInfluence(info: ButtonInfluence): boolean;
    getInfluences(): Array<ButtonInfluence>;
    test(input: GameInput): boolean;
}
export interface AxisJson extends ButtonJson {
    influences: AxisInfluence[];
}
export declare class Axis {
    private influences;
    constructor();
    addInfluence(info: AxisInfluence): this;
    removeInfluence(info: AxisInfluence): this;
    hasInfluence(info: AxisInfluence): boolean;
    getInfluences(): Array<AxisInfluence>;
    test(input: GameInput): number;
}
export interface GameInputJson {
    /**User friendly name for the layout*/
    name?: string;
    /**Define all the buttons*/
    buttons?: ButtonJson[];
    /**Define all the axes*/
    axes?: AxisJson[];
}
export declare class GameInput {
    static SINGLETON: GameInput;
    raw: Input;
    gamePadManager: GamePadManager;
    private axes;
    private buttons;
    builtinMovementConsumer: MovementConsumer;
    constructor();
    /**Returns the singleton GameInput
     */
    static get(): GameInput;
    /**Get a list of all known axes id's at current time*/
    getAxes(): Array<string>;
    /**Get a list of all known button id's at current time*/
    getButtons(): Array<string>;
    /**Checks if a axis name is already in use
     * @param name the unique name of the axis
     */
    hasAxis(name: string): boolean;
    /**Create an axis to track
     *
     * You can assign any input to an axis, including keyboard, mouse, gamepad, and UI
     * @param name a unique name for the axis
     */
    private createAxis;
    getAxis(name: string): Axis;
    /**Get the current value of an axis input
     * @param name the unique name of the axis input
     */
    getAxisValue(name: string): number;
    deleteAxis(name: string): this;
    hasButton(name: string): boolean;
    private createButton;
    getButton(name: string): Button;
    getButtonValue(name: string): boolean;
    deleteButton(name: string): this;
    getGamePadManager(): GamePadManager;
    getOrCreateButton(name: string): Button;
    getOrCreateAxis(name: string): Axis;
    /**Create all the buttons and axes you want with JSON!*/
    addJsonConfig(config: GameInputJson): this;
}
