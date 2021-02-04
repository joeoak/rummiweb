let deck = new Array(),
    board = new Array(),
    playerHand = new Array(),
    playerRacks = new Array();

let setIds = new Array();

let playerCount = 4,
    turnCounter = 1;

import { Card, PlayerRack, Set } from './modules/classes.js';
import * as Node from './modules/nodes.js';
import * as Utility from './modules/utilities.js';
import { isBoardValid, isPlayerPlacedCards, checkIfPlayerPlacedCards, verifySets } from './modules/verification.js';

const returnPlayerRack = () =>
{
    if (playerCount === 2)
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
    const colorArr = ['black', 'blue', 'orange', 'red'];
    const seriesArr = ['a', 'b'];

    seriesArr.forEach(series =>
    {
        colorArr.forEach(color =>
        {
            for (let num = 1; num <= 13; num++) // num
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
        let rack = new Array();

        for (let j = 0; j < 14; j++)
        {
            let r = Math.floor(Math.random() * deck.length);
            let targetCard = deck.splice(r, 1)[0];
            targetCard.isHeld = true;
            rack.push(targetCard);
        }

        playerRacks.push(new PlayerRack(`player ${i}`, rack));
    }
}

const drawCanvas = () =>
{
    // clear canvas
    Node.boardSets.innerHTML = '';
    Node.hud.innerHTML = '';
    Node.playerRack.innerHTML = '';
    Node.playerHand.innerHTML = '';
    Node.playerControls.innerHTML = '';

    // splice empty sets
    board.forEach((set, index) =>
    {
        if (set.cards.length === 0)
        {
            board.splice(index, 1);
        };
    });

    // verification
    verifySets(board);
    checkIfPlayerPlacedCards(board);

    // sort board cards
    board.forEach(set =>
    {
        Utility.sortByColorAndNumber(set.cards);
    });

    // sort player rack
    Utility.sortByColorAndNumber(returnPlayerRack().cards);

    // draw sets
    board.forEach(set =>
    {
        let newSet = document.createElement('div');
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
    playerHand.forEach(card =>
    {
        Node.playerHand.appendChild(card.render(selectCard));
    });

    // render player rack
    returnPlayerRack().cards.forEach(card =>
    {
        Node.playerRack.appendChild(card.render(selectCard));
    })

    // render hud content
    Node.playerTitle.innerHTML = `${returnPlayerRack().name}`;
    Node.hud.innerHTML = `<div>turn: ${turnCounter}</div>`;

    for (let i = 0; i < playerCount; i++)
    {
        Node.hud.innerHTML += `<div>${playerRacks[i].name}: ${playerRacks[i].cards.length}</div>`;
    }

    // render next turn button
    let nextButton = document.createElement('button');
    nextButton.id = 'button-next-turn'
    nextButton.onclick = () => advanceTurn();
    nextButton.innerHTML += 'next turn';
    Node.playerControls.appendChild(nextButton);
}

/* events */

const addGroup = () =>
{
    board.push(new Set(`set-${Utility.generateId(setIds)}`, playerHand.splice(0, playerHand.length)));
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

        turnCounter += 1;
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
        drawCanvas();
    }
}

const selectCard = (e) => 
{
    e.stopPropagation(); // prevent player from triggering set underneath card

    let targetParent = e.path[1];
    let targetCard;

    if (targetParent.id === 'player-rack')
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
    else if (targetParent.id === 'player-hand')
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

        targetCard.location = 'player-hand';
        playerHand.push(targetCard);
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

initiateDeck(deck);
distributeCards();
drawCanvas();