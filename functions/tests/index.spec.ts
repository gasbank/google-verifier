/* eslint-disable @typescript-eslint/no-floating-promises */

import * as chai from 'chai';
import chaiHttp = require('chai-http');

const assert = chai.assert;

chai.use(chaiHttp);

const baseUrl = 'http://localhost:5001';
const getUrl = '/laidoff-c49a1/us-central1/verifyGooglePlay';

describe('verifyGooglePlay', () => {
    it('should fail with empty receipt', (done) => {
        chai.request(baseUrl)
            .get(getUrl)
            .end((err, res) => {
                assert.equal(res.status, 400);
                assert.equal(res.text, 'Invalid receipt-to-be-verified header.');
                done();
            });
    });

    it('should fail with invalid JSON receipt', (done) => {
        chai.request(baseUrl)
            .get(getUrl)
            .set('receipt-to-be-verified', 'hello world')
            .end((err, res) => {
                assert.equal(res.status, 400);
                assert.equal(res.text, 'Invalid JSON.');
                done();
            });
    });

    it('should fail with incorrect store type receipt', (done) => {
        const receipt = {
            Store: 'MyPlay',
            Payload: '',
        };
        const receiptBase64 = Buffer.from(JSON.stringify(receipt), 'utf8').toString('base64');

        chai.request(baseUrl)
            .get(getUrl)
            .set('receipt-to-be-verified', receiptBase64)
            .end((err, res) => {
                assert.equal(res.status, 400);
                assert.equal(res.text, 'Invalid store type.');
                done();
            });
    });

    it('should fail with empty payload receipt', (done) => {
        const receipt = {
            Store: 'GooglePlay',
            Payload: '',
        };
        const receiptBase64 = Buffer.from(JSON.stringify(receipt), 'utf8').toString('base64');

        chai.request(baseUrl)
            .get(getUrl)
            .set('receipt-to-be-verified', receiptBase64)
            .end((err, res) => {
                assert.equal(res.status, 400);
                assert.equal(res.text, 'Invalid JSON payload.');
                done();
            });
    });

    it('should fail with invalid payload receipt', (done) => {
        const receipt = {
            Store: 'GooglePlay',
            Payload: 'hello world',
        };
        const receiptBase64 = Buffer.from(JSON.stringify(receipt), 'utf8').toString('base64');

        chai.request(baseUrl)
            .get(getUrl)
            .set('receipt-to-be-verified', receiptBase64)
            .end((err, res) => {
                assert.equal(res.status, 400);
                assert.equal(res.text, 'Invalid JSON payload.');
                done();
            });
    });

    it('should fail with empty JSON payload receipt', (done) => {
        const payload = {};
        const receipt = {
            Store: 'GooglePlay',
            Payload: JSON.stringify(payload),
        };
        const receiptBase64 = Buffer.from(JSON.stringify(receipt), 'utf8').toString('base64');

        chai.request(baseUrl)
            .get(getUrl)
            .set('receipt-to-be-verified', receiptBase64)
            .end((err, res) => {
                assert.equal(res.status, 400);
                assert.equal(res.text, 'Invalid JSON payload json field.');
                done();
            });
    });

    it('should fail with empty JSON payload receipt', (done) => {
        const payload = {
            'json': 'hello world',
        };
        const receipt = {
            Store: 'GooglePlay',
            Payload: JSON.stringify(payload),
        };
        const receiptBase64 = Buffer.from(JSON.stringify(receipt), 'utf8').toString('base64');

        chai.request(baseUrl)
            .get(getUrl)
            .set('receipt-to-be-verified', receiptBase64)
            .end((err, res) => {
                assert.equal(res.status, 400);
                assert.equal(res.text, 'Invalid JSON payload json field.');
                done();
            });
    });

    it('should fail with empty JSON payload json receipt', (done) => {
        const payloadJson = {};
        const payload = {
            'json': JSON.stringify(payloadJson),
        };
        const receipt = {
            Store: 'GooglePlay',
            Payload: JSON.stringify(payload),
        };
        const receiptBase64 = Buffer.from(JSON.stringify(receipt), 'utf8').toString('base64');

        chai.request(baseUrl)
            .get(getUrl)
            .set('receipt-to-be-verified', receiptBase64)
            .end((err, res) => {
                assert.equal(res.status, 400);
                assert.equal(res.text, 'Not verified with exception.');
                done();
            });
    });
});
