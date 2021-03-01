import { socket, GameState, thisPlayerRack, thisPlayerIndex } from './scripts.js';

const addSet = () => socket.emit('add set');
const advanceTurn = () => socket.emit('advance turn');

const selectCard = e =>
{
    e.stopPropagation();

    let targetCardData = new Object(
    {
        id: e.target.id,
        index: e.target.dataset.index,
        isHeld: e.target.classList.contains('held'),
        location: e.target.dataset.location,
        setId: e.target.dataset.setId,
        thisPlayerIndex: thisPlayerIndex,
    });

    socket.emit('select card', JSON.stringify(targetCardData));
}

const selectCell = e =>
{
    let targetCellData = new Object(
    {
        index: e.target.dataset.index,
        thisPlayerIndex: thisPlayerIndex,
    });

    socket.emit('select cell', JSON.stringify(targetCellData));
}

const selectSet = e =>
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
