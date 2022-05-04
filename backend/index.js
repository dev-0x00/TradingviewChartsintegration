const { log, error } = console;
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const server = app.listen(3001, log('Proxy server is running on port 3001'));
const got = require('got');
const cors = require('cors');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(express.static('/home/dev/personalProjects/upwork/Sayed/UI/static'));
app.use(bodyParser.urlencoded({extended: true}));

//Tulind Functions
const {
  sma_inc,
  ema_inc,
  markers_inc,
  rsi_inc,
  macd_inc,
} = require('./indicators');

app.use(cors());
app.get('/:symbol/:interval', async (req, res) => {
  try {
    const { symbol, interval } = req.params;
    const resp = await got(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`
    );
    const data = JSON.parse(resp.body);
    let klinedata = data.map((d) => ({
      time: d[0] / 1000,
      open: d[1] * 1,
      high: d[2] * 1,
      low: d[3] * 1,
      close: d[4] * 1,
    }));
    klinedata = await sma_inc(klinedata);
    klinedata = await ema_inc(klinedata);
    klinedata = markers_inc(klinedata);
    klinedata = await rsi_inc(klinedata);
    klinedata = await macd_inc(klinedata);
    res.status(200).json(klinedata);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/', (req, res) => {
  var symbol = req.body.symbol
  var interval = req.body.time
  res.render("index.html", {symbol: symbol, url: `http://127.0.0.1:3001/${symbol}/${interval}`});
  console.log(req.body);
});

app.get('/', function(req, res) {
  const url = "http://127.0.0.1:3001/ETHUSDT/1m";
  res.render('index.html', {symbol: 'BTCUSDT', url: url});
});

app.get('/static/', function(req, res) {
  res.sendFile('/home/dev/personalProjects/upwork/Sayed/UI/static/tv.js')
});

app.get('/index/', function(req, res) {
  res.sendFile('/home/dev/personalProjects/upwork/Sayed/UI/static/index.js')
});