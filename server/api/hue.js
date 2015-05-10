/**
 * Philips Hue API wrapper
 * @type {exports}
 */

var http = require('request-promise-json');
var config = require('./../config').integrations.hue;

exports.getGroups = function () {
  return http.get(config.endpoint + '/groups').then(function (groups) {
    return Object.keys(groups).map(function (key) {
      var group = groups[key];
      group.id = key;
      return group;
    });
  });
};

exports.getLights = function () {
  return http.get(config.endpoint + '/lights').then(function (lights) {
    return Object.keys(lights).map(function (key) {
      var light = lights[key];
      light.id = key;
      return light;
    });
  });
};

exports.getLight = function (id) {
  return http.get(config.endpoint + '/lights/' + id).then(function (light) {
    return light;
  });
};

exports.setLightState = function (id, state) {
  return http.put(config.endpoint + '/lights/' + id + '/state', state).then(function (response) {
    console.log(response);
    return response;
  });
};

// var data = {bri: Number(bri)};
exports.setGroupAction = function (id, action) {
  return http.put(config.endpoint + '/groups/' + id + '/action', action).then(function (response) {
    console.log(response);
    return response;
  });
};