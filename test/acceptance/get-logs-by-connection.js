var expect = require('chai').expect;
var request = require('../util/request');
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs?{connection}', function() {

  beforeEach(function (done) {
    store.save([
      buildLogEntry({ connection: 'c1', date: '2016-02-21T00:00:00.000Z' }),
      buildLogEntry({ connection: 'c1', date: '2016-02-22T00:00:00.000Z', client_id: "anotherClientId" }),
      buildLogEntry({ connection: 'c1', date: '2016-02-23T00:00:00.000Z' }),
      buildLogEntry({ connection: 'c2', date: '2016-02-24T00:00:00.000Z' })
    ], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns client entries searching by connection when it exists', function(done) {
    request.validGet('/logs?connection=c1')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 2, total: 2 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ id: "3", connection: 'c1', date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ id: "1", connection: 'c1', date: '2016-02-21T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('does not return entries by connection when there are not logs for that user', function(done) {
    request.validGet('/logs?connection=c0')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 0, total: 0 });
        expect(res.body).to.have.property('logs').and.be.empty;
        done(err);
      });
  });

  it('returns 401 http error code when there is a problem with the JWT used', function(done) {
    request.unauthorizedGet('/logs?connection=c1').end(done);
  });

});

