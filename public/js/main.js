import * as Node from './nodes.js';

/* render */

const renderCard = (card) =>
{
    let newCard = document.createElement('button');
    newCard.classList.add('card');
    newCard.id = card.id;
    newCard.onclick = (e) => selectCard(e);
    
    if (card.type === 'num')
    {
        newCard.classList.add(card.color);
        newCard.innerText = card.num;
    }
    else if (card.type === 'joker')
    {
        newCard.classList.add(card.type);
        newCard.innerText = `🙂`;
    }

    if (card.isHeld && card.location != 'player-rack')
    {
        newCard.classList.add('held');
    }
    
    return newCard;
}

const renderBoard = () =>
{
    GameState.boardArr.forEach(set =>
    {
        let newSet = document.createElement('button');
        newSet.className = 'set';
        newSet.id = set.id;

        if (!set.isValid)
        {
            newSet.classList.add('invalid');
        }

        newSet.onclick = (e) => selectSet(e);

        set.cards.forEach(card =>
        {
            newSet.appendChild(renderCard(card));
        });

        Node.boardSets.appendChild(newSet);
    });

    // render add set button
    let addSetButton = document.createElement('button');
    addSetButton.onclick = (e) => addGroup(e);
    addSetButton.id = 'button-new-set'
    addSetButton.innerText += '+';

    Node.boardSets.appendChild(addSetButton);
}

const renderPlayerConsole = () =>
{
    Node.playerConsoleHeader.innerHTML = `${GameState.currentPlayerRack.name}'s turn`;

    Node.scoreboard.innerHTML =
        `<div class="scoreboard-item">
            <div class="scoreboard-item-turn-title">Turn</div>
            <div class="scoreboard-item-turn-number">${GameState.turnCounter}</div>
        </div>`;

    for (let i = 0; i < GameState.playerCount; i++)
    {
        let playerScore = document.createElement('div');
        playerScore.classList.add('scoreboard-item');

        if (i === GameState.currentPlayerIndex)
        {
            playerScore.classList.add('selected');
            playerScore.innerHTML = 
                `<div class="scoreboard-item-player-name">👉 ${GameState.playerRackArr[i].name}</div>
                 <div class="scoreboard-item-player-score">${GameState.playerRackArr[i].cards.length}</div>`;
        }
        else
        {
            playerScore.innerHTML = 
                `<div class="scoreboard-item-player-name">${GameState.playerRackArr[i].name}</div>
                 <div class="scoreboard-item-player-score">${GameState.playerRackArr[i].cards.length}</div>`;
        }
        
        Node.scoreboard.appendChild(playerScore);
    }

    let nextButton = document.createElement('button');
    nextButton.classList.add('player-console-button');
    nextButton.id = 'button-next-turn';
    nextButton.innerHTML += 'Next turn';
    nextButton.onclick = () => advanceTurn();

    if (GameState.isBoardValid === false || GameState.playerHandArr.length > 0)
    {
        nextButton.classList.add('disabled');
    }
    else
    {
        nextButton.classList.add('enabled');
    }
    
    Node.playerConsoleButtons.appendChild(nextButton);
}

const renderGame = () =>
{
    Node.boardSets.innerHTML = '';
    Node.scoreboard.innerHTML = '';
    Node.playerConsoleRack.innerHTML = '';
    Node.playerConsoleHand.innerHTML = '';
    Node.playerConsoleButtons.innerHTML = '';

    renderBoard();

    // render player hand
    GameState.playerHandArr.forEach(card => 
    {
        Node.playerConsoleHand.appendChild(renderCard(card));
    });

    // render player rack
    GameState.currentPlayerRack.cards.forEach(card =>
    {
        Node.playerConsoleRack.appendChild(renderCard(card));
    });

    renderPlayerConsole();
}

/* events */

const addGroup = (e) =>
{
    socket.emit('add group');
}

const advanceTurn = (e) =>
{
    if (GameState.isBoardValid && GameState.playerHandArr.length <= 0)
    {
        if (GameState.isPlayerPlacedCards === false &&
            GameState.deckArr.length > 0)
        {
            socket.emit('draw card');
        }

        if (GameState.currentPlayerRack.cards.length === 0)
        {
            alert('Game over!');
        }
        else
        {
            socket.emit('advance turn');
        }
    }
}

const selectCard = (e) =>
{
    e.stopPropagation();

    let targetCard = new Object(
    {
        destination: '',
        origin: '',
        parent: e.path[1],
        setId: '',
        id: e.target.id,
        index: 0,
    });

    if (targetCard.parent.id === 'player-console-rack')
    {
        GameState.currentPlayerRack.cards.forEach((card, index) =>
        {
            if (card.id === targetCard.id)
            {
                targetCard.destination = 'player-hand';
                targetCard.origin = 'player-rack';
                targetCard.index = index;
            };
        });
    }
    
    if (targetCard.parent.id === 'player-console-hand')
    {
        GameState.playerHandArr.forEach((card, index) =>
        {
            if (card.id === targetCard.id && 
                card.isHeld === true)
            {
                targetCard.destination = 'player-rack';
                targetCard.origin = 'player-hand';
                targetCard.index = index;
            }
        });
    }
    
    if (targetCard.parent.classList.contains('set'))
    {
        GameState.boardArr.forEach(set =>
        {
            if (set.id === targetCard.parent.id)
            {
                set.cards.forEach((card, index) =>
                {
                    if (card.id === targetCard.id)
                    {
                        if (card.isHeld)
                        {
                            targetCard.destination = 'player-rack';
                        }
                        else
                        {
                            targetCard.destination = 'player-hand';
                        }

                        targetCard.origin = 'set';
                        targetCard.setId = set.id;
                        targetCard.index = index;
                    }
                });
            }
        });
    }

    socket.emit('select card', targetCard); 
}

const selectSet = (e) =>
{
    let setId = e.target.id;
    socket.emit('select set', setId);
}

/* socket.io */

const socket = io();
let GameState = new Object();

socket.emit('game start');

socket.on('game update', message =>
{
    console.log('game update!');
    GameState = JSON.parse(message);
    console.log(GameState);
    renderGame();
});
