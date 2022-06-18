'use strict';

const register = require('./register');
const bootstrap = require('./bootstrap');
const destroy = require('./destroy');
const config = require('./config');
const controllers = require('./controllers');
const services = require('./services');
const routes = require('./routes');

module.exports = {
  register,
  bootstrap,
  destroy,
  config,
  controllers,
  routes,
  services,
  //contentTypes,
  //policies,
  //middlewares,
};
