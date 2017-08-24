var should = require('should');
var request = require('supertest');
var server = require('../../../app');

let MongoClient = require('mongodb').MongoClient

describe('controllers', function() {
  describe('clients', function() {
    describe('GET /clients', function() {
      it('should return an empty list', function(done) {
        clearTestDB().then(() => {
          request(server)
            .get('/clients')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              res.body.should.eql([]);
              done();
            });
        })
      });
    });

    describe('POST /clients', function() {
      let clientObj = {
        name: "Mark",
        address: "123 Fake St",
        postalCode: "A1A 1A1",
        phone: "222 555 8888",
        email: "mark@gmail.com",
        dob: "1980-01-01"
      }
      it('should add a record to clients collection', function(done) {
        request(server)
          .post('/clients')
          .send(clientObj)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(201)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql('');

            done()

          });
      });

      it('should persist the record', function(done) {
        request(server)
          .get('/clients')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            should(res.body.length).be.exactly(1)

            clearTestDB().then(() => {
              done();
            })
          });
      });
    });
  });
});

const clearTestDB = () => {
  return MongoClient.connect('mongodb://localhost:27017/rbc_assignment_test').then(db => {
    return db.collection('clients').remove({})
  })
}
