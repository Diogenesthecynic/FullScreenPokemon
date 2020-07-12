import { IGameWindow, Inputs as EightBittrInputs } from "eightbittr";
import { IAliases, ITriggerContainer } from "inputwritr";

import { FullScreenPokemon } from "../FullScreenPokemon";

import { Direction } from "./Constants";
import { IItemSchema } from "./constants/Items";
import { ICharacter, IPlayer } from "./Things";

/**
 * User input filtering and handling.
 */
export class Inputs<TEightBittr extends FullScreenPokemon> extends EightBittrInputs<TEightBittr> {
    /**
     * Known, allowed aliases for input event triggers.
     */
    public readonly aliases: IAliases = {
        // Keyboard aliases
        left: [65, 37], // a, left
        right: [68, 39], // d, right
        up: [87, 38], // w, up
        down: [83, 40], // s, down
        a: [90, 13], // z, enter
        b: [88, 8], // x, backspace
        pause: [80, 27], // p, escape
        select: [17, 16], // ctrl, shift
        // Mouse aliases
        rightclick: [3],
    };

    /**
     * Mapping of events to their key codes, to their callbacks.
     */
    public readonly triggers: ITriggerContainer = {
        onkeydown: {
            left: (event: Event): void => this.keyDownLeft(this.game.players[0], event),
            right: (event: Event): void => this.keyDownRight(this.game.players[0], event),
            up: (event: Event): void => this.keyDownUp(this.game.players[0], event),
            down: (event: Event): void => this.keyDownDown(this.game.players[0], event),
            a: (event: Event): void => this.keyDownA(this.game.players[0], event),
            b: (event: Event): void => this.keyDownB(this.game.players[0], event),
            pause: (event: Event): void => this.keyDownPause(this.game.players[0], event),
            mute: (event: Event): void => {
                this.keyDownMute(this.game.players[0], event);
            },
            select: (event: Event): void => this.keyDownSelect(this.game.players[0], event),
        },
        onkeyup: {
            left: (event: Event): void => this.keyUpLeft(this.game.players[0], event),
            right: (event: Event): void => this.keyUpRight(this.game.players[0], event),
            up: (event: Event): void => this.keyUpUp(this.game.players[0], event),
            down: (event: Event): void => this.keyUpDown(this.game.players[0], event),
            a: (event: Event): void => this.keyUpA(this.game.players[0], event),
            b: (event: Event): void => this.keyUpB(this.game.players[0], event),
            pause: (event: Event): void => this.keyUpPause(this.game.players[0], event),
        },
        onmousedown: {
            rightclick: (event: Event): void => this.mouseDownRight(this.game.players[0], event),
        },
        oncontextmenu: {},
    };

    /**
     * Quickly tapping direction keys means to look in a direction, not walk.
     */
    public readonly inputTimeTolerance: number = 4;

    /**
     * Adds InputWritr pipes as global event listeners.
     */
    public initializeGlobalPipes(gameWindow: IGameWindow) {
        super.initializeGlobalPipes(gameWindow);

        gameWindow.addEventListener(
            "keydown",
            this.game.inputWriter.makePipe("onkeydown", "keyCode")
        );

        gameWindow.addEventListener(
            "keyup",
            this.game.inputWriter.makePipe("onkeyup", "keyCode")
        );

        gameWindow.addEventListener(
            "mousedown",
            this.game.inputWriter.makePipe("onmousedown", "which")
        );

        gameWindow.addEventListener(
            "contextmenu",
            this.game.inputWriter.makePipe("oncontextmenu", "", true)
        );
    }

    /**
     * Checks whether direction keys such as up may trigger for a Character.
     *
     * @param thing   A Character that wants to move.
     * @returns Whether direction keys may trigger.
     */
    public canDirectionsTrigger(thing: ICharacter): boolean {
        if (thing.following || thing.ledge) {
            return false;
        }

        if (this.game.frameTicker.getPaused()) {
            return false;
        }

        if (this.game.menuGrapher.getActiveMenu()) {
            return true;
        }

        return !this.game.mapScreener.blockInputs;
    }

    /**
     * Reacts to a Character simulating an up key press. If possible, this causes
     * walking in the up direction. The onKeyDownUp mod trigger is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyDownUp(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        if (!this.canDirectionsTrigger(thing)) {
            return;
        }

        if (thing.player) {
            (thing as IPlayer).keys[Direction.Top] = true;
        }

        this.game.timeHandler.addEvent(
            (): void => this.keyDownDirectionReal(thing as IPlayer, Direction.Top),
            this.inputTimeTolerance
        );

        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyDownUp);
    }

    /**
     * Reacts to a Character simulating a right key press. If possible, this causes
     * walking in the right direction. The onKeyDownRight mod trigger is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyDownRight(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        if (!this.canDirectionsTrigger(thing)) {
            return;
        }

        if (thing.player) {
            (thing as IPlayer).keys[Direction.Right] = true;
        }

        this.game.timeHandler.addEvent(
            (): void => this.keyDownDirectionReal(thing as IPlayer, Direction.Right),
            this.inputTimeTolerance
        );
    }

    /**
     * Reacts to a Character simulating a down key press. If possible, this causes
     * walking in the down direction. The onKeyDownDown mod trigger is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyDownDown(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        if (!this.canDirectionsTrigger(thing)) {
            return;
        }

        if (thing.player) {
            (thing as IPlayer).keys[Direction.Bottom] = true;
        }

        this.game.timeHandler.addEvent(
            (): void => this.keyDownDirectionReal(thing as IPlayer, Direction.Bottom),
            this.inputTimeTolerance
        );

        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyDownDown);
    }

    /**
     * Reacts to a Character simulating a left key press. If possible, this causes
     * walking in the left direction. The onKeyDownLeft mod trigger is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyDownLeft(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        if (!this.canDirectionsTrigger(thing)) {
            return;
        }

        if (thing.player) {
            (thing as IPlayer).keys[Direction.Left] = true;
        }

        this.game.timeHandler.addEvent(
            (): void => this.keyDownDirectionReal(thing as IPlayer, Direction.Left),
            this.inputTimeTolerance
        );

        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyDownLeft);
    }

    /**
     * Reacts to the A key being pressed. The MenuGraphr's active menu reacts to
     * the selection if it exists. The onKeyDownA mod event is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyDownA(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        if (this.game.frameTicker.getPaused()) {
            return;
        }

        if (this.game.menuGrapher.getActiveMenu()) {
            this.game.menuGrapher.registerA();
        } else if (thing.bordering[thing.direction]) {
            if (thing.bordering[thing.direction]!.activate) {
                thing.bordering[thing.direction]!.activate!.call(
                    this,
                    thing,
                    thing.bordering[thing.direction]
                );
            }

            if ((thing as IPlayer).keys) {
                (thing as IPlayer).keys.a = true;
            }
        }

        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyDownA);
    }

    /**
     * Reacts to the B key being pressed. The MenuGraphr's active menu reacts to
     * the deselection if it exists. The onKeyDownB mod event is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyDownB(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        if (this.game.frameTicker.getPaused()) {
            return;
        }

        if (this.game.menuGrapher.getActiveMenu()) {
            this.game.menuGrapher.registerB();
        } else if ((thing as IPlayer).keys) {
            (thing as IPlayer).keys.b = true;
        }

        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyDownB);
    }

    /**
     * Reacts to the pause key being pressed. The game is paused if it isn't
     * already. The onKeyDownPause mod event is fired.
     *
     * @param _thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyDownPause(_thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        this.game.menus.pause.toggle();
        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyDownPause);
    }

    /**
     * Reacts to the mute key being pressed. The game has mute toggled, and the
     * onKeyDownMute mod event is fired.
     *
     * @param _thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public async keyDownMute(_thing: ICharacter, event?: Event): Promise<void> {
        this.preventEventDefault(event);
        await this.game.audioPlayer.setMuted(this.game.audioPlayer.getMuted());
        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyDownMute);
    }

    /**
     * Reacts to the select key being pressed. Toggles the use of the registered item.
     *
     * @param thing   The triggering Player.
     * @param event   The original user-caused Event.
     * @todo Extend the use for any registered item, not just the bicycle.
     */
    public keyDownSelect(thing: IPlayer, event?: Event): void {
        this.preventEventDefault(event);
        if (this.game.menuGrapher.getActiveMenu() || thing.walking) {
            return;
        }

        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyDownSelect);

        const selectItem = this.game.itemsHolder.getItem(this.game.storage.names.selectItem);
        if (!selectItem) {
            return;
        }

        const itemSchema: IItemSchema = this.game.constants.items.byName[selectItem.join("")];
        if (!itemSchema.bagActivate) {
            throw new Error("Currently selected item does not have a .bagActivate.");
        }

        itemSchema.bagActivate.call(this, thing, itemSchema);
    }

    /**
     * Reacts to the left key being lifted. The onKeyUpLeft mod event is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyUpLeft(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyUpLeft);

        if (thing.player) {
            (thing as IPlayer).keys[Direction.Left] = false;
        }

        if (thing.nextDirection === Direction.Left) {
            thing.nextDirection = undefined;
            thing.wantsToWalk = false;
        } else if (thing.nextDirection === undefined) {
            thing.wantsToWalk = false;
        }
    }

    /**
     * Reacts to the right key being lifted. The onKeyUpRight mod event is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyUpRight(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyUpRight);

        if (thing.player) {
            (thing as IPlayer).keys[Direction.Right] = false;
        }

        if (thing.nextDirection === Direction.Right) {
            thing.nextDirection = undefined;
            thing.wantsToWalk = false;
        } else if (thing.nextDirection === undefined) {
            thing.wantsToWalk = false;
        }
    }

    /**
     * Reacts to the up key being lifted. The onKeyUpUp mod event is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyUpUp(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyUpUp);

        if (thing.player) {
            (thing as IPlayer).keys[0] = false;
        }

        if (thing.nextDirection === Direction.Top) {
            thing.nextDirection = undefined;
            thing.wantsToWalk = false;
        } else if (thing.nextDirection === undefined) {
            thing.wantsToWalk = false;
        }
    }

    /**
     * Reacts to the down key being lifted. The onKeyUpDown mod event is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyUpDown(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyUpDown);

        if (thing.player) {
            (thing as IPlayer).keys[2] = false;
        }

        if (thing.nextDirection === Direction.Bottom) {
            thing.nextDirection = undefined;
            thing.wantsToWalk = false;
        } else if (thing.nextDirection === undefined) {
            thing.wantsToWalk = false;
        }
    }

    /**
     * Reacts to the A key being lifted. The onKeyUpA mod event is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyUpA(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyUpA);

        if (thing.player) {
            (thing as IPlayer).keys.a = false;
        }
    }

    /**
     * Reacts to the B key being lifted. The onKeyUpB mod event is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyUpB(thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyUpB);

        if (thing.player) {
            (thing as IPlayer).keys.b = false;
        }
    }

    /**
     * Reacts to the pause key being lifted. The onKeyUpPause mod event is fired.
     *
     * @param _thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public keyUpPause(_thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onKeyUpPause);
    }

    /**
     * Reacts to the context menu being activated. The pause menu is opened,
     * and the onMouseDownRight mod event is fired.
     *
     * @param _thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    public mouseDownRight(_thing: ICharacter, event?: Event): void {
        this.preventEventDefault(event);
        this.game.menus.pause.toggle();
        this.game.modAttacher.fireEvent(this.game.mods.eventNames.onMouseDownRight);
    }

    /**
     * Driver for a direction key being pressed. The MenuGraphr's active menu reacts
     * to the movement if it exists, or the triggering Character attempts to walk
     * if not. The onKeyDownDirectionReal mod event is fired.
     *
     * @param thing   The triggering Character.
     * @param event   The original user-caused Event.
     */
    private keyDownDirectionReal(thing: IPlayer, direction: Direction): void {
        if (!thing.keys[direction]) {
            return;
        }

        if (this.game.menuGrapher.getActiveMenu()) {
            this.game.menuGrapher.registerDirection(direction);
            return;
        }

        thing.nextDirection = direction;
        thing.wantsToWalk = true;

        if (!thing.walking) {
            this.game.actions.animateCharacterSetDirection(thing, direction);
        }

        this.game.modAttacher.fireEvent(
            this.game.mods.eventNames.onKeyDownDirectionReal,
            direction
        );
    }

    /**
     * Prevents an event's default, if the event exists.
     *
     * @param event   Event optionally attached to a user key input.
     */
    private preventEventDefault(event?: Event) {
        if (event && event.preventDefault) {
            event.preventDefault();
        }
    }
}
