'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

const sut = require('../src/index');
const AdRequestEnhancer = require('../src/AdRequestEnhancer');


describe('Input', () => {
  afterEach(() => {
    sandbox.restore();
  });
  it('should be able to add enhancements to input', async () => {
    const input = {
      site: {
        id: 'foo123',
        page: 'http://www.foo.com/why-foo',
      },
      device: {
        ip: '69.250.196.118',
      },
      user: {
        id: '9cb89r',
      },
    };

    sandbox.stub(AdRequestEnhancer, 'getDemographics')
      .resolves({
        demographics: {
          female_percent: 49,
          male_percent: 51,
        },
      });
    sandbox.stub(AdRequestEnhancer, 'getGeoLocation')
      .resolves({
        geo: {
          country: 'United States',
        },
      });
    sandbox.stub(AdRequestEnhancer, 'getPublisher')
      .resolves({
        publisher: {
          id: 'ksjdf9325',
          name: 'ACME Inc.',
        },
      });

    const expected = {
      site:
      {
        id: 'foo123',
        page: 'http://www.foo.com/why-foo',
        demographics: { female_percent: 49, male_percent: 51 },
        publisher: { id: 'ksjdf9325', name: 'ACME Inc.' },
      },
      device: { ip: '69.250.196.118', geo: { country: 'United States' } },
      user: { id: '9cb89r' },
    };

    const result = await sut.handleRequest(input);
    expect(result).to.deep.equal(expected);
  });

  it('should not fail when some of the required services is not available', async () => {
    const input = {
      site: {
        id: 'foo123',
      },
      device: {
        ip: '69.250.196.118',
      },
    };

    sandbox.stub(AdRequestEnhancer, 'getDemographics')
      .rejects({ message: 'mocked failure in demographics' });
    sandbox.stub(AdRequestEnhancer, 'getGeoLocation')
      .rejects({ message: 'mocked failure in geo location' });
    sandbox.stub(AdRequestEnhancer, 'getPublisher')
      .resolves({
        publisher: {
          id: 'ksjdf9325',
        },
      });

    const expected = {
      site:
      {
        id: 'foo123',
        publisher: { id: 'ksjdf9325' },
      },
      device: { ip: '69.250.196.118' },
    };

    const result = await sut.handleRequest(input);
    expect(result).to.deep.equal(expected);
  });

  it('should fail if there is no site id', async () => {
    const input = {
      site: {
      },
      device: {
        ip: '69.250.196.118',
      },
    };
    const expected = {
      message: 'Input is invalid, does not have site id',
      status: 400,
    };
    try {
      await sut.handleRequest(input);
    } catch (err) {
      expect(err).to.deep.equal(expected);
    }
  });
});
