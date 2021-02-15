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

export { generateId, sortByColorAndNumber };