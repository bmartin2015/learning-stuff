const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const api = require('instagram-node').instagram();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
  })
);

// Gloabl Vars
app.use((req, res, next) => {
  // format date
  res.locals.formatDate = function(date) {
    let myDate = new Date(date * 1000);
    return myDate.toLocaleString();
  };

  // Is user logged in?
  if (req.session.accesstoken && req.session.accesstoken != 'undefined') {
    res.locals.isLoggedIn = true;
  } else {
    res.locals.isLoggedIn = false;
  }
  next();
});

// Instagram stuff
api.use({
  client_id: '72924f571ac64d57ad2e6f7b45fcf202',
  client_secret: '7b86c5af3d41452c8ae9b6a3311188c8'
});

const redirect_uri = 'http://localhost:3000/handleauth';

exports.authorize_user = function(req, res) {
  res.redirect(api.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
};

exports.handleauth = function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, (err, result) => {
    if (err) {
      console.log(err.body);
      res.send("Didn't work");
    } else {
      console.log(`Access Token: ${result.access_token}`);
      console.log(`User ID: ${result.user.id}`);
      //res.send('You made it!!');

      req.session.accesstoken = result.access_token;
      req.session.uid = result.user.id;

      api.use({ access_token: req.session.accesstoken });

      res.redirect('/main');
    }
  });
};

// Login Route
app.get('/login', exports.authorize_user);

// Handleauth
app.get('/handleauth', exports.handleauth);

// Index Route
app.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Welcome'
  });
});

// Main Route
app.get('/main', (req, res, next) => {
  api.user(req.session.uid, (err, result, remaining, limit) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      api.user_media_recent(req.session.uid, {}, (err, medias, pagination, remaining, limit) => {
        if (err) {
          res.send(err);
        } else {
          res.render('main', {
            title: 'My Instagram',
            user: result,
            medias: medias
          });
        }
      });
    }
  });
});

// Logout Route
app.get('/logout', (req, res, next) => {
  req.session.accesstoken = false;
  req.session.uid = false;
  res.redirect('/');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
