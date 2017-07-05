const express = require('express');
const router = express.Router();
const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb({
  auth: {
    user: 'admin',
    pass: 'admin'
  }
});

const uuid = require('node-uuid');

// List Businesses - GET
router.get('/', (req, res, next) => {
  const dbName = 'bizlist';
  const viewUrl = '_design/allbusinesses/_view/all';

  const queryOptions = {};

  couch.get(dbName, viewUrl, queryOptions).then(
    ({ data, headers, status }) => {
      res.render('businesses', { businesses: data.rows });
    },
    err => {
      res.send(err);
    }
  );
});

// Add Businesses - GET
router.get('/add', (req, res, next) => {
  res.render('addbusiness');
});

// Show Businesses - GET
router.get('/show/:id', (req, res, next) => {
  couch.get('bizlist', req.params.id).then(({ data, headers, status }) => {
    res.render('show', { business: data });
  }), err => {
    res.send(err);
  };
});

// Edit Business - GET
router.get('/edit/:id', (req, res, next) => {
  couch.get('bizlist', req.params.id).then(({ data, headers, status }) => {
    res.render('editbusiness', { business: data });
  }), err => {
    res.send(err);
  };
});

// Show Business by Category - GET
router.get('/category/:category', (req, res, next) => {
  res.send('respond with a resource');
});

// Add Business - POST
router.post('/add', (req, res, next) => {
  req.checkBody('name', 'name is required').notEmpty();
  req.checkBody('category', 'category is required').notEmpty();
  req.checkBody('city', 'city is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    res.render('addbusiness', { errors: errors });
  } else {
    couch
      .insert('bizlist', {
        _id: uuid.v1(),
        name: req.body.name,
        category: req.body.category,
        website: req.body.website,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip
      })
      .then(
        ({ data, headers, status }) => {
          req.flash('success', 'Business added');
          res.redirect('/businesses');
        },
        err => {
          res.send(err);
        }
      );
  }
});

// Edit Business - POST
router.post('/edit/:id', (req, res, next) => {
  req.checkBody('name', 'name is required').notEmpty();
  req.checkBody('category', 'category is required').notEmpty();
  req.checkBody('city', 'city is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    couch.get('bizlist', req.params.id).then(({ data, headers, status }) => {
      res.render('editbusiness', { errors: errors, business: data });
    });
  } else {
    couch.get('bizlist', req.params.id).then(({ data, headers, status }) => {
      couch
        .update('bizlist', {
          _id: req.params.id,
          _rev: data._rev,
          name: req.body.name,
          category: req.body.category,
          website: req.body.website,
          phone: req.body.phone,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip
        })
        .then(
          ({ data, headers, status }) => {
            req.flash('success', 'Business edited');
            res.redirect(`/businesses/show/${req.params.id}`);
          },
          err => {
            res.send(err);
          }
        );
    }), err => {
      res.send(err);
    };
  }
});

// Delete Business - POST
router.post('/delete/:id', (req, res, next) => {
  couch.get('bizlist', req.params.id).then(({ data, headers, status }) => {
    couch.del('bizlist', req.params.id, data._rev).then(
      ({ data, headers, status }) => {
        req.flash('success', 'Business removed');
        res.redirect('/businesses');
      },
      err => {
        res.send(err);
      }
    );
  }), err => {
    res.send(err);
  };
});

module.exports = router;
