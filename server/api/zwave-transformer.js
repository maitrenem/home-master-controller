var DeviceTypes = require('./device-types');
/**
 * Transform a zwave device to custom format.
 * @param device
 * @returns {{}}
 */
function transformZWaveDevice(device) {
  var item = {};
  item.id = device.id;

  if (device.deviceType === 'switchBinary') {
    item.type = DeviceTypes.ZWAVE_SWITCH;
  } else {
    item.type = device.deviceType;
  }

  item.name = device.metrics.title;
  item.state = {};
  item.state.on = device.metrics.level === 'on';
  return item;
}
exports.ZWaveDevice = transformZWaveDevice;

function transformZWaveDevices(devices) {
  return devices.map(transformZWaveDevice);
}
exports.ZWaveDevices = transformZWaveDevices;


/**
 * Transform a zwave sensor to custom format.
 * @param device
 * @returns {{}}
 */
function transformZWaveSensor(device) {
  var item = {};
  item.id = device.id;

  if (device.deviceType === 'sensorMultilevel') {
    item.type = DeviceTypes.ZWAVE_SENSOR;
  } else {
    item.type = device.deviceType;
  }
  item.name = device.metrics.title;

  item.data = [{
    name: device.metrics.probeTitle,
    value: device.metrics.level + device.metrics.scaleTitle
  }];

  return item;
}
exports.ZWaveSensor = transformZWaveSensor;


/**
 * Transform a list of zwave sensors to custom format.
 * @param devices
 * @returns {*}
 */
function transformZWaveSensors(devices) {
  return devices.map(transformZWaveSensor);
}
exports.ZWaveSensors = transformZWaveSensors;