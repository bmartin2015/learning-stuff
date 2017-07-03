const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');

const index = require('./routes/index');
const users = require('./routers/users');

// Port
const port = 3000;

// Setup App
const app = express();

// Setup View
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Setup Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Express Session
app.use(
  session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
  })
);

// Express messages
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator
app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      let namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

app.use('/', index);
app.use('/users', users);

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
