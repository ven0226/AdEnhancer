'use strict';

const { handleRequest } = require('./index');

const appRouter = (app) => {
  app.post('/', async (request, response) => {
    try {
      const output = await handleRequest(request.body);
      response
        .status(200)
        .send(output);
    } catch (err) {
      response
        .status(err.status || 500)
        .send(err.message || 'There was an unexpected error!');
    }
  });
};

module.exports = appRouter;
