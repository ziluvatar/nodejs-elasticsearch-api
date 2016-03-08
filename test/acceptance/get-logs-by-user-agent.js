var expect = require('chai').expect;
var request = require('../util/request');
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs?{user_agent}', function() {

  beforeEach(function (done) {
    store.save([
      buildLogEntry({ user_agent: 'Chrome Mac', date: '2016-02-23T00:00:00.000Z' }),
      buildLogEntry({ user_agent: 'Chrome Mac', date: '2016-02-22T00:00:00.000Z', client_id: "anotherClientId" }),
      buildLogEntry({ user_agent: 'Chrome Windows', date: '2016-02-21T00:00:00.000Z' }),
      buildLogEntry({ user_agent: 'Chrome Mac', date: '2016-02-20T00:00:00.000Z' })
    ], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns client entries searching by user_agent when it exists', function(done) {
    request.validGet('/logs?user_agent=chrome')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.eql({
          start: 0, limit: 3, length: 3, total: 3,
          logs: [
            buildLogEntry({ user_agent: 'Chrome Mac', date: '2016-02-23T00:00:00.000Z' }),
            buildLogEntry({ user_agent: 'Chrome Windows', date: '2016-02-21T00:00:00.000Z' }),
            buildLogEntry({ user_agent: 'Chrome Mac', date: '2016-02-20T00:00:00.000Z' })
          ]
        });
        done(err);
      });
  });

  it('does not return entries by searching when there are not logs for that user agent', function(done) {
    request.validGet('/logs?user_agent=Firefox')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 0, total: 0 });
        expect(res.body).to.have.property('logs').and.be.empty;
        done(err);
      });
  });

  it('returns 401 http error code when there is a problem with the JWT used', function(done) {
    request.unauthorizedGet('/logs?user_id=u1').end(done);
  });

});

