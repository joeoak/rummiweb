function Card(color, id, num, type)
{
    this.color = color;
    this.isHeld = false;
    this.id = id;
    this.location = 'player-rack';
    this.num = num;
    this.type = type;
}

function Cell()
{
    this.type = 'cell';
}

function PlayerRack(cards, name, index)
{
    this.cards = cards;
    this.name = name;
    this.index = index;
}

function Set(cards, id)
{
    this.cards = cards; 
    this.id = id;
    this.isValid = false;
}

module.exports =
{
    Card,
    Cell,
    PlayerRack,
    Set,
}
