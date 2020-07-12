import { Section } from "eightbittr";

import { FullScreenPokemon } from "../../FullScreenPokemon";
import { ICharacter, IThing } from "../Things";

/**
 * Hops characters down ledges.
 */
export class Ledges extends Section<FullScreenPokemon> {
    /**
     * Starts a Character hopping over a ledge.
     *
     * @param thing   A Character hopping over a ledge.
     * @param other   The ledge the Character is hopping over.
     */
    public startLedgeHop(thing: ICharacter, other: IThing): void {
        const ticksPerBlock: number = this.game.equations.walkingTicksPerBlock(thing);

        thing.nocollide = true;
        thing.wantsToWalk = true;
        thing.ledge = other;

        this.addHopOffset(thing);
        this.addHopShadow(thing);

        this.game.timeHandler.addEvent((): void => this.endLedgeHop(thing), ticksPerBlock * 2);
    }

    /**
     * Finishes a Character hopping over a ledge.
     *
     * @param thing   A Character done hopping over a ledge.
     * @param other   The ledge the Character is done hopping over.
     */
    public endLedgeHop(thing: ICharacter): void {
        this.game.death.kill(thing.shadow!);
        thing.nocollide = false;
        thing.wantsToWalk = false;
        thing.ledge = undefined;
        thing.shadow = undefined;
    }

    /**
     * Adds a visual "hop" to a hopping Character.
     *
     * @param thing   A Character hopping over a ledge.
     */
    protected addHopOffset(thing: ICharacter): void {
        const ticksPerBlock: number = this.game.equations.walkingTicksPerBlock(thing);
        let dy = -2;

        this.game.timeHandler.addEventInterval((): void => {
            dy *= -1;
        }, ticksPerBlock + 1);

        this.game.timeHandler.addEventInterval(
            (): void => {
                thing.offsetY += dy;
            },
            1,
            ticksPerBlock * 2
        );
    }

    /**
     * Adds a visual shadow to a hopping Character.
     *
     * @param thing   A Character hopping over a ledge.
     */
    protected addHopShadow(thing: ICharacter): void {
        thing.shadow = this.game.things.add(this.game.things.names.shadow);

        this.game.timeHandler.addEventInterval(
            (): boolean => this.updateShadowPosition(thing),
            1,
            Infinity
        );
    }

    /**
     * Updates a hopping Character's shadow.
     *
     * @param thing   A Character hopping over a ledge.
     * @param other   The ledge the Character is hopping over.
     */
    protected updateShadowPosition(thing: ICharacter): boolean {
        if (!thing.shadow) {
            return true;
        }

        this.game.physics.setMidXObj(thing.shadow, thing);
        this.game.physics.setBottom(thing.shadow, thing.bottom);
        return false;
    }
}
