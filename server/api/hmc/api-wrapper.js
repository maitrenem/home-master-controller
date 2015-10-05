/**
 * Api wrapper. Handle case if service has been disabled in config.
 * @type {exports}
 */
var Promise = require('../../util/promise');
var DeviceTypes = require('./device-types');
var DeviceActions = require('./device-actions');
var Schedule = require('../scheduler/schedule.model');
var Events = require('../scheduler/events');
var Bus = require('../../util/bus');
var Logger = require('../../util/logger');

var ApiWrapper = module.exports = function(telldus, hue, zwave, generic) {
  var TelldusAPI = telldus;
  var HueAPI = hue;
  var ZWaveAPI = zwave;
  var GenericAPI = generic;

  var ZWAVE_SENSOR = (id) => ZWaveAPI
    .sensor(id)
    .then(ZWaveAPI.transformSensor)
    .catch(serviceDisabled);

  var ZWAVE_SENSORS = () => ZWaveAPI
    .sensors()
    .then(ZWaveAPI.transformSensors)
    .catch(serviceDisabledArray);

  var ZWAVE_DEVICE = (id) => ZWaveAPI
    .device(id)
    .then(ZWaveAPI.transformDevice)
    .catch(serviceDisabled);

  var ZWAVE_DEVICES = () => ZWaveAPI
    .devices()
    .then(ZWaveAPI.transformDevices)
    .catch(serviceDisabledArray);

  var HUE_DEVICE = (id) => HueAPI
    .light(id)
    .then(HueAPI.transformDevice)
    .catch(serviceDisabled);

  var HUE_DEVICES = () => HueAPI
    .lights()
    .then(HueAPI.transformDevices)
    .catch(serviceDisabledArray);

  var HUE_GROUP = (id) => HueAPI
    .group(id)
    .then(HueAPI.transformGroup)
    .catch(serviceDisabled);

  var HUE_GROUPS = () => HueAPI
    .groups()
    .then(HueAPI.transformGroups)
    .catch(serviceDisabledArray);

  var TELLDUS_DEVICE = (id) => TelldusAPI
    .device(id)
    .then(TelldusAPI.transformDevice)
    .catch(serviceDisabled);

  var TELLDUS_DEVICES = () => TelldusAPI
    .devices()
    .then(TelldusAPI.transformDevices)
    .catch(serviceDisabledArray);

  var TELLDUS_GROUP = (id) => TelldusAPI
    .group(id)
    .then(TelldusAPI.transformGroup)
    .catch(serviceDisabled);

  var TELLDUS_GROUPS = () => TelldusAPI
    .groups()
    .then(TelldusAPI.transformGroups)
    .catch(serviceDisabledArray);

  var TELLDUS_SENSOR = (id) => TelldusAPI
    .sensor(id)
    .catch(serviceDisabled);

  var TELLDUS_SENSORS = () => TelldusAPI
    .sensors()
    .then(sensors => Promise.all(sensors.map(sensor => TelldusAPI.sensor(sensor.id))))
    .then(TelldusAPI.transformSensors)
    .catch(serviceDisabledArray);

  var GENERIC_GROUP = (id) => GenericAPI
    .group(id)
    .then(GenericAPI.transformGroup);

  var GENERIC_GROUPS = ()   => GenericAPI
    .groups()
    .then(GenericAPI.transformGroups);

  var serviceDisabled = (err) => Promise.reject(err);

  var serviceDisabledArray = (err) => {
    if (err.serviceDisabled && err.serviceDisabled === true) {
      return [];
    } else {
      return Promise.reject(err);
    }
  };

  var getSensors = () => {
    var promises = [];
    promises.push(TELLDUS_SENSORS());
    promises.push(ZWAVE_SENSORS());
    return Promise.all(promises).then(arr => arr.reduce((a, b) => a.concat(b)));
  };

  var getSensor = (id, type) => {
    switch (type) {
      case DeviceTypes.TELLDUS_SENSOR:
        return TELLDUS_SENSOR(id);

      case DeviceTypes.ZWAVE_SENSOR_BINARY:
      case DeviceTypes.ZWAVE_SENSOR_MULTILEVEL:
        return ZWAVE_SENSOR(id);

      default :
        return Promise.reject('Unsupported sensor type: ' + type)
    }
  };

  var getGroups = () => {
    var promises = [];
    promises.push(TELLDUS_GROUPS());
    promises.push(HUE_GROUPS());
    promises.push(GENERIC_GROUPS());
    return Promise.all(promises).then(arr => arr.reduce((a, b) => a.concat(b)));
  };

  var getGroup = (id, type) => {
    switch (type) {
      case DeviceTypes.GENERIC_GROUP:
        return GENERIC_GROUP(id);
      case DeviceTypes.TELLDUS_GROUP:
        return TELLDUS_GROUP(id);
      case DeviceTypes.HUE_GROUP:
        return HUE_GROUP(id);
      default:
        return Promise.reject('Unsupported group ' + type);
    }
  };

  var getDevices = () => {
    var promises = [];
    promises.push(TELLDUS_DEVICES());
    promises.push(HUE_DEVICES());
    promises.push(ZWAVE_DEVICES());
    return Promise.all(promises).then(arr => arr.reduce((a, b) => a.concat(b)));
  };

  var getDevice = (id, type) => {
    switch (type) {
      case DeviceTypes.TELLDUS_DEVICE:
        return TELLDUS_DEVICE(id);

      case DeviceTypes.TELLDUS_GROUP:
        return TELLDUS_GROUP(id);

      case DeviceTypes.HUE_DEVICE:
        return HUE_DEVICE(id);

      case DeviceTypes.HUE_GROUP:
        return HUE_GROUP(id);

      case DeviceTypes.GENERIC_GROUP:
        return GENERIC_GROUP(id);

      case DeviceTypes.ZWAVE_SWITCH_BINARY:
      case DeviceTypes.ZWAVE_SWITCH_MULTILEVEL:
        return ZWAVE_DEVICE(id);

      default:
        return Promise.reject('Invalid device type ' + device.type);
    }
  };

  var groupDevices = (id, type) => {
    if (type === DeviceTypes.GENERIC_GROUP) {
      return GenericAPI.groupDevices(id)
        .then(devices => Promise.all(devices.map(device => getDevice(device.id, device.type))));
    } else {
      return Promise.reject(type + ' not implemented');
    }
  };

  var control = (id, params) => {
    Logger.info('HMC: Control ' + params.type + ' ' + id + ' -> ' + params.action);
    switch (params.type) {
      case DeviceTypes.TELLDUS_DEVICE:
      case DeviceTypes.TELLDUS_GROUP:
        return getDevice(id, params.type)
          .then(device => controlTelldus(id, createTelldusParams(device, params)));

      case DeviceTypes.HUE_DEVICE:
      case DeviceTypes.HUE_GROUP:
        return controlHue(id, params);

      case DeviceTypes.GENERIC_GROUP:
        return controlGenericGroup(id, params);

      case DeviceTypes.ZWAVE_SWITCH_BINARY:
      case DeviceTypes.ZWAVE_SWITCH_MULTILEVEL:
        return controlZWave(id, params);

      default:
        return Promise.reject(params.type + ' is not implemented');
    }
  };

  var groupState = (id) => GenericAPI.groupDevices(id)
    .then(items => Promise.all(items.map(item => getDevice(item.id, item.type))).then(devices => {
      return {
        id: id,
        state: {
          // Group is on if all devices are on
          on: devices.every(device => device.state.on === true)
        },
        devices: devices
      }
    }));

  var createGenericGroup = (group) => GenericAPI.create(group);
  var updateGenericGroup = (id, group) => GenericAPI.update(id, group);
  var removeGenericGroup = (id) => GenericAPI.remove(id);

  var controlGenericGroup = (id, params) => {
    if (params.action === DeviceActions.ACTION_ON ||
        params.action === DeviceActions.ACTION_OFF) {
      return controlDevicesInGroup(id, params);
    }
  };

  var createTelldusParams = (item, params) => {
    var telldusParams = {
      action: params.action,
      type: params.type
    };
    if (item.motorized) {
      if (params.action === DeviceActions.ACTION_ON) {
        Logger.debug('Motorized device: ON -> UP');
        telldusParams.action = DeviceActions.ACTION_UP;
      } else if (params.action === DeviceActions.ACTION_OFF) {
        Logger.debug('Motorized device: OFF -> DOWN');
        telldusParams.action = DeviceActions.ACTION_DOWN;
      }
    }
    return telldusParams;
  };

  var controlDevicesInGroup = (id, params) => GenericAPI
    .groupDevices(id)
    .then(items => Promise.all(items.map(item => getDevice(item.id, item.type))))
    .then(items => {
      var promises = items.map(item => {
        params.type = item.type; // Must send correct type!

        switch (item.type) {
          case DeviceTypes.TELLDUS_DEVICE:
          case DeviceTypes.TELLDUS_GROUP:
            return controlTelldus(item.id, createTelldusParams(item, params));

          case DeviceTypes.HUE_DEVICE:
          case DeviceTypes.HUE_GROUP:
            return controlHue(item.id, params);

          case DeviceTypes.ZWAVE_SWITCH_BINARY:
          case DeviceTypes.ZWAVE_SWITCH_MULTILEVEL:
            return controlZWave(item.id, params);
        }
      });

      return Promise.all(promises).then(response => {
        return {success: 'Group state set to ' + params.action};
      });

    });

  var controlTelldus = function(id, params) {
    Logger.info('TELLDUS: Control device -> ' + id + ', action: ' + params.action);
    switch (params.action) {
      case DeviceActions.ACTION_ON:
        return TelldusAPI.turnOn(id);

      case DeviceActions.ACTION_OFF:
        return TelldusAPI.turnOff(id);

      case DeviceActions.ACTION_UP:
        return TelldusAPI.goUp(id);

      case DeviceActions.ACTION_DOWN:
        return TelldusAPI.goDown(id);
    }
  };

  var createHueParams = (params) => {
    var hueParams = {};
    switch (params.action) {
      case DeviceActions.ACTION_ON:
        hueParams = {on: true};
        break;

      case DeviceActions.ACTION_OFF:
        hueParams = {on: false};
        break;

      case 'colorloop-on':
        hueParams = {effect: 'colorloop'};
        break;

      case 'colorloop-off':
        hueParams = {effect: 'none'};
        break;

      case 'bri':
        hueParams = {bri: Number(params.value)};
        break;

      case 'sat':
        hueParams = {sat: Number(params.value)};
        break;

      case 'hue':
        hueParams = {hue: Number(params.value)};
        break;
    }
    return hueParams;
  };

  var controlHue = function(id, params) {
    var hueParams = createHueParams(params);
    switch (params.type) {
      case DeviceTypes.HUE_DEVICE:
        return HueAPI.setLightState(id, hueParams);

      case DeviceTypes.HUE_GROUP:
        return HueAPI.setGroupAction(id, hueParams);

      default:
        return Promise.reject('controlHue: Unsupported type ' + params.type);
    }
  };

  var controlZWave = (id, params) => {
    switch (params.action) {
      case DeviceActions.ACTION_ON:
        return ZWaveAPI.setOn(id);

      case DeviceActions.ACTION_OFF:
        return ZWaveAPI.setOff(id);

      case DeviceActions.ACTION_LEVEL:
        Logger.info('ZWAVE: setLevel: ' + params.value);
        return ZWaveAPI.setLevel(id, params.value);

      default:
        return Promise.reject('Invalid action ' + params.action);
    }
  };


  return {
    sensor: getSensor,
    sensors: getSensors,
    device: getDevice,
    devices: getDevices,
    group: getGroup,
    groups: getGroups,
    groupDevices: groupDevices,
    groupState: groupState,
    createGenericGroup: createGenericGroup,
    updateGenericGroup: updateGenericGroup,
    removeGenericGroup: removeGenericGroup,
    controlGenericGroup: controlGenericGroup,
    control: control
  };
};
