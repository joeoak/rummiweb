let deck = new Array(), 
    board = new Array(), 
    playerHand = new Array(), 
    playerRack = new Array(), 
    rowIds = new Array();

let turnCounter;
let playerCount;
let isBoardValid;
let isPlayerPlacedCards;

let _canvas = document.querySelector('#canvas'),
    _board = document.querySelector('#board'),
    _boardRows = document.querySelector('#board-rows'),
    _hud = document.querySelector('#hud');
    _playerTitle = document.querySelector('#player-title');
    _playerHand = document.querySelector('#player-hand'),
    _playerRack = document.querySelector('#player-rack');

const initiateDeck = (deck) => 
{
    let setArr = ['a', 'b'];
    let colorArr = ['black', 'blue', 'orange', 'red'];
    
    for (let i = 0; i < setArr.length; i++) // set
    {
        let set = setArr[i];

        for (let j = 0; j < colorArr.length; j++) // color
        {
            let color = colorArr[j];

            for (let k = 1; k <= 13; k++) // num
            {
                deck.push(
                {
                    color: color,
                    isHeld: false,
                    label: `${color}-${k}-${set}`,
                    num: k,
                    set: set,
                    type: 'num',
                });
            }
        }

        // push jokers
        deck.push(
        {
            color: null,
            isHeld: false,
            label: `joker-${set}`,
            num: null,
            set: set,
            type: 'joker',
        });
    }
}

const distributeCards = () =>
{
    for (let i = 1; i <= playerCount; i++)
    {
        let rack = new Array();

        for (let j = 0; j < 14; j++)
        {
            let r = Math.floor(Math.random() * deck.length);
            let target = deck.splice(r, 1);
            target[0].isHeld = true;
            rack.push(target[0]);
        }

        playerRack.push(
        {
            name: `player ${i}`,
            // player: i,
            rack: rack,
        });
    }
}

const gameStart = () =>
{
    turnCounter = 1;
    playerCount = 4;

    initiateDeck(deck);
    distributeCards();
    drawCanvas();
}

const generateId = (arr) =>
{
    let range = 106; // num of unique ids that can be generated
    let r = Math.floor(Math.random() * range);

    if (arr.includes(r))
    {
        if (arr.length < range) // stops loop if length > range
        {
            return generateId(arr); // generate a new r
        }
        else
        {
            console.log('range met');
            return;
        }
    }
    else
    {
        arr.push(r); // register id
        return r;
    }
}

function isEven(n)
{
    return n % 2 == 0;
}

const returnPlayerRack = () =>
{
    if (playerCount === 2)
    {
        if (turnCounter % playerCount === 0)
        {
            return playerRack[1];
        }
        else if (turnCounter % playerCount === 1)
        {
            return playerRack[0];
        }
    }
    else if (playerCount === 3)
    {
        if (turnCounter % playerCount === 0)
        {
            return playerRack[2];
        }
        else if (turnCounter % playerCount === 2)
        {
            return playerRack[1];
        }
        else if (turnCounter % playerCount === 1)
        {
            return playerRack[0];
        }
    }
    else if (playerCount === 4)
    {
        if (turnCounter % playerCount === 0)
        {
            return playerRack[3];
        }
        else if (turnCounter % playerCount === 3)
        {
            return playerRack[2];
        }
        else if (turnCounter % playerCount === 2)
        {
            return playerRack[1];
        }
        else if (turnCounter % playerCount === 1)
        {
            return playerRack[0];
        }
    }
}

const insertCardElement = (arr, parent, onclickFn) =>
{
    for (let i = 0; i < arr.length; i++)
    {
        let obj = arr[i];
        let newCard = document.createElement('div');
        newCard.id = obj.label;
        newCard.className = 'card';
        newCard.onclick = (e) => onclickFn(e);

        if (obj.isHeld)
        {
            if (parent.classList.contains('row') || parent.id === 'player-hand')
            {
                newCard.classList.add('held');
            }
        }

        if (obj.type === 'num')
        {
            newCard.classList.add(obj.color);
            newCard.innerHTML = `${obj.num}`;
        }
        else if (obj.type === 'joker')
        {
            newCard.innerHTML = `🙂`;
        }

        parent.appendChild(newCard);
    }
}

const isAllEqual = (arr) =>
{
    return arr.every(val => val.num === arr[0].num);
}

const isDifferentColors = (arr) =>
{
    // count amounts of each color
    let counter = {};
    arr.forEach(val =>
    {
        counter[val.color] = (counter[val.color] || 0) + 1;
    });

    return Object.values(counter).every(val => val <= 1); // check if any amount > 1
}

const isSameColors = (arr) =>
{
    return arr.every(val => val.color === arr[0].color);
}

const isConsecutive = (arr) =>
{
    let sequence = new Array(),
        differences = new Array();

    arr.forEach(val =>
    {
        sequence.push(val.num); // build new array of numbers
    })

    sequence.sort((a, b) =>
    {
        return a - b; // sort new array of numbers
    });

    sequence.forEach((val, index) =>
    {
        if (index > 0)
        {
            differences.push(val - sequence[index - 1]); // build new array of differences
        }
    });

    return differences.every(val => val === 1); // check if any differences > 1
}

const verifyRows = () =>
{
    isBoardValid = true; // assume true to start

    board.forEach((row) =>
    {
        if (row.cards.length < 3)
        {
            row.isValid = false;
            isBoardValid = false;
        }
        else
        {
            if (isDifferentColors(row.cards)) // if different colors, one of each
            {
                if (isAllEqual(row.cards)) // if all same numbers
                {
                    row.isValid = true;
                }
                else
                {
                    row.isValid = false;
                    isBoardValid = false;
                }
            }
            else if (isSameColors(row.cards)) // if all same colors
            {
                if (isConsecutive(row.cards)) // if consecutive
                {
                    row.isValid = true;
                }
                else
                {
                    row.isValid = false;
                    isBoardValid = false;
                }
            }
            else
            {
                row.isValid = false;
                isBoardValid = false;
            }
        }
    });
}

const checkIfPlayerPlacedCards = () =>
{
    isPlayerPlacedCards = false; // assume false to start

    board.forEach(row =>
    {
        row.cards.forEach(card =>
        {
            if (card.isHeld === true)
            {
                isPlayerPlacedCards = true;
            }
        })
    });
}

const drawCanvas = () =>
{
    _boardRows.innerHTML = '';
    _hud.innerHTML = '';
    _playerRack.innerHTML = '';
    _playerHand.innerHTML = '';

    verifyRows();
    // console.log({isBoardValid});

    checkIfPlayerPlacedCards();
    // console.log({isPlayerPlacedCards});

    for (let i = 0; i < board.length; i++) // sort board cards
    {
        for (let j = 0; j < board[i].cards.length; j++)
        {
            board[i].cards.sort(function(a, b) // sort by color alphabetically
            {
                if (a.color < b.color)
                {
                    return -1;
                }
                if (a.color > b.color)
                {
                    return 1;
                }

                return 0;
            });

            board[i].cards.sort(function(a, b) // sort by number
            {
                return a.num - b.num;
            });
        }
    }

    for (let i = 0; i < board.length; i++) // clear empty rows
    {
        if (board[i].cards.length === 0)
        {
            board.splice(i, 1);
        };
    }

    for (let i = 0; i < board.length; i++) // draw rows
    {
        let targetRow = board[i];
        let newRow = document.createElement('div');
        newRow.id = targetRow.id;
        newRow.className = 'row';

        if (!targetRow.isValid)
        {
            newRow.classList.add('invalid');
        }

        newRow.onclick = (e) => selectRow(e);
        insertCardElement(targetRow.cards, newRow, selectCard);
        _boardRows.appendChild(newRow);
    }

    // draw add button
    let addButton = document.createElement('div');
    addButton.id = 'new-row'
    addButton.innerHTML += `<button id="button-new-row" onclick="addGroup()">➕</button>`;
    _boardRows.appendChild(addButton);

    for (let i = 0; i < returnPlayerRack().rack.length; i++) // sort rack cards
    {
        returnPlayerRack().rack.sort(function(a, b) // sort by color alphabetically
        {
            if (a.color < b.color)
            {
                return -1;
            }
            if (a.color > b.color)
            {
                return 1;
            }

            return 0;
        });

        returnPlayerRack().rack.sort(function(a, b) // sort by number
        {
            return a.num - b.num;
        });
    }

    insertCardElement(playerHand, _playerHand, deselectCard); // draw player hand    
    insertCardElement(returnPlayerRack().rack, _playerRack, selectCard); // draw player rack

    _hud.innerHTML = `turn: ${turnCounter}`;

    for (let i = 0; i < playerCount; i++)
    {
        _hud.innerHTML += `<br />🐶 ${playerRack[i].name}: ${playerRack[i].rack.length}`;
    }

    _playerTitle.innerHTML = `🐶 ${returnPlayerRack().name}`;
}

// events

const drawCard = () =>
{
    if (deck.length > 0)
    {
        let r = Math.floor(Math.random() * deck.length);
        let target = deck.splice(r, 1);
        target[0].isHeld = true;
        returnPlayerRack().rack.push(target[0]);
        drawCanvas();
    }
}

const selectCard = (e) => 
{
    e.stopPropagation(); // prevent player from triggering row underneath card

    let targetLabel = e.target.id;
    let targetParent = e.path[1];

    if (targetParent.id === 'player-rack') // if in the player rack
    {
        let target;

        for (let i = 0; i < returnPlayerRack().rack.length; i++)
        {
            if (returnPlayerRack().rack[i].label === targetLabel)
            {
                target = returnPlayerRack().rack.splice(i, 1);      
            };
        }

        playerHand.push(target[0]);
    }
    else if (targetParent.classList.contains('row')) // if in a row
    {
        let target;

        for (let i = 0; i < board.length; i++)
        {
            let row = board[i];

            if (row.id === targetParent.id)
            {
                for (let j = 0; j < row.cards.length; j++)
                {
                    if (row.cards[j].label === targetLabel)
                    {
                        target = row.cards.splice(j, 1);
                    }
                }
            }
        }

        playerHand.push(target[0]);
    }

    drawCanvas();
}

const deselectCard = (e) => 
{
    let targetLabel = e.target.id;

    for (let i = 0; i < playerHand.length; i++)
    {
        if (playerHand[i].label === targetLabel && playerHand[i].isHeld === true)
        {
            let target = playerHand.splice(i, 1);
            returnPlayerRack().rack.push(target[0]);
            drawCanvas();
        }
    }
}

const selectRow = (e) =>
{
    let targetRowId = e.target.id;
    let target = playerHand.splice(0, playerHand.length);

    for (let i = 0; i < board.length; i++)
    {
        let row = board[i];

        if (row.id === targetRowId)
        {
            for (let j = 0; j < target.length; j++)
            {
                row.cards.push(target[j]);
            }
        }
    }

    drawCanvas();
}

const addGroup = () =>
{
    let newRow = 
    {
        id: `row-${generateId(rowIds)}`,
        isValid: true,
        cards: [],
    }

    let target = playerHand.splice(0, playerHand.length);

    for (let i = 0; i < target.length; i++)
    {
        newRow.cards.push(target[i]);
    } 

    board.push(newRow);
    drawCanvas();
}

const advanceTurn = () =>
{
    if (isBoardValid === true && playerHand.length <= 0)
    {
        if (isPlayerPlacedCards)
        {
            // set all cards to isHeld = false
            for (let i = 0; i < board.length; i++)
            {
                let row = board[i].cards;

                for (let j = 0; j < row.length; j++)
                {
                    let card = row[j];

                    if (card.isHeld === true)
                    {
                        card.isHeld = false;
                    }
                }
            }
        }
        else
        {
            drawCard();
        }

        turnCounter += 1;
        drawCanvas();
    }
}

gameStart();