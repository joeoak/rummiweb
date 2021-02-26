import { socket, GameState, thisPlayerRack, thisPlayerIndex } from './scripts.js';

const addSet = (e) =>
{
    socket.emit('add set');
}

const advanceTurn = (e) =>
{
    if (GameState.isValidBoard &&
        GameState.playerHandArr.length === 0)
    {
        if (GameState.isCardsAdded === false &&
            GameState.deckArr.length > 0)
        {
            socket.emit('draw card');
        }

        if (thisPlayerRack.cards.length === 0)
        {
            socket.emit('game over', thisPlayerIndex);
        }
        else
        {
            socket.emit('advance turn');
        }
    }
}

const selectCard = (e) =>
{
    console.log('card selected');

    e.stopPropagation();

    let targetCardData = new Object(
    {
        id: e.target.id,
        index: e.target.dataset.index,
        isHeld: e.target.classList.contains('held'),
        location: e.target.dataset.location,
        setId: e.target.dataset.setId,
    });

    socket.emit('select card', JSON.stringify(targetCardData));
}

const selectCell = (e) =>
{
    let targetCellIndex = e.target.dataset.index;
    socket.emit('select cell', targetCellIndex);
}

const selectSet = (e) =>
{
    let targetSetId = e.target.id;
    socket.emit('select set', targetSetId);
}

export
{
    addSet,
    advanceTurn,
    selectCard,
    selectCell,
    selectSet,
}
