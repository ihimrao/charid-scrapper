const { scrapper } = require('../controller/commonController');
const auth = require('../middleware/authMiddleware');

module.exports = (function () {
  'use strict';
  var commonRoutes = require('express').Router();

  commonRoutes.get('/',  scrapper);

  return commonRoutes;
})();
