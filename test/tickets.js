var expect = require('chai').expect
  , supertest = require('supertest')
  , app = require('../app.js')
  , Ticket = require('../models/ticket');

describe('tickets', function () {
  describe('POST to /tickets/new', function () {
    it('creates a new ticket', function () {
      var agent = supertest(app);
      return agent
        .post('/tickets/new')
        .send({
          name: 'Ticket',
          description: 'A simple ticket',
          phone_number: '+5555555'
        })
        .expect(201)
        .expect(function(res) {
          return Ticket.find({})
            .then((tickets) => {
              expect(tickets.length).to.equal(1);
            });
        });
    });
  });
});
