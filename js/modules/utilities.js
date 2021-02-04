const generateId = arr =>
{
    let range = 106;
    let r = Math.floor(Math.random() * range);

    if (arr.includes(r))
    {
        if (arr.length < range)
        {
            return generateId(arr);
        }
        else
        {
            console.log('range met');
            return;
        }
    }
    else
    {
        arr.push(r);
        return r;
    }
}

const sortByColorAndNumber = arr =>
{
    arr.forEach(() =>
    {
        arr.sort(function(a, b) // sort by color, alphabetically
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

        arr.sort(function(a, b) // sort by number, ascending
        {
            return a.num - b.num;
        });
    });
}

export { generateId, sortByColorAndNumber };