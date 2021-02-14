// todo: add 'Arr' to variable names
let deck = new Array(),
    board = new Array(),
    playerHand = new Array(),
    playerRacks = new Array();

let setIds = new Array(); // todo: add 'Arr' to variable names

// todo: wrap these within an object
let playerCount = 2,
    turnCounter = 1,
    startingAmount = 14;

import { Card, PlayerRack, Set } from './modules/classes.js';
import * as Node from './modules/nodes.js';
import * as Utility from './modules/utilities.js';
import { isBoardValid, isPlayerPlacedCards, checkIfPlayerPlacedCards, verifySets } from './modules/verification.js';

const returnPlayerRack = () => // todo: "returnCurrentPlayerRack"?
{
    if (playerCount === 1)
    {
        return playerRacks[0];
    }
    else if (playerCount === 2)
    {
        if (turnCounter % playerCount === 0)
        {
            return playerRacks[1];
        }
        else if (turnCounter % playerCount === 1)
        {
            return playerRacks[0];
        }
    }
    else if (playerCount === 3)
    {
        if (turnCounter % playerCount === 0)
        {
            return playerRacks[2];
        }
        else if (turnCounter % playerCount === 2)
        {
            return playerRacks[1];
        }
        else if (turnCounter % playerCount === 1)
        {
            return playerRacks[0];
        }
    }
    else if (playerCount === 4)
    {
        if (turnCounter % playerCount === 0)
        {
            return playerRacks[3];
        }
        else if (turnCounter % playerCount === 3)
        {
            return playerRacks[2];
        }
        else if (turnCounter % playerCount === 2)
        {
            return playerRacks[1];
        }
        else if (turnCounter % playerCount === 1)
        {
            return playerRacks[0];
        }
    }
}

const initiateDeck = (deck) => 
{   
    const colorArr = ['color0', 'color1', 'color2', 'color3'];
    const seriesArr = ['a', 'b'];

    seriesArr.forEach(series =>
    {
        colorArr.forEach(color =>
        {
            for (let num = 1; num <= 13; num++)
            {
                deck.push(new Card(color, `${color}-${num}-${series}`, num, 'num'));
            }
        });

        deck.push(new Card(null, `joker-${series}`, null, 'joker'));
    });
}

const distributeCards = () =>
{
    for (let i = 1; i <= playerCount; i++)
    {
        let rack = new Array(); // todo: add 'Arr' to variable names

        for (let j = 0; j < startingAmount; j++)
        {
            let r = Math.floor(Math.random() * deck.length);
            let targetCard = deck.splice(r, 1)[0];
            targetCard.isHeld = true;
            rack.push(targetCard);
        }

        playerRacks.push(new PlayerRack(rack, `Player ${i}`, i - 1));
    }
}

/* render */

const drawCanvas = () =>
{
    // clear canvas
    Node.boardSets.innerHTML = '';
    Node.scoreboard.innerHTML = '';
    Node.playerConsoleRack.innerHTML = '';
    Node.playerConsoleHand.innerHTML = '';
    Node.playerConsoleButtons.innerHTML = '';

    // remove empty sets
    board.forEach((set, index) =>
    {
        if (set.cards.length === 0)
        {
            // remove id from setIds
            setIds.forEach((id, index) =>
            {
                if (set.id === `set-${id}`)
                {
                    setIds.splice(index, 1);
                }
            })

            board.splice(index, 1);
        };
    });

    // verification
    verifySets(board);
    checkIfPlayerPlacedCards(board);

    // sort board cards
    board.forEach(set => Utility.sortByColorAndNumber(set.cards));

    // sort player rack
    Utility.sortByColorAndNumber(returnPlayerRack().cards);

    // draw sets
    board.forEach(set =>
    {
        let newSet = document.createElement('button');
        newSet.id = set.id;
        newSet.className = 'set';

        if (!set.isValid)
        {
            newSet.classList.add('invalid');
        }

        newSet.onclick = (e) => selectSet(e);

        set.cards.forEach(card =>
        {
            newSet.appendChild(card.render(selectCard));
        });

        Node.boardSets.appendChild(newSet);
    });

    // render add set button
    let addSetButton = document.createElement('button');
    addSetButton.id = 'button-new-set'
    addSetButton.onclick = () => addGroup();
    addSetButton.innerHTML += '+';
    Node.boardSets.appendChild(addSetButton);

    // render player hand
    playerHand.forEach(card => Node.playerConsoleHand.appendChild(card.render(selectCard)));

    // render player rack
    returnPlayerRack().cards.forEach(card => Node.playerConsoleRack.appendChild(card.render(selectCard)));

    // render player console
    Node.playerConsoleHeader.innerHTML = `${returnPlayerRack().name}'s turn`;
    Node.scoreboard.innerHTML =
        `<div class="scoreboard-item">
            <div class="scoreboard-item-turn-title">Turn</div>
            <div class="scoreboard-item-turn-number">${turnCounter}</div>
        </div>`;

    for (let i = 0; i < playerCount; i++)
    {
        let playerScore = document.createElement('div');
        playerScore.classList.add('scoreboard-item');

        if (i === returnPlayerRack().index)
        {
            playerScore.classList.add('selected');
            playerScore.innerHTML = 
                `<div class="scoreboard-item-player-name">👉 ${playerRacks[i].name}</div>
                 <div class="scoreboard-item-player-score">${playerRacks[i].cards.length}</div>`;
        }
        else
        {
            playerScore.innerHTML = 
                `<div class="scoreboard-item-player-name">${playerRacks[i].name}</div>
                 <div class="scoreboard-item-player-score">${playerRacks[i].cards.length}</div>`;
        }
        
        Node.scoreboard.appendChild(playerScore);
    }

    // render next turn button
    let nextButton = document.createElement('button');
    nextButton.id = 'button-next-turn'
    nextButton.classList.add('player-console-button');
    nextButton.onclick = () => advanceTurn();
    nextButton.innerHTML += 'Next turn';

    if (isBoardValid === false || playerHand.length > 0)
    {
        nextButton.classList.add('disabled');
    }
    else
    {
        nextButton.classList.add('enabled');
    }
    
    Node.playerConsoleButtons.appendChild(nextButton);
}

/* events */

const addGroup = () =>
{
    board.push(new Set(playerHand.splice(0, playerHand.length), `set-${Utility.generateId(setIds)}`));
    drawCanvas();
}

const advanceTurn = () =>
{
    if (isBoardValid && playerHand.length <= 0)
    {
        if (isPlayerPlacedCards)
        {
            // set all cards to isHeld = false
            board.forEach(set =>
            {
                set.cards.forEach(card =>
                {
                    if (card.isHeld)
                    {
                        card.isHeld = false;
                    }
                });
            });
        }
        else
        {
            drawCard();
        }

        if (returnPlayerRack().cards.length === 0)
        {
            alert('Game over!');
        }
        else
        {
            turnCounter += 1;
        }

        drawCanvas();
    }
}

const drawCard = () =>
{
    if (deck.length > 0)
    {
        let r = Math.floor(Math.random() * deck.length);
        let targetCard = deck.splice(r, 1)[0];
        targetCard.isHeld = true;
        returnPlayerRack().cards.push(targetCard);
    }
}

const selectCard = (e) => 
{
    // todo: see if card.location is being used

    e.stopPropagation(); // prevents player from triggering set event underneath card

    let targetParent = e.path[1];
    let targetCard;

    if (targetParent.id === 'player-console-rack')
    {
        returnPlayerRack().cards.forEach((card, index) =>
        {
            if (card.id === e.target.id)
            {
                targetCard = returnPlayerRack().cards.splice(index, 1)[0];  
            };
        });

        targetCard.location = 'player-hand';
        playerHand.push(targetCard);
    }
    else if (targetParent.id === 'player-console-hand')
    {
        playerHand.forEach((card, index) =>
        {
            if (card.id === e.target.id && card.isHeld === true)
            {
                targetCard = playerHand.splice(index, 1)[0];
                targetCard.location = 'player-rack';
                returnPlayerRack().cards.push(targetCard);
            }
        });
    }
    else if (targetParent.classList.contains('set'))
    {
        board.forEach(set =>
        {
            if (set.id === targetParent.id)
            {
                set.cards.forEach((card, index) =>
                {
                    if (card.id === e.target.id)
                    {
                        targetCard = set.cards.splice(index, 1)[0];
                    }
                });
            }
        });

        if (targetCard.isHeld)
        {
            targetCard.location = 'player-rack';
            returnPlayerRack().cards.push(targetCard);
        }
        else
        {
            targetCard.location = 'player-hand';
            playerHand.push(targetCard);
        }
    }

    drawCanvas();
}

const selectSet = (e) =>
{
    let cards = playerHand.splice(0, playerHand.length);

    board.forEach(set =>
    {
        if (set.id === e.target.id)
        {
            cards.forEach(card =>
            {
                card.location = 'set';
                set.cards.push(card);
            });
        }
    });

    drawCanvas();
}

/* init */

initiateDeck(deck);
distributeCards();
drawCanvas();