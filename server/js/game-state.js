let GameState =
{
    boardArr: new Array(),
    currentPlayerHand: null,
    currentPlayerIndex: 0,
    currentPlayerRack: null,
    deckArr: new Array(),
    isCardsAdded: false,
    isValidBoard: true,
    playerCount: 2,
    playerHandArr: new Array(),
    playerRackArr: new Array(),
    setIdArr: new Array(),
    turnCounter: 1,
}

module.exports = GameState;
