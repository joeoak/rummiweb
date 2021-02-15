const GameState = require('./game-state');

const generateSetId = () =>
{
    let range = 106;
    let r = Math.floor(Math.random() * range);

    if (GameState.setIdArr.includes(r))
    {
        if (GameState.setIdArr.length <= range)
        {
            return generateId(arr);
        }
        else
        {
            console.log('range exceeded');
            return;
        }
    }
    else
    {
        GameState.setIdArr.push(r);
        return r;
    }
}

const returnCurrentPlayerIndex = () =>
{
    if (GameState.playerCount === 1)
    {
        return 0;
    }
    
    if (GameState.playerCount === 2)
    {
        if (GameState.turnCounter % GameState.playerCount === 0)
        {
            return 1;
        }
        else if (GameState.turnCounter % GameState.playerCount === 1)
        {
            return 0;
        }
    }
    
    if (GameState.playerCount === 3)
    {
        if (GameState.turnCounter % GameState.playerCount === 0)
        {
            return 2;
        }
        else if (GameState.turnCounter % GameState.playerCount === 2)
        {
            return 1;
        }
        else if (GameState.turnCounter % GameState.playerCount === 1)
        {
            return 0;
        }
    }
    
    if (GameState.playerCount === 4)
    {
        if (GameState.turnCounter % GameState.playerCount === 0)
        {
            return 3;
        }
        else if (GameState.turnCounter % GameState.playerCount === 3)
        {
            return 2;
        }
        else if (GameState.turnCounter % GameState.playerCount === 2)
        {
            return 1;
        }
        else if (GameState.turnCounter % GameState.playerCount === 1)
        {
            return 0;
        }
    }
}

const sortByColorAndNumber = arr =>
{
    arr.forEach(() =>
    {
        // sort by color (alphabetically)
        arr.sort(function(a, b)
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

        // sort by number (ascending)
        arr.sort(function(a, b)
        {
            return a.num - b.num;
        });
    });
}

module.exports =
{
    generateSetId,
    returnCurrentPlayerIndex,
    sortByColorAndNumber,
}
