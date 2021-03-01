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

function PlayerHand(index, name)
{
    this.cards = new Array();
    this.index = index;
    this.name = name;
}

function PlayerRack(cards, index, name, score)
{
    this.cards = cards;
    this.index = index;
    this.name = name;
    this.score = score;
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
    PlayerHand,
    PlayerRack,
    Set,
}
