# Cartesi Numberle

This is an implementation of the backend for a [numberle puzzle](https://numberle.org/).

Currently, the dapp expects 2 kinds of inputs:

1. `{"action":"new_game"}` - which starts a new game.
After a successful call, the app responds with a notice containing `game_id` in the payload

1. `{"action":"attempt","data":{"game_id":"<your-game-id>","submission":"<your-guess>"}}` - which records and scores your guess.
The dapp posts a notice with your sore/hint and other game state
