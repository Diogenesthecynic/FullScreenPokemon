import { Section } from "eightbittr";
import * as imenugraphr from "menugraphr";

import { FullScreenPokemon } from "../../FullScreenPokemon";
import { IListMenu, IMenu, IMenuSchema } from "../Menus";

/**
 * A Menu to display the results of a KeyboardKeys Menu. A set of "blank" spaces
 * are available, and filled with Text Things as keyboard characters are chosen.
 */
export interface IKeyboardResultsMenu extends IMenu {
    /**
     * The complete accumulated values of text characters added, in order.
     */
    completeValue: string[];

    /**
     * The displayed value on the screen.
     */
    displayedValue: string[];

    /**
     * Which blank space is currently available.
     */
    selectedChild: number;
}

/**
 * Settings to open a keyboard menu.
 */
export interface IKeyboardMenuSettings {
    /**
     * A callback to replace key presses.
     */
    callback?(...args: any[]): void;

    /**
     * Whether the menu should start in lowercase (by default, false).
     */
    lowercase?: boolean;

    /**
     * Which blank space should initially be available (by default, 0).
     */
    selectedChild?: number;

    /**
     * The initial selected index (by default, [0, 0]).
     */
    selectedIndex?: [number, number];

    /**
     * A starting result value (by default, "").
     */
    title?: string;

    /**
     * A starting value to replace the initial underscores.
     */
    value?: string[];
}

/**
 * Manipulates the on-screen keyboard menus.
 */
export class Keyboards extends Section<FullScreenPokemon> {
    /**
     * Opens the Keyboard menu and binds it to some required callbacks.
     *
     * @param settings   Settings to apply to the menu and for callbacks.
     */
    public openKeyboardMenu(settings: IKeyboardMenuSettings = {}): void {
        this.closeKeyboardMenu();

        const completeValue: string[] = settings.value ? settings.value.slice() : [];
        const displayedValue: string[] = completeValue.slice();
        for (let i = settings.selectedChild || 0; i < 7; i += 1) {
            displayedValue[i] = "_";
        }

        const onKeyPress: () => void = (): void => this.addKeyboardMenuValue();
        const onBPress: () => void = (): void => this.removeKeyboardMenuValue();
        const onComplete: () => void = settings.callback || (() => {});
        const lowercase = !!settings.lowercase;
        const letters: string[] = lowercase
            ? this.game.constants.keysLowercase
            : this.game.constants.keysUppercase;
        const options: any[] = letters.map((letter: string): any => ({
            text: [letter],
            value: letter,
            callback: letter !== "ED" ? onKeyPress : onComplete,
        }));

        this.game.menuGrapher.createMenu("Keyboard", {
            settings,
            onKeyPress,
            onComplete,
            ignoreB: false,
        } as IMenuSchema);

        this.game.menuGrapher.addMenuDialog("KeyboardTitle", [[settings.title || ""]]);

        this.game.menuGrapher.addMenuList("KeyboardKeys", {
            options,
            selectedIndex: settings.selectedIndex,
            bottom: {
                text: lowercase ? "UPPER CASE" : "lower case",
                callback: (): void => this.switchKeyboardCase(),
                position: {
                    top: 160,
                    left: 0,
                },
            },
        });
        this.game.menuGrapher.getMenu("KeyboardKeys").onBPress = onBPress;
        this.game.menuGrapher.setActiveMenu("KeyboardKeys");

        const menuResults: IKeyboardResultsMenu = this.game.menuGrapher.getMenu(
            "KeyboardResult"
        ) as IKeyboardResultsMenu;
        menuResults.completeValue = completeValue;
        menuResults.displayedValue = displayedValue;
        menuResults.selectedChild = settings.selectedChild || completeValue.length;

        this.resetResultsDisplay();
    }

    /**
     * Adds a value to the keyboard menu from the currently selected item.
     */
    public addKeyboardMenuValue(): void {
        const menuResults: IKeyboardResultsMenu = this.game.menuGrapher.getMenu(
            "KeyboardResult"
        ) as IKeyboardResultsMenu;
        const menuKeys: imenugraphr.IGridCell = this.game.menuGrapher.getMenuSelectedOption(
            "KeyboardKeys"
        );

        menuResults.completeValue.push(menuKeys.value);
        menuResults.displayedValue[menuResults.selectedChild] = menuKeys.text[0] as string;
        menuResults.selectedChild += 1;

        if (menuResults.selectedChild === menuResults.children.length) {
            this.moveSelectionToEnd();
        }

        this.resetResultsDisplay();
    }

    /**
     * Removes the rightmost keyboard menu value.
     */
    public removeKeyboardMenuValue(): void {
        const menuResults: IKeyboardResultsMenu = this.game.menuGrapher.getMenu(
            "KeyboardResult"
        ) as IKeyboardResultsMenu;
        if (menuResults.selectedChild <= 0) {
            return;
        }

        menuResults.completeValue.length -= 1;
        menuResults.displayedValue[menuResults.selectedChild] = "_";
        menuResults.selectedChild -= 1;

        this.resetResultsDisplay();
    }

    /**
     * Switches the keyboard menu's case.
     */
    protected switchKeyboardCase(): void {
        const menuKeyboard = this.game.menuGrapher.getMenu("Keyboard") as IMenu;
        const menuKeys = this.game.menuGrapher.getMenu("KeyboardKeys") as IListMenu;
        const menuResults = this.game.menuGrapher.getMenu(
            "KeyboardResult"
        ) as IKeyboardResultsMenu;

        this.openKeyboardMenu({
            ...menuKeyboard.settings,
            lowercase: !menuKeyboard.settings.lowercase,
            value: menuResults.completeValue,
            displayedValue: menuResults.displayedValue,
            completeValue: menuResults.completeValue,
            selectedChild: menuResults.selectedChild,
            selectedIndex: menuKeys.selectedIndex,
        });
    }

    /**
     * Closes the keyboard menu.
     */
    public closeKeyboardMenu(): void {
        this.game.menuGrapher.deleteMenu("Keyboard");
    }

    /**
     * Recreates the display of current results and cursor.
     */
    protected resetResultsDisplay(): void {
        const menuResults: IKeyboardResultsMenu = this.game.menuGrapher.getMenu(
            "KeyboardResult"
        ) as IKeyboardResultsMenu;
        const dialog: [string][] = menuResults.displayedValue.map((text: string): [string] => [
            text,
        ]);

        dialog[menuResults.selectedChild] = ["MDash"];

        for (const child of menuResults.children) {
            this.game.death.kill(child);
        }

        menuResults.children = [];

        this.game.menuGrapher.addMenuDialog("KeyboardResult", [dialog]);
    }

    /**
     *
     */
    protected moveSelectionToEnd(): void {
        const menuKeys: IListMenu = this.game.menuGrapher.getMenu("KeyboardKeys") as IListMenu;

        this.game.menuGrapher.setSelectedIndex(
            "KeyboardKeys",
            menuKeys.gridColumns - 1,
            menuKeys.gridRows - 2
        ); // assume there's a bottom option
    }
}
