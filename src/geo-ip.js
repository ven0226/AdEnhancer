'use strict';

const geoip2ws = require('geoip2ws')({
  userId: 135482,
  licenseKey: 'uBRv23gF8uVr',
  service: 'country',
  requestTimeout: 2000,
});

function country(ip) {
  return new Promise((resolve, reject) => {
    geoip2ws(ip, (err, value) => {
      if (err) {
        reject(err);
      }
      resolve(value.country.names.en);
    });
  });
}

module.exports = {
  country,
};
