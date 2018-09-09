'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const geoip = require('../src/geo-ip');
const sut = require('../src/AdRequestEnhancer');

const sandbox = sinon.createSandbox();

describe('Advertisement Request Enhancer', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('should be able to get demographics when siteid is provided', async () => {
    const mock = {
      data: {
        demographics: {
          pct_female: 41,
        },
      },
    };
    sandbox.stub(axios, 'get')
      .resolves(mock);
    const expected = { demographics: { female_percent: 41, male_percent: 59 } };
    const result = await sut.getDemographics('random_site_id');
    expect(result).to.deep.equal(expected);
  });

  it('should be able to get publisher when siteid is provided', async () => {
    const mock = {
      data: {
        publisher: {
          id: 'ksjdf9325',
          name: 'ACME Inc.',
        },
      },
    };
    sandbox.stub(axios, 'post')
      .resolves(mock);
    const expected = { publisher: { id: 'ksjdf9325', name: 'ACME Inc.' } };
    const result = await sut.getPublisher('random_site_id');
    expect(result).to.deep.equal(expected);
  });
  it('should be able to get geo location when ip is provided', async () => {
    const expected = {
      geo: {
        country: 'United States',
      },
    };
    sandbox.stub(geoip, 'country')
      .resolves('United States');
    const result = await sut.getGeoLocation('10.10.10.10');
    expect(result).to.deep.equal(expected);
  });

  it('should not fail when the request to get demographics is rejected', async () => {
    sandbox.stub(axios, 'get')
      .rejects({
        response: {
          data: {
            error: { message: 'Sometimes, bad things happen to good requests' },
          },
        },
      });
    const expected = {
      message: 'Sometimes, bad things happen to good requests',
    };
    try {
      await sut.getDemographics('random_site_id');
    } catch (err) {
      expect(err.message).to.equal(expected.message);
    }
  });

  it('should throw error when publisher id is not present', async () => {
    const mock = {
      data: {
        publisher: {
          name: 'ACME Inc.',
        },
      },
    };
    sandbox.stub(axios, 'post').resolves(mock);
    try {
      await sut.getPublisher('random_site_id');
    } catch (err) {
      expect(err.message).to.deep.equal('Publisher id not available');
    }
  });

  it('should throw error when the country is not united states', async () => {
    const expected = {
      message: 'ip is not from united states',
      code: 'INVALID_COUNTRY',
    };
    sandbox.stub(geoip, 'country').resolves('United Kingdom');
    try {
      await sut.getGeoLocation('10.10.10.10');
    } catch (err) {
      expect(err.message).to.equal(expected.message);
      expect(err.code).to.equal(expected.code);
    }
  });
});
