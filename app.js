const deck = document.getElementById("deck");
const instructions = document.getElementById("instructions");
const instructions2 = document.getElementById("instructions-2");
const cardsRemaining = document.getElementById("cards-remaining");
const p1Hand = document.getElementById("p1-hand");
const p2Hand = document.getElementById("p2-hand");
const continueBtn = document.getElementById("continue-btn");
const p1CardCntP = document.getElementById("p1-card-cnt");
const p2CardCntP = document.getElementById("p2-card-cnt");
const placeHolder = document.getElementById("place-holder");
const p1Score = document.getElementById("p1-score");
const p2Score = document.getElementById("p2-score");
//this function updates document.getElementById("instructions");
function updateInstructions(str) {
    instructions.textContent = str;
}

let cardsRemainingVal = 52;

//this function updates document.getElementById("cards-remaining");
function updateCardsRemaining() {
    cardsRemaining.textContent = `Cards Remaining = ${cardsRemainingVal}`;
}

let deckId;

//this function executes when webpage is loaded
function init() {
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1").then((response) => response.json()).then((response) => {
        deckId = response.deck_id;
    });

    instructions.textContent = "Click the deck above to deal cards";
    updateCardsRemaining();
    deck.addEventListener("click", dealCards);
}

//Object is used to map a card's image to the value. 
//Used when iterating through card image elements and comparing their values to other values
const cardImageToRankMap = {};
//Both objects are used to count the number of cards of each rank that each player has
const p1CardCnt = { "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "JACK": 0, "QUEEN": 0, "KING": 0, "ACE": 0 };
const p2CardCnt = { "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "JACK": 0, "QUEEN": 0, "KING": 0, "ACE": 0 };

function updateScoreBoard() {
    let keys = Object.keys(p1CardCnt);
    let str = "Player 1 Card Count: ";
    //list of player 1's book ranks
    let bookRanks = [];
    keys.forEach((key) => {
        if (p1CardCnt[key] == 3) {
            bookRanks.push(key);
        }
        str += key + " : " + p1CardCnt[key] + ", ";
    })
    p1CardCntP.textContent = str;
    keys = Object.keys(p2CardCnt);
    str = "Player 2 Card Count: ";
    bookRanks = [];
    keys.forEach((key) => {
        if (p2CardCnt[key] == 3) {
            bookRanks.push(key);
        }
        str += key + " : " + p2CardCnt[key] + ", ";
    })
    p2CardCntP.textContent = str;
}

// this function triggers when clicking document.getElementById("deck");

function dealCards() {
    deck.style = "box-shadow:none;cursor:default";
    deck.removeEventListener("click", dealCards)
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=14`).then((response) => response.json())
        .then((responseObject) => {
            //helper variable for dealing cards to each player in an alternating fashion
            let i = 0;
            responseObject.cards.forEach((card) => {
                //creates image element from card
                let img = document.createElement('img');
                img.setAttribute('src', card.image);

                //maps the cardimage to the card value
                cardImageToRankMap[card.image] = card.value;

                //The if-else statement is used to deal a card to each player in an alternating fashion
                if (i % 2 == 0) {
                    img.style = "margin-right:30px; margin-bottom:30px;"
                    p1CardCnt[card.value] = p1CardCnt[card.value] + 1;
                    p1Hand.appendChild(img);
                } else {
                    img.style = " margin-left:30px;margin-bottom:30px;"
                    p2CardCnt[card.value] = p2CardCnt[card.value] + 1;
                    p2Hand.appendChild(img);
                }
                i++;
            })
            cardsRemainingVal -= 14;
            updateCardsRemaining();
            updateScoreBoard()
                // instructions.textContent = "";
                //updateP1CardCnt();
                //updateP2CardCnt();
                // continueBtn.style.visibility = "visible";
                // continueBtn.style.boxShadow = "0px 0px 10px 10px blue";
                // continueBtn.highlightP1CardsParam = true;
                // continueBtn.addEventListener("click", p1ChooseCard)
            p1ChooseCard();
        });
}

function p1ChooseCard() {
    continueBtn.removeEventListener("click", p1ChooseCard);
    continueBtn.style.visibility = "hidden";
    instructions2.textContent = "";
    instructions.textContent = "Choose a card to ask for";
    highlightP1Cards(true);
}

function highlightP1Cards(turnOn) {
    let nodes = p1Hand.childNodes;
    //check if empty{
    if (nodes.length == 0) {
        p1DrawOneCard();
    }

    if (turnOn === true) {
        nodes.forEach((card) => {
            card.style.boxShadow = "0px 0px 5px 5px blue";
            card.style.cursor = "pointer";
            card.addEventListener("click", p1CheckP2Cards);
        })
    } else {
        nodes.forEach((card) => {
            card.style.boxShadow = "none";
            card.style.cursor = "default";
            card.removeEventListener("click", p1CheckP2Cards);
        })
    }
}

function p1DrawOneCard() {
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`).then(response => response.json()).then((responseObject) => {
        cardsRemainingVal -= 1;
        updateCardsRemaining();
        let card = responseObject.cards[0];
        cardImageToRankMap[card.image] = card.value;
        updateInstructions(`You drew the card below`)
        placeHolder.style.backgroundImage = `url(${card.image})`;
        let tempfunc;
        continueBtn.visibility="visible";
        continueBtn.boxShadow="0px 0px 5px 5px blue";
        continueBtn.addEventListener("click", tempfunc = () => {
            continueBtn.removeEventListener("click", tempfunc);
            placeHolder.style.backgroundImage = `none`;
            let img = document.createElement('img');
            img.setAttribute('src', card.image);
            img.style.marginBottom = "30px";
            img.style.marginRight = "30px";
            p1Hand.appendChild(img);
            p1CardCnt[card.value]++;
            updateScoreBoard();
            continueBtn.visibility="invisible";
        });
    });
}

function p1CheckP2Cards() {

    highlightP1Cards(false);
    continueBtn.style.visibility = "visible";
    continueBtn.style.boxShadow = "0px 0px 10px 10px blue"
    let rank = cardImageToRankMap[this.currentSrc];
    found = false;
    let nodes = p2Hand.childNodes;
    let cardsFound = 0;
    cardsToTransfer = [];
    nodes.forEach((card) => {
        if (cardImageToRankMap[card.currentSrc] === rank) {
            found = true;
            cardsToTransfer.push(card);
            card.style.boxShadow = "0px 0px 10px 10px red";
            cardsFound++;
        }
    });

    continueBtn.cardsToTransfer = cardsToTransfer;

    if (found == true) {
        updateInstructions(`Player 1 receives ${cardsFound} card(s)`);
        p1CardCnt[rank] = p1CardCnt[rank] + cardsFound;
        p2CardCnt[rank] = p2CardCnt[rank] - cardsFound;
        continueBtn.addEventListener("click", p1TransferCards);
    } else {
        updateInstructions(`Player 2 has no cards of that rank. Go Fish!`);
        continueBtn.addEventListener("click", p1GoFish);
    }
}

function p1TransferCards(event) {
    continueBtn.removeEventListener("click", p1TransferCards);
    updateScoreBoard();
    let cardsToTransfer = event.currentTarget.cardsToTransfer;
    let nodes = p2Hand.childNodes;

    cardsToTransfer.forEach((card) => {
        card.style.boxShadow = "none";
        p2Hand.removeChild(card);
        p1Hand.appendChild(card);
    });
    instructions.textContent = `Now checking for player 1 books.`
    continueBtn.mode = 0;
    continueBtn.addEventListener("click", p1CheckForBooks);
}

let p1ScoreVal = 0;

function p1CheckForBooks(event) {
    let mode = event.currentTarget.mode;
    continueBtn.removeEventListener("click", p1CheckForBooks);
    let nodes = p1Hand.childNodes;
    let nodesCpy = [];
    nodes.forEach((card) => nodesCpy.push(card));
    flag = false;
    nodesCpy.forEach((card) => {
        let rank = cardImageToRankMap[card.getAttribute("src")];
        if (p1CardCnt[rank] == 4) {
            flag = true;
            p1Hand.removeChild(card);
        }
    });
    if (flag == true) {
        p1ScoreVal++;
        p1Score.textContent = `Score: ${p1ScoreVal}`;
    }

    if (mode == 0) {
        if (flag == true) {
            updateInstructions(`Player 1 has scored one book.`);
        } else {
            updateInstructions(`Player 1 has scored no books.`);
        }
        continueBtn.addEventListener("click", p1ChooseCard);
    } else if (mode == 1) {
        if (flag == true) {
            updateInstructions(`Player 1 has scored one book.`);
        } else {
            updateInstructions(`Player 1 has scored no books.\n It is now player 2's turn.`);
        }
        continueBtn.addEventListener("click", p2ChooseCard);
    }

}

function p1GoFish() {
    continueBtn.removeEventListener("click", p1GoFish);
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`).then(response => response.json()).then((responseObject) => {
        cardsRemainingVal -= 1;
        updateCardsRemaining();
        let card = responseObject.cards[0];
        cardImageToRankMap[card.image] = card.value;
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
            updateScoreBoard();
            instructions.textContent = `Now checking for player 1 books.`
            continueBtn.mode = 1;
            continueBtn.addEventListener("click", p1CheckForBooks);
        });
    });
}

function p2ChooseCard() {
    continueBtn.removeEventListener("click", p2ChooseCard);
    let nodes = p2Hand.childNodes;
    let randomIdx = Math.floor(Math.random() * nodes.length);
    let rank = cardImageToRankMap[nodes[randomIdx].currentSrc];
    updateInstructions(`Player 2 asks for a ${rank}`);
    continueBtn.rank = rank;
    continueBtn.addEventListener("click", p2CheckP1Cards)
}

function p2CheckP1Cards(event) {
    continueBtn.removeEventListener("click", p2CheckP1Cards);
    let rank = event.currentTarget.rank;
    let found = false;
    let nodes = p1Hand.childNodes;
    let cardsFound = 0;
    cardsToTransfer = []
    nodes.forEach((card) => {
        let currCardRank = cardImageToRankMap[card.currentSrc]
        if (currCardRank === rank) {
            found = true;
            cardsToTransfer.push(card);
            card.style.boxShadow = "0px 0px 10px 10px red";
            cardsFound++;
        }
    });
    continueBtn.cardsToTransfer = cardsToTransfer;

    if (found == true) {
        updateInstructions(`Player 2 receives ${cardsFound} card(s)`);
        p1CardCnt[rank] = p1CardCnt[rank] - cardsFound;
        p2CardCnt[rank] = p2CardCnt[rank] + cardsFound;
        continueBtn.addEventListener("click", p2TransferCards);
    } else {
        updateInstructions(`Player 1 has no cards of that rank. Go Fish!`);
        continueBtn.addEventListener("click", p2GoFish);
    }
}

function p2TransferCards(event) {

    continueBtn.removeEventListener("click", p2TransferCards);
    updateScoreBoard();
    let cardsToTransfer = event.currentTarget.cardsToTransfer;
    let nodes = p2Hand.childNodes;
    cardsToTransfer.forEach((card) => {
        card.style.boxShadow = "none";
        p1Hand.removeChild(card);
        p2Hand.appendChild(card);
    });
    instructions.textContent = `Now checking for player 2 books.`
        // updateP1CardCnt();
        // updateP2CardCnt();
    continueBtn.mode = 0;
    continueBtn.addEventListener("click", p2CheckForBooks);
}

let p2ScoreVal = 0;

function p2CheckForBooks(event) {
    let mode = event.currentTarget.mode;
    continueBtn.removeEventListener("click", p2CheckForBooks);
    let nodes = p2Hand.childNodes;
    let nodesCpy = [];
    nodes.forEach((card) => nodesCpy.push(card));
    flag = false;
    nodesCpy.forEach((card) => {
        let rank = cardImageToRankMap[card.getAttribute("src")];
        if (p2CardCnt[rank] == 4) {
            flag = true;
            p2Hand.removeChild(card);
        }
    });

    if (flag == true) {
        p2ScoreVal++;
        p2Score.textContent = `Score: ${p2ScoreVal}`;
    }
    if (mode == 0) {
        if (flag == true) {
            updateInstructions(`Player 2 has scored one book.`);
        } else {
            updateInstructions(`Player 2 has scored no books.`);
        }
        continueBtn.addEventListener("click", p2ChooseCard);
    } else if (mode == 1) {
        if (flag == true) {
            updateInstructions(`Player 2 has scored one book.`);
        } else {
            updateInstructions(`Player 2 has scored no books.\n It is now player 1's turn.`);
        }
        continueBtn.addEventListener("click", p1ChooseCard);
    }
}

function p2GoFish() {
    continueBtn.removeEventListener("click", p2GoFish);
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`).then(response => response.json()).then((responseObject) => {
        cardsRemainingVal -= 1;
        updateCardsRemaining();
        let card = responseObject.cards[0];
        cardImageToRankMap[card.image] = card.value;
        updateInstructions(`Player 2 drew the card below`)
        placeHolder.style.backgroundImage = `url(${card.image})`;
        let tempfunc;
        continueBtn.addEventListener("click", tempfunc = () => {
            continueBtn.removeEventListener("click", tempfunc);
            placeHolder.style.backgroundImage = `none`;
            let img = document.createElement('img');
            img.setAttribute('src', card.image);
            img.style.marginBottom = "30px";
            img.style.marginLeft = "30px";
            p2Hand.appendChild(img);
            p2CardCnt[card.value]++;
            updateScoreBoard();
            instructions.textContent = `Now checking for player 2 books.`
            continueBtn.mode = 1;
            continueBtn.addEventListener("click", p2CheckForBooks);


        });
    });
}


init();