const generateId = arr =>
{
    let range = 106;
    let r = Math.floor(Math.random() * range);

    if (arr.includes(r))
    {
        if (arr.length <= range)
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
        arr.push(r);
        return r;
    }
}

const returnCurrentPlayerRack = (turnCounter, playerCount) => // todo: "returnCurrentPlayerRack"?
{
    if (playerCount === 1)
    {
        return 0;
    }
    
    if (playerCount === 2)
    {
        if (turnCounter % playerCount === 0)
        {
            return 1;
        }
        else if (turnCounter % playerCount === 1)
        {
            return 0;
        }
    }
    
    if (playerCount === 3)
    {
        if (turnCounter % playerCount === 0)
        {
            return 2;
        }
        else if (turnCounter % playerCount === 2)
        {
            return 1;
        }
        else if (turnCounter % playerCount === 1)
        {
            return 0;
        }
    }
    
    if (playerCount === 4)
    {
        if (turnCounter % playerCount === 0)
        {
            return 3;
        }
        else if (turnCounter % playerCount === 3)
        {
            return 2;
        }
        else if (turnCounter % playerCount === 2)
        {
            return 1;
        }
        else if (turnCounter % playerCount === 1)
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
    generateId,
    returnCurrentPlayerRack,
    sortByColorAndNumber,
}
