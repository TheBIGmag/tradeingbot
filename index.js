const { ressponse, response } = require('express');
const express = require('express');
const app = express();

app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));


app.post("/api", function (req, response) {
  console.log("Requst: ");
  console.log(req.body);
  response.json(req.body);

  if (req.body.indput == "buy") {
    sell("cardano", "usd", 250)
  }

});

app.get("/api", (request, response) => {
  response.json({ test: 123 });

});

app.post("/api/buy", function (req, response) {

  console.log("Requst: ");
  console.log(req.body);
  response.json(req.body);

  buyreqcoin = req.body.coin;
  buyreqvscoin = req.body.vscoin;
  buyreqamount = req.body.amount;

  buy(buyreqcoin, buyreqvscoin, parseFloat(buyreqamount));

});

app.post("/api/sell", function (req, response) {

  console.log("Requst: ");
  console.log(req.body);
  response.json(req.body);

  sellreqcoin = req.body.coin;
  sellreqvscoin = req.body.vscoin;
  sellreqamount = req.body.amount;

  sell(sellreqcoin, sellreqvscoin, parseFloat(sellreqamount));
});

app.post("/api/botupdate", function (req, response) {
  console.log("Requst: ");
  console.log(req.body);
  response.json(req.body);

  wirtebotdata(req.body.indput,req.body.value)
});


app.get('/api/getwallet', function (req, response) {
  response.send(readwallet());
})

app.get("/api/buy", (request, response) => {
  response.json({ test: 123 });

});

app.get("/api/botstate", (request, response) => {
  response.send(readbotdata("inuse"));
});




const axios = require('axios');
const fs = require('fs');
const { get } = require('node:http');
const { addListener } = require('node:process');
const { chdir } = require('process');
const CoinGecko = require('coingecko-api');
const { UV_FS_O_FILEMAP } = require('constants');
const CoinGeckoClient = new CoinGecko();

function readbotdata(indput) {
  let rawdata = fs.readFileSync('bot.json');
  let bot = JSON.parse(rawdata);

  if (indput == null) {
    return rawdata;
  }

  return bot[indput]
}

function wirtebotdata(indput, value){
 let rawdata = fs.readFileSync('bot.json');
  let bot = JSON.parse(rawdata);
  var i = 0;

  for (const property in bot) {
    i++;
    if (property == indput) {
      bot[property] = value;
      i++;
    }
  }

  let data = JSON.stringify(bot);
  fs.writeFileSync('bot.json', data);
}

Object.size = function (obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

function readwallet(indputcoin) {
  let rawdata = fs.readFileSync('wallet.json');
  let wallet = JSON.parse(rawdata);

  if (indputcoin == null) {
    return rawdata;
  }
  
  return wallet.coin[indputcoin]
}

function writewallet(valutta, amount) {
  let rawdata = fs.readFileSync('wallet.json');
  let wallet = JSON.parse(rawdata);
  var i = 0;

  for (const property in wallet.coin) {
    i++;
    if (property == valutta) {
      wallet.coin[property] = amount;
      i++;
    }
  }

  if (i = Object.size(wallet.coin)) {
    wallet.coin[valutta] = amount;
  }

  let data = JSON.stringify(wallet);
  fs.writeFileSync('wallet.json', data);

}


async function getprice(coin, vscoin){
  let data = await CoinGeckoClient.simple.price({
    ids: [coin],
    vs_currencies: [vscoin],
});
return data
};




//amount is the amount of coin you want
function buy(coin, vscoin, amount) {

  getprice(coin, vscoin).then(function(result){
  var price = result.data[coin][vscoin];
  console.log(price);
    console.log(amount)

    var totalprice = price * amount;
    console.log(totalprice);

    var readvscoin = readwallet(vscoin)
    var readcoin = readwallet(coin);

    if (totalprice <= readvscoin) {

      var salto = readvscoin - totalprice;
      writewallet(vscoin, salto)

      if (readcoin == null) {
        writewallet(coin, amount);
      } else {
        salto = readcoin + amount;
        writewallet(coin, parseFloat(salto));
      }

      console.log("Bought " + amount + " " + coin + " for " + totalprice + " " + vscoin)
    }
    else {
      console.log("insufficient balance")
    }
  })
}


function sell(coin, vscoin, amount) {

  getprice(coin, vscoin).then(function(result){
    var price = result.data[coin][vscoin];

   
    var readvscoin = readwallet(vscoin);
    var readcoin = readwallet(coin);

    console.log(readcoin); console.log(amount);
    if (readcoin >= amount) {
      var total = (price * amount) + readvscoin;
      writewallet(vscoin, total);
      var otal = readcoin - amount;
      writewallet(coin, otal);
      console.log("sold " + amount + " " + coin + " for " + price * amount + " " + vscoin)
    }
    else {
      console.log("insufficient balance")
    }
  });
}

