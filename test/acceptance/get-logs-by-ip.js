var expect = require('chai').expect;
var request = require('../util/request');
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs?{ip}', function() {

  beforeEach(function (done) {
    store.save([
      buildLogEntry({ ip: '1.1.1.1', date: '2016-02-21T00:00:00.000Z' }),
      buildLogEntry({ ip: '1.1.1.1', date: '2016-02-22T00:00:00.000Z', client_id: "anotherClientId" }),
      buildLogEntry({ ip: '1.1.1.1', date: '2016-02-23T00:00:00.000Z' }),
      buildLogEntry({ ip: '2.2.2.2', date: '2016-02-24T00:00:00.000Z' })
    ], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns client entries searching by ip when it exists', function(done) {
    request.validGet('/logs?ip=1.1.1.1')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 2, total: 2 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ id: "3", ip: '1.1.1.1', date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ id: "1", ip: '1.1.1.1', date: '2016-02-21T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('does not return entries by ip when there are not logs for that user', function(done) {
    request.validGet('/logs?ip=0.0.0.0')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 0, total: 0 });
        expect(res.body).to.have.property('logs').and.be.empty;
        done(err);
      });
  });

  it('returns 400 error when "ip" field is not valid', function(done) {
    request.badGet('/logs?ip=abcd')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.have.property('errors').and.deep.equal([
          { code: 'invalid.param.ip',
            message: 'invalid ip',
            value: 'abcd' }
        ]);
        done(err);
      });
  });

  it('returns 401 http error code when there is a problem with the JWT used', function(done) {
    request.unauthorizedGet('/logs?ip=1.1.1.1').end(done);
  });

});

