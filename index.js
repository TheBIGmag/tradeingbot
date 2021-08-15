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

  wirtebotdata(req.body.indput, req.body.value)
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

function wirtebotdata(indput, value) {
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


async function getprice(coin, vscoin) {
  let data = await CoinGeckoClient.simple.price({
    ids: [coin],
    vs_currencies: [vscoin],
  });
  return data
};

//date is a string.. api cant take unix
async function gethistoicalprice(coin, vscoin, date) {
  let data = await CoinGeckoClient.coins.fetchHistory(coin, {
    date: date
  });

  return data.data.market_data.current_price[vscoin];
};

async function getpricerange(from,to,coin,vscoin){ 
let data = await CoinGeckoClient.coins.fetchMarketChartRange(coin, {
  from: from,
  to: to,
});
console.log(data.data.prices);
return data.data.prices
}

getpricerange(unixtime(3),unixtime(1),"cardano");
console.log(Date.now());
function unixtime(days) {
  timenow = Date.now();
  timeback = days * 86400000;

  return timenow - timeback
}

//amount is the amount of coin you want
function buy(coin, vscoin, amount) {

  getprice(coin, vscoin).then(function (result) {
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

  getprice(coin, vscoin).then(function (result) {

    var price = result.data[coin][vscoin];
    var readvscoin = readwallet(vscoin);
    var readcoin = readwallet(coin);

    console.log(readcoin); console.log(amount);
    if (readcoin >= amount) {

      var total = (price * amount) + readvscoin;

      writewallet(vscoin, total);
      writewallet(coin, readcoin - amount);
      console.log("sold " + amount + " " + coin + " for " + price * amount + " " + vscoin)
    }
    else {
      console.log("insufficient balance")
    }
  });
}

//idk why getmonth returns a value one lower then the current??
function SMA(coin, vscoin, start) {

  total = 0;
  for (i = 0; i < 5; i++) {
    const d = new Date(unixtime(start - i));
    date = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear()
    
    gethistoicalprice(coin, vscoin, date).then(function (result) {
      total = total + result
      
    })
  
  }
  return total / 5;
}



function EMA(coin, days) {

}

function MACDsignal(coin) {
  return EMA(coin, 12) - EMA(coin, 26)
}
