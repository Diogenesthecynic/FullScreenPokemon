/// <reference path="../typings/GameStartr.d.ts" />

import { Direction } from "./Constants";
import { FullScreenPokemon } from "./FullScreenPokemon";
import { ICharacter, IGrass, IPlayer, IThing } from "./IFullScreenPokemon";

/**
 * Physics functions used by FullScreenPokemon instances.
 */
export class Physics<TEightBittr extends FullScreenPokemon> extends GameStartr.Physics<TEightBittr> {
    /**
     * Determines the bordering direction from one Thing to another.
     * 
     * @param thing   The source Thing.
     * @param other   The destination Thing.
     * @returns The direction from thing to other.
     */
    public getDirectionBordering(thing: IThing, other: IThing): Direction {
        if (Math.abs((thing.top) - (other.bottom - other.tolBottom)) < this.EightBitter.unitsize) {
            return Direction.Top;
        }

        if (Math.abs(thing.right - other.left) < this.EightBitter.unitsize) {
            return Direction.Right;
        }

        if (Math.abs(thing.bottom - other.top) < this.EightBitter.unitsize) {
            return Direction.Bottom;
        }

        if (Math.abs(thing.left - other.right) < this.EightBitter.unitsize) {
            return Direction.Left;
        }

        return undefined;
    }

    /**
     * Determines the direction from one Thing to another.
     * 
     * @param thing   The source Thing.
     * @param other   The destination Thing.
     * @returns The direction from thing to other.
     * @remarks Like getDirectionBordering, but for cases where the two Things
     *          aren't necessarily touching.
     */
    public getDirectionBetween(thing: IThing, other: IThing): Direction {
        let directionBordering: Direction = this.getDirectionBordering(thing, other);

        if (typeof directionBordering !== "undefined") {
            return directionBordering;
        }

        if (thing.top > other.bottom + this.EightBitter.unitsize) {
            return Direction.Top;
        }

        if (thing.right < other.left - this.EightBitter.unitsize) {
            return Direction.Right;
        }

        if (thing.bottom < other.top - this.EightBitter.unitsize) {
            return Direction.Bottom;
        }

        if (thing.left > other.right + this.EightBitter.unitsize) {
            return Direction.Left;
        }

        return undefined;
    }

    /**
     * Checks whether one Thing is overlapping another.
     * 
     * @param thing   An in-game Thing.
     * @param other   An in-game Thing.
     * @returns Whether thing and other are overlapping.
     */
    public isThingWithinOther(thing: IThing, other: IThing): boolean {
        return (
            thing.top >= other.top
            && thing.right <= other.right
            && thing.bottom <= other.bottom
            && thing.left >= other.left);
    }

    /**
     * Determines whether a Character is visually within grass.
     * 
     * @param thing   An in-game Character.
     * @param other   Grass that thing might be in.
     * @returns Whether thing is visually within other.
     */
    public isThingWithinGrass(thing: ICharacter, other: IGrass): boolean {
        if (thing.right <= other.left) {
            return false;
        }

        if (thing.left >= other.right) {
            return false;
        }

        if (other.top > (
            thing.top + thing.heightGrass * this.EightBitter.unitsize)) {
            return false;
        }

        if (other.bottom < (
            thing.top + thing.heightGrass * this.EightBitter.unitsize)) {
            return false;
        }

        return true;
    }

    /**
     * Shifts a Character according to its xvel and yvel.
     * 
     * @param thing   A Character to shift.
     */
    public shiftCharacter(thing: ICharacter): void {
        if (thing.bordering[Direction.Top] && thing.yvel < 0) {
            thing.yvel = 0;
        }

        if (thing.bordering[Direction.Right] && thing.xvel > 0) {
            thing.xvel = 0;
        }

        if (thing.bordering[Direction.Bottom] && thing.yvel > 0) {
            thing.yvel = 0;
        }

        if (thing.bordering[Direction.Left] && thing.xvel < 0) {
            thing.xvel = 0;
        }

        this.shiftBoth(thing, thing.xvel, thing.yvel);
    }

    /**
     * Sets a Player looking in a direction and updates MapScreener.
     * 
     * @param thing   An in-game Player.
     * @param direction   A direction for thing to look at.
     */
    public setPlayerDirection(thing: IPlayer, direction: Direction): void {
        thing.direction = direction;
        this.EightBitter.MapScreener.playerDirection = direction;
        thing.shouldWalk = true;
    }

    /**
     * Standard Function to kill a Thing, which means marking it as dead and
     * clearing its numquads, resting, movement, and cycles. It will later be
     * removed by its maintain* Function.
     * 
     * @param thing   A Thing to kill.
     */
    public killNormal(thing: IThing): void {
        if (!thing) {
            return;
        }

        thing.nocollide = thing.hidden = thing.dead = true;
        thing.alive = false;
        thing.numquads = 0;
        thing.movement = undefined;

        this.EightBitter.TimeHandler.cancelAllCycles(thing);
        this.EightBitter.ModAttacher.fireEvent("onKillNormal", thing);

        if (thing.id) {
            delete (this.EightBitter.GroupHolder.getGroup("Thing") as any)[thing.id];
        }
    }
}
