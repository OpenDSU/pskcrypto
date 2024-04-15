let constants = exports;

// Helper
constants._reverse = function reverse(map) {
  let res = {};

  Object.keys(map).forEach(function(key) {
    // Convert key to integer if it is stringified
    if ((key | 0) == key)
      key = key | 0;

    let value = map[key];
    res[value] = key;
  });

  return res;
};

constants.der = require('./der');
