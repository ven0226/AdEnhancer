'use strict';

const AdRequestEnhancer = require('./AdRequestEnhancer');

async function handleRequest(input) {
  const errObj = {
    message: '',
    status: 400,
  };
  if (!input) {
    errObj.message = 'Input is empty, enhancement is not possible';
    throw errObj;
  }
  if (!input.site || !input.site.id) {
    errObj.message = 'Input is invalid, does not have site id';
    throw errObj;
  }
  const output = Object.assign({}, input);
  const siteId = output.site.id;
  const enhancements = [];

  const demoGraphicsPromise = AdRequestEnhancer
    .getDemographics(siteId)
    .catch((err) => {
      console.log(`Error in demographics: ${err.message}`);
      return {};
    });
  enhancements.push(demoGraphicsPromise);
  enhancements.push(AdRequestEnhancer.getPublisher(siteId));

  // Geo location is an optional enhancement
  // So getGeoLocation need not be invoked when there is no ip
  if (output.device && output.device.ip) {
    const geoLocationPromise = AdRequestEnhancer
      .getGeoLocation(output.device.ip)
      .catch((err) => {
        console.log(`Error in geo location: ${err.message}`);
        if (err.code === 'INVALID_COUNTRY') {
          throw err;
        }
        return {};
      });
    enhancements.push(geoLocationPromise);
  }

  const response = await Promise.all(enhancements);
  output.site = { ...output.site, ...response[0], ...response[1] };
  if (response.length === 3) {
    output.device = { ...output.device, ...response[2] };
  }
  return output;
}

module.exports = {
  handleRequest,
};
