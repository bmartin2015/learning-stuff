const express = require('express');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const NodeGeocoder = require('node-geocoder');
const redis = require('redis');

// Create Redis Client
const client = redis.createClient();

client.on('connect', () => {
  console.log('Redis Server Connected...');
});

// Set Port
const port = 3000;

// Init App
const app = express();

// View engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// method-override
app.use(methodOverride('_method'));

// API options
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'AIzaSyB76pwELg1Xk8DFKIKS0t22mrDX28aeETI',
  formatter: null
};

const geocoder = NodeGeocoder(options);

// Search Store - GET
app.get('/', (req, res, next) => {
  res.render('searchstore');
});

// Add Store - GET
app.get('/addstore', (req, res, next) => {
  res.render('addstore');
});

// Add Store - POST
app.post('/store/add', (req, res, next) => {
  const id = req.body.id;
  const location = req.body.location;

  geocoder
    .geocode(location)
    .then(response => {
      const store = {};
      store.lat = response[0].latitude;
      store.lng = response[0].longitude;
      store.address = response[0].formattedAddress;

      client.hmset(id, ['lat', store.lat, 'lng', store.lng, 'address', store.address], (err, reply) => {
        if (err) {
          console.log(err);
        }
        console.log(reply);
        res.redirect('/');
      });
    })
    .catch(err => {
      console.log(err);
      return;
    });
});

// Search Store - POST
app.post('/store/search', (req, res, next) => {
  const id = req.body.id;

  client.hgetall(id, (err, obj) => {
    if (!obj) {
      res.render('searchstore', { error: 'Invalid Store ID' });
    } else {
      obj.id = id;
      res.render('details', { store: obj });
    }
  });
});

// Delete Store - DELETE
app.delete('/store/delete/:id', (req, res, next) => {
  client.del(req.params.id);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
