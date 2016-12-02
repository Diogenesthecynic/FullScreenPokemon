import { Component } from "eightbittr/lib/Component";

import { FullScreenPokemon } from "./FullScreenPokemon";
import { IPlayer } from "./IFullScreenPokemon";

/**
 * Cycling functions used by FullScreenPokemon instances.
 */
export class Cycling<TEightBittr extends FullScreenPokemon> extends Component<TEightBittr> {
    /**
     * Starts the Player cycling if the current Area allows it.
     *
     * @param thing   A Player to start cycling.
     * @param area   The current Area.
     * @returns Whether the properties were changed.
     */
    public startCycling(thing: IPlayer): boolean {
        if (thing.surfing) {
            return false;
        }

        if (!this.EightBitter.MapScreener.variables.allowCycling) {
            return false;
        }

        thing.cycling = true;
        this.EightBitter.storage.addStateHistory(thing, "speed", thing.speed);
        thing.speed = this.EightBitter.MathDecider.compute("speedCycling", thing);

        this.EightBitter.graphics.addClass(thing, "cycling");

        this.EightBitter.menus.displayMessage(thing, "%%%%%%%PLAYER%%%%%%% got on the bicycle!");
        return true;
    }

    /**
     * Stops the Player cycling.
     *
     * @param thing   A Player to stop cycling.
     */
    public stopCycling(thing: IPlayer): void {
        thing.cycling = false;
        this.EightBitter.storage.popStateHistory(thing, "speed");

        this.EightBitter.graphics.removeClass(thing, "cycling");
        this.EightBitter.TimeHandler.cancelClassCycle(thing, "cycling");

        this.EightBitter.menus.displayMessage(thing, "%%%%%%%PLAYER%%%%%%% got off the bicycle.");
    }

    /**
     * Toggles the Player's cycling status.
     *
     * @param thing   A Player to start or stop cycling.
     * @returns Whether the Player started cycling.
     */
    public toggleCycling(thing: IPlayer): boolean {
        if (thing.cycling) {
            this.stopCycling(thing);
            return true;
        }

        return this.startCycling(thing);
    }
}
