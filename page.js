function sendreq(data) {
    console.log(data);

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    };

    fetch("/api", options).then(response => {

        console.log(response);
    });
}


function buy() {

    var coin = document.getElementById("buycoin").value;
    var vscoin = document.getElementById("buyvscoin").value;
    var amount = document.getElementById("buyamount").value;

    data = { coin, vscoin, amount }

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    };

    fetch("/api/buy", options).then(response => {
        console.log(response);
    });
}
function sell() {

    var coin = document.getElementById("sellcoin").value;
    var vscoin = document.getElementById("sellvscoin").value;
    var amount = document.getElementById("sellamount").value;

    data = { coin, vscoin, amount }

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    };

    fetch("/api/sell", options).then(response => {
        console.log(response);
    });
}
async function getData() {
    const response = await fetch('/api');
    const data = await response.json();
    console.log(json);
}

async function getwallet() {

    const response = await fetch('/api/getwallet');
    const data = await response.json();

    console.log(data);

    for (const coin in data.coin) {
        console.log(`${coin}: ${data.coin[coin]}`);
        const coinname = document.createElement('p');
        coinname.textContent = `${coin}: ${data.coin[coin]}`;
        document.body.append(coinname);

    }
    console.log();

}

async function botupdate(indput,value){    

    data={indput,value}

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    };

    fetch("/api/botupdate", options).then(response => {
        console.log(response);
    });
}



async function syncbotstate() {
    const response = await fetch('/api/botstate');
    const data = await response.json();
    console.log(data);

    var onfff = document.getElementById('botonoff');

    if (data == false) {
        onfff.setAttribute("unchecked", "")
    }
    else {
        onfff.setAttribute("checked", "")
    }

    
}
async function uptatebotstate(){  
    const response = await fetch('/api/botstate');
    const pik = await response.json();
    console.log(pik);

    if(pik==false){
        data=true;
    }
    else{
        data=false;
    }
    await botupdate("inuse",data)
    }