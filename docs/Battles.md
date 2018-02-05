## Battles

Battles in FullScreenPokemon are driven by the [`Battles`](../src/components/Battles.ts) component and run by [BattleMovr](https://github.com/FullScreenShenanigans/BattleMovr).
BattleMovr provides for keeping track of two teams of actors; `Battles` adds FullScreenPokemon-specific logic such as visualizing the battles.

### Simulating battles

Battles are generally started with `FSP.battles.startBattle`.
Its settings object requires a `teams` member that contains a descriptor for the `player` and `opponent`.

Each team descriptor requires an `actors` array of created Pokemon.
Those are most easily made with `FSP.equations.createPokemon`.

You can retrieve the Pokemon in the player's party with `FSP.itemsHolder.getItem(FSP.items.names.pokemonInParty);`.

```javascript
// Starts a battle with a wild level 50 Mew in the player's party
FSP.battles.startBattle({
    teams: {
        opponent: {
            actors: [
                FSP.equations.createPokemon({
                    level: 50,
                    title: "MEW".split("")
                })
            ]
        },
        player: {
            actors: FSP.itemsHolder.getItem(FSP.items.names.pokemonInParty),
            leader: {
                nickname: FSP.itemsHolder.getItem(FSP.items.names.name),
                title: "Player".split("")
            }
        }
    }
});
```

Team descriptors can optionally also take a `leader` object that indicate the team is a trainer rather than a wild Pokemon.

```javascript
// Starts a battle against a bug catcher
FSP.battles.startBattle({
    teams: {
        opponent: {
            actors: [
                FSP.equations.createPokemon({
                    level: 7,
                    title: "METAPOD".split("")
                }),
                FSP.equations.createPokemon({
                    level: 7,
                    title: "METAPOD".split("")
                })
            ],
            leader: {
                nickname: "Bug Catcher".split(""),
                title: "BugCatcher".split("")
            }
        },
        player: {
            actors: [
                FSP.equations.createPokemon({
                    level: 50,
                    title: "CHARIZARD".split("")
                })
            ],
            leader: {
                nickname: FSP.itemsHolder.getItem(FSP.items.names.name),
                title: "Player".split("")
            }
        }
    }
});
```

### Modifying actors

Each actor has a `statistics` object with an `{ current: number, normal: number }` describing one of the actor's statistics.
You can change an actor's statistic by directly modifying those objects via `FSP.battleMover`'s current `battleInfo`.

```javascript
// Changes the player's current actor to have 9001 attack
FSP.battleMover.getBattleInfo().teams.player.actors[0].statistics.attack.current = 9001;
```
