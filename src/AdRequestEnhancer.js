'use strict';

const axios = require('axios');
const geoip = require('./geo-ip');

async function getDemographics(siteId) {
  const error = new Error();
  error.status = 400;
  try {
    if (!siteId) {
      error.message = 'siteId cannot be empty';
      throw error;
    }
    const response = await axios.get(`http://159.89.185.155:3000/api/sites/${siteId}/demographics`);
    if (!response.data.demographics) {
      error.message = 'Response does not have demographics data';
      throw error;
    }

    const { demographics } = response.data;
    if (!demographics.pct_female) {
      error.message = 'Demographics does not have the expected property pct_female';
      throw error;
    }
    // Get female percent from response
    // Male percent is not available in response
    // Subtrat female percent from 100 to get male percent
    const femalePercent = parseFloat(demographics.pct_female.toFixed(2));
    const malePercent = 100 - femalePercent;
    return {
      demographics: {
        female_percent: femalePercent,
        male_percent: malePercent,
      },
    };
  } catch (err) {
    // request failed
    if (err.response) {
      error.status = err.response.status;
      error.message = err.response.data.error.message;
    } else {
      error.message = err.message;
      error.status = 400;
    }
    throw error;
  }
}

async function getPublisher(siteID) {
  const error = new Error();
  error.status = 400;
  try {
    const response = await axios.post('http://159.89.185.155:3000/api/publishers/find', {
      q: {
        siteID,
      },
    });
    if (response.data.publisher && !response.data.publisher.id) {
      throw new Error('Publisher id not available');
    }
    return response.data;
  } catch (err) {
    if (err.response) {
      // request failed
      error.status = err.response.status;
      error.message = err.response.data.error.message;
    } else {
      error.message = err.message || 'Unknown error';
      error.status = 400;
    }
    console.log(`Error in PUBLISHER: ${error.message}`);
    throw error;
  }
}

async function getGeoLocation(ip) {
  const isValidIp = (val) => {
    const blocks = val.split('.');
    const validParts = blocks
      .filter(block => (block >= 0) && (block < 256))
      .length;
    return validParts === 4;
  };
  try {
    const error = new Error();
    if (!ip || !isValidIp(ip)) {
      error.message = 'invalid input';
      error.status = 400;
      throw error;
    }
    const country = await geoip.country(ip);
    if (country !== 'United States') {
      error.status = 400;
      error.message = 'ip is not from united states';
      error.code = 'INVALID_COUNTRY';
      throw error;
    }
    return {
      geo: {
        country,
      },
    };
  } catch (err) {
    err.status = err.status || 424;
    throw err;
  }
}

module.exports = {
  getDemographics,
  getGeoLocation,
  getPublisher,
};
