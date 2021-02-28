let GameState =
{
    boardArr: new Array(),
    currentPlayerIndex: 0,
    currentPlayerHand: null,
    currentPlayerRack: null,
    deckArr: new Array(),
    isCardsAdded: false,
    isValidBoard: true,
    playerCount: 2,
    playerRackArr: new Array(),
    playerHandArr: new Array(),
    setIdArr: new Array(),
    turnCounter: 1,
}

module.exports = GameState;
