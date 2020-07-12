import { Section } from "eightbittr";
import { ITimeEvent } from "timehandlr";

import { FullScreenPokemon } from "../../FullScreenPokemon";
import { IThing } from "../Things";

/**
 * Settings for a color fade animation.
 */
export interface IColorFadeSettings {
    /**
     * What color to fade to/from (by default, "White").
     */
    color?: string;

    /**
     * How much to change the color's opacity each tick (by default, .33).
     */
    change?: number;

    /**
     * How many game upkeeps are between each tick (by default, 4).
     */
    speed?: number;

    /**
     * A callback for when the animation completes.
     */
    callback?(): void;
}

/**
 * Fades Things in and out.
 */
export class Fading extends Section<FullScreenPokemon> {
    /**
     * Gradually changes a numeric attribute over time.
     *
     * @param thing   A Thing whose attribute is to change.
     * @param attribute   The name of the attribute to change.
     * @param change   How much to change the attribute each tick.
     * @param goal   A final value for the attribute to stop at.
     * @param speed   How many ticks between changes.
     * @param onCompletion   A callback for when the attribute reaches the goal.
     * @returns The in-progress TimeEvent, if started.
     */
    public animateFadeAttribute(
        thing: IThing,
        attribute: string,
        change: number,
        goal: number,
        speed: number,
        onCompletion?: (thing: IThing) => void
    ): ITimeEvent | undefined {
        (thing as any)[attribute] += change;

        if (change > 0) {
            if ((thing as any)[attribute] >= goal) {
                (thing as any)[attribute] = goal;
                if (typeof onCompletion === "function") {
                    onCompletion(thing);
                }
                return undefined;
            }
        } else {
            if ((thing as any)[attribute] <= goal) {
                (thing as any)[attribute] = goal;
                if (typeof onCompletion === "function") {
                    onCompletion(thing);
                }
                return undefined;
            }
        }

        return this.game.timeHandler.addEvent((): void => {
            this.animateFadeAttribute(thing, attribute, change, goal, speed, onCompletion);
        }, speed);
    }

    /**
     * Fades the screen out to a solid color.
     *
     * @param settings   Settings for the animation.
     * @returns The solid color Thing.
     */
    public animateFadeToColor(settings: IColorFadeSettings = {}): IThing {
        const color: string = settings.color || "White";
        const callback: ((...args: any[]) => void) | undefined = settings.callback;
        const change: number = settings.change || 0.33;
        const speed: number = settings.speed || 4;
        const blank: IThing = this.game.objectMaker.make<IThing>(
            color + this.game.things.names.square,
            {
                width: this.game.mapScreener.width,
                height: this.game.mapScreener.height,
                opacity: 0,
            }
        );

        this.game.things.add(blank);

        this.animateFadeAttribute(blank, "opacity", change, 1, speed, (): void => {
            this.game.death.kill(blank);
            if (callback) {
                callback();
            }
        });

        return blank;
    }

    /**
     * Places a solid color over the screen and fades it out.
     *
     * @param settings   Settings for the animation.
     * @returns The solid color Thing.
     */
    public animateFadeFromColor(settings: IColorFadeSettings = {}, ...args: any[]): IThing {
        const color: string = settings.color || "White";
        const callback: ((...args: any[]) => void) | undefined = settings.callback;
        const change: number = settings.change || 0.33;
        const speed: number = settings.speed || 4;
        const blank: IThing = this.game.objectMaker.make<IThing>(
            color + this.game.things.names.square,
            {
                width: this.game.mapScreener.width,
                height: this.game.mapScreener.height,
                opacity: 1,
            }
        );

        this.game.things.add(blank);

        this.animateFadeAttribute(blank, "opacity", -change, 0, speed, (): void => {
            this.game.death.kill(blank);
            if (callback) {
                callback(settings, ...args);
            }
        });

        return blank;
    }
}
