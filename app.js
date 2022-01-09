const deck = document.getElementById("deck");
const cardsRemaining = document.getElementById("cards-remaining");
const instructions = document.getElementById("instructions");
const p1Hand = document.getElementById("p1-hand");
const p2Hand = document.getElementById("p2-hand");
const continueBtn = document.getElementById("continue-btn");
const p1CardCntP = document.getElementById("p1-card-cnt");
const p2CardCntP = document.getElementById("p2-card-cnt");
const placeHolder = document.getElementById("place-holder");
let deckId;
let cardsRemainingVal = 52;

function init() {
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1").then((response) => response.json()).then((response) => {
        deckId = response.deck_id;
        //console.log(deckId);
    });
    updateCardsRemaining();
    continueBtn.style = "display:none";
    instructions.textContent = "Click the deck above to deal cards";
    deck.addEventListener("click", dealCards);
    deck.style = "cursor:pointer;"

}

function updateInstructions(str) {
    instructions.textContent = str;
}

function updateCardsRemaining() {
    cardsRemaining.textContent = `Cards Remaining = ${cardsRemainingVal}`;
}
let dict = {};
let p1CardCnt = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "JACK": 0, "QUEEN": 0, "KING": 0, "ACE": 0 };
let p2CardCnt = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "JACK": 0, "QUEEN": 0, "KING": 0, "ACE": 0 };
//phase 1: The deck is clicked and cards are dealt
function dealCards() {
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=14`).then((response) => response.json())
        .then((responseObject) => {
            let i = 0;
            responseObject.cards.forEach((card) => {
                //console.log(card);
                let img = document.createElement('img');
                //map img src to card value
                img.setAttribute('src', card.image);
                dict[card.image] = card.value;
                if (i % 2 == 0) {
                    img.style = "margin-right:30px; margin-bottom:30px;"
                    p1CardCnt[card.value] = 1;
                    p1Hand.appendChild(img);
                } else {
                    img.style = " margin-left:30px;margin-bottom:30px;"
                    p2CardCnt[card.value] = 1;
                    p2Hand.appendChild(img);
                }
                i++;
            })
            cardsRemainingVal -= 14;
            updateCardsRemaining();
            instructions.textContent = "Choose a card rank to ask for";
            //remove styling and click function  for deck
            deck.style = "box-shadow:none;cursor:default";
            deck.removeEventListener("click", dealCards)
            updateP1(true);
            updateP1CardCnt();
            updateP2CardCnt()
        });
}

function updateP2CardCnt() {
    let keys = Object.keys(p2CardCnt);
    let str = "Player 2 Card Count: ";
    keys.forEach((key) => {
        str += key + " : " + p2CardCnt[key] + ", ";
    })
    p2CardCntP.textContent = str;
}

function updateP1CardCnt() {
    let keys = Object.keys(p1CardCnt);
    let str = "Player 1 Card Count: ";
    keys.forEach((key) => {
        str += key + " : " + p1CardCnt[key] + ", ";
    })
    p1CardCntP.textContent = str;
}

function updateP1(turnOn) {
    let nodes = p1Hand.childNodes;
    if (turnOn === true) {
        nodes.forEach((card) => {
            card.style = " margin-right:30px; margin-bottom:30px; box-shadow: 0px 0px 5px 5px blue;";
            card.style.cursor = "pointer";
            card.addEventListener("click", askForCard);
        })
    } else {
        nodes.forEach((card) => {
            card.style = " margin-right:30px; margin-bottom:30px; box-shadow: none;";
            card.style.cursor = "default";
            card.removeEventListener("click", askForCard);
        })
    }
}


//phase 2a: player 1 chooses a card to ask for and hits continue
function askForCard() {
    updateP1(false);
    updateInstructions(`You requested the card below`);
    placeHolder.style.backgroundImage = `url(${this.currentSrc})`
    continueBtn.style.display = "block";
    continueBtn.style.boxShadow = "0px 0px 10px 10px blue"
    continueBtn.rank = dict[this.currentSrc];
    continueBtn.addEventListener("click", checkP2Cards)
}

//phase 2b: check player 2 cards
function checkP2Cards(event) {
    placeHolder.style.backgroundImage = `none`;
    let rank = event.currentTarget.rank;
    found = false;
    let nodes = p2Hand.childNodes;
    let cardsFound = 0;
    continueBtn.imgSrcs = [];
    nodes.forEach((card) => {
        if (dict[card.currentSrc] === rank) {
            found = true;
            card.style.boxShadow = "0px 0px 10px 10px red";
            cardsFound++;
            continueBtn.imgSrcs.push(card.currentSrc);
        }
    });
    p1CardCnt[rank] = p1CardCnt[rank] + cardsFound;
    p2CardCnt[rank] = p2CardCnt[rank] - 1;

    //if found is true press continue button
    continueBtn.removeEventListener("click", checkP2Cards);

    if (found == true) {
        updateInstructions(`Player 1 has received ${cardsFound} card(s)`);
        continueBtn.addEventListener("click", chooseCard);
    } else {
        updateInstructions(`Player 2 has no cards of that rank. Go Fish!`);
        continueBtn.addEventListener("click", p1GoFish);
    }
}

function checkForBooks() {

}

function p1GoFish() {
    continueBtn.removeEventListener("click", p1GoFish);
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`).then(response => response.json()).then((responseObject) => {
        cardsRemainingVal -= 1;
        updateCardsRemaining();
        let card = responseObject.cards[0];
        dict[card.image] = card.value;
        //map img src to card value
        updateInstructions(`You drew the card below`)
        placeHolder.style.backgroundImage = `url(${card.image})`;
        let tempfunc;
        continueBtn.addEventListener("click", tempfunc = () => {
            continueBtn.removeEventListener("click", tempfunc);
            placeHolder.style.backgroundImage = `none`;
            let img = document.createElement('img');
            img.setAttribute('src', card.image);
            img.style.marginBottom = "30px";
            img.style.marginRight = "30px";
            p1Hand.appendChild(img);
            p1CardCnt[card.value]++;
            updateP1CardCnt();
            updateInstructions(`It is now player 2's turn`);
                //player 2 turn

        });
    });
}

function player2turn() {
    
}

function chooseCard(event) {
    continueBtn.removeEventListener("click", chooseCard);
    instructions.textContent = "Choose a card rank to ask for";
    continueBtn.style.boxShadow = "none";
    placeHolder.style.backgroundImage = `none`;
    continueBtn.style.display = "none";
    updateP1CardCnt();
    updateP2CardCnt();
    addP1(event)
    removeP2(event);
    checkForBooks(); //IMPORTANT
    updateP1(true);
}

function addP1(event) {
    let imgSrcs = event.currentTarget.imgSrcs;
    imgSrcs.forEach((imgSrc) => {
        let img = document.createElement('img');
        img.setAttribute('src', imgSrc);
        img.style.marginBottom = "30px";
        p1Hand.appendChild(img);
    })

}

function removeP2(event) {
    let imgSrcs = event.currentTarget.imgSrcs;
    let nodes = p2Hand.childNodes;
    let nodesCpy = [];
    nodes.forEach((node) => nodesCpy.push(node));
    nodesCpy.forEach((card) => {
        if (imgSrcs.includes(card.currentSrc)) {
            p2Hand.removeChild(card);
        }
    })
    event.currentTarget.imgSrcs = [];
}
init();