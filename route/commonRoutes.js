const { scrapper, fbLogin } = require('../controller/commonController');
const auth = require('../middleware/authMiddleware');

module.exports = (function () {
  'use strict';
  var commonRoutes = require('express').Router();

  commonRoutes.get('/',  scrapper);
  commonRoutes.get('/fbLogin',  fbLogin);

  return commonRoutes;
})();
