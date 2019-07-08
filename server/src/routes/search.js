const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const request = require('request-promise-native');
const debug = require('debug')('server:search');

const schema = Joi.object().keys({
  lang: Joi.string().length(2).required(),
  limit: Joi.number().required(),
  offset: Joi.number().required(),
  rating: Joi.string().valid('g','pg','pg-13', 'r').required(),
  q: Joi.string().required(),
});

/* GET validates querystring and calls giphy. */
router.get("/", function(req, res, next) {
  return new Promise((resolve, reject) => {
    schema.validate(req.query, (err, qs) => {
      if (err) {
        err.statusCode = 400;
        reject(err);
        return;
      }
      debug(qs);
      resolve(qs);
    });
  }).then((qs) => request({
    uri: 'https://api.giphy.com/v1/gifs/search',
    qs: {
      ...qs,
      api_key: process.env.API_KEY,
    },
    json: true,
  })).then((giphyResponse) => {
    res.json(giphyResponse);
  }).catch(next);
});

module.exports = router;
