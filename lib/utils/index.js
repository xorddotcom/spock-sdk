function setGetValueInStorage() {
  var key = arguments[0];
  var value = arguments[1];
  if (value) {
    sessionStorage.setItem(key, value);
  } else {
    return sessionStorage.getItem(key);
  }
}
function getStoredIdOrGenerateId() {
  var storedDeviceId = setGetValueInStorage("device_id");
  if (storedDeviceId) {
    return storedDeviceId;
  } else {
    var deviceId = generateUUID();
    setGetValueInStorage("device_id", deviceId);
    return deviceId;
  }
}

function generateUUID() {
  var d = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

function getTimestamp() {
  return Math.floor(new Date().getTime() / 1000);
}

export  {
  getStoredIdOrGenerateId,
  generateUUID,
  getTimestamp,
};
