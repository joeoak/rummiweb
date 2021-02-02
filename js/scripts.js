let deck = new Array();
let board = new Array();
let playerHand = new Array();
let playerRack = new Array();
let rowIds = new Array();
let _canvas = document.querySelector('#canvas');
let _board = document.querySelector('#board');
let _boardRows = document.querySelector('#board-rows');
let _playerHand = document.querySelector('#player-hand');
let _playerRack = document.querySelector('#player-rack');

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
            label: `joker-${set}`,
            num: null,
            set: set,
            type: 'joker',
        });
    }
}

function generateId()
{
    let range = 106; // num of unique ids that can be generated
    let r = Math.floor(Math.random() * range);

    if (rowIds.includes(r))
    {
        if (rowIds.length < range) // stops loop if length > range
        {
            return generateId(); // generate a new r
        }
        else
        {
            console.log('range met');
            return;
        }
    }
    else
    {
        rowIds.push(r); // register id
        return r;
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

const drawCanvas = () =>
{
    _boardRows.innerHTML = '';
    _playerRack.innerHTML = '';
    _playerHand.innerHTML = '';

    for (let i = 0; i < board.length; i++) // clear empty rows
    {
        if (board[i].cards.length === 0)
        {
            board.splice(i, 1);
        };
    }

    for (let i = 0; i < board.length; i++)
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

    for (let i = 0; i < board.length; i++)
    {
        let targetRow = board[i];
        let newRow = document.createElement('div');
        newRow.id = targetRow.id;
        newRow.className = 'row';
        newRow.onclick = (e) => selectRow(e);
        insertCardElement(targetRow.cards, newRow, selectCard);
        _boardRows.appendChild(newRow);
    }

    let addButton = document.createElement('div');
    addButton.id = 'new-row'
    addButton.innerHTML += `<button id="button-new-row" onclick="addGroup()">+</button>`;
    _boardRows.appendChild(addButton);

    insertCardElement(playerHand, _playerHand, deselectCard);
    insertCardElement(playerRack, _playerRack, selectCard);
}

const distributeCards = () =>
{
    for (let i = 0; i < 14; i++)
    {
        let r = Math.floor(Math.random() * deck.length);
        let target = deck.splice(r, 1);
        playerRack.push(target[0]);
    }
}

const drawCard = () =>
{
    if (deck.length > 0)
    {
        let r = Math.floor(Math.random() * deck.length);
        let target = deck.splice(r, 1);
        playerRack.push(target[0]);
        drawCanvas();
    }
}

const selectCard = (e) => 
{
    e.stopPropagation();

    let targetLabel = e.target.id;
    let targetParent = e.path[1];

    if (targetParent.id === 'player-rack')
    {
        let target;

        for (let i = 0; i < playerRack.length; i++)
        {
            if (playerRack[i].label === targetLabel)
            {
                target = playerRack.splice(i, 1);      
            };
        }

        playerHand.push(target[0]);
    }
    else if (targetParent.className === 'row')
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

const deselectCard = () => 
{
    let target = playerHand.splice(0, 1);
    playerRack.push(target[0]);

    drawCanvas();
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
        id: `row-${generateId()}`,
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

initiateDeck(deck);
distributeCards();
drawCanvas();