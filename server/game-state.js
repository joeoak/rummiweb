let deckArr = new Array(),
    boardArr = new Array(),
    playerRackArr = new Array(),
    playerHandArr = new Array();

let setIdArr = new Array();

let turnCounter = 1,
    playerCount = 2,
    currentPlayerIndex = 0;

let isBoardValid,
    isPlayerPlacedCards;

let currentPlayerRack;

module.exports =
{
    deckArr,
    boardArr,
    playerRackArr,
    playerHandArr,
    setIdArr,
    turnCounter,
    playerCount,
    currentPlayerIndex,
    currentPlayerRack,
    isBoardValid,
    isPlayerPlacedCards,
}