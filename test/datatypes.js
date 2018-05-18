﻿// Copyright 2014 SAP AG.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http: //www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied. See the License for the specific
// language governing permissions and limitations under the License.

'use strict';

const rfc = require('../sapnwrfc');
const should = require('should');
const Decimal = require('decimal.js');

const connParams = require('./connParams');

describe('Datatypes', function() {
    let client;

    beforeEach(function(done) {
        client = new rfc.Client(connParams);
        client.connect(function(err) {
            if (err) return done(err);
            done();
        });
    });

    afterEach(function() {
        client.close();
    });

    it('CHAR type check', function(done) {
        let importStruct = {
            RFCCHAR4: 65,
        };
        let importTable = [importStruct];
        client.invoke('STFC_STRUCTURE', { IMPORTSTRUCT: importStruct, RFCTABLE: importTable }, function(err) {
            should.exist(err);
            err.should.be.an.Object;
            err.should.have.properties({
                message: 'Char expected when filling field RFCCHAR4 of type 0',
            });
            done();
        });
    });

    it('BCD and FLOAT not a number string', function(done) {
        let importStruct = {
            RFCFLOAT: 'A',
        };
        let importTable = [importStruct];
        client.invoke('STFC_STRUCTURE', { IMPORTSTRUCT: importStruct, RFCTABLE: importTable }, function(err) {
            should.exist(err);
            err.should.be.an.Object;
            err.should.have.properties({
                code: 22,
                key: 'RFC_CONVERSION_FAILURE',
                message: 'Cannot convert string value A at position 0 for the field RFCFLOAT to type RFCTYPE_FLOAT',
            });
            done();
        });
    });

    it('BCD and FLOAT input numbers', function(done) {
        let isInput = {
            // Float
            ZFLTP: 0.123456789,

            // Decimal
            ZDEC: 12345.67,

            // Currency, Quantity
            ZCURR: 1234.56,
            ZQUAN: 12.3456,
            ZQUAN_SIGN: -12.345,
        };
        client.invoke('/COE/RBP_FE_DATATYPES', { IS_INPUT: isInput }, function(err, res) {
            should.not.exist(err);
            for (let k in isInput) {
                let inVal = isInput[k];
                let outVal = res.ES_OUTPUT[k];
                let outTyp = typeof outVal;
                if (k === 'ZFLTP') {
                    outTyp.should.equal('number');
                    outVal.should.equal(inVal);
                } else {
                    outTyp.should.equal('string');
                    outVal.should.equal(inVal.toString());
                }
            }
            done();
        });
    });

    it('BCD and FLOAT input strings', function(done) {
        let isInput = {
            // Float
            ZFLTP: '0.123456789',
            // Decimal
            ZDEC: '12345.67',
            // Currency, Quantity
            ZCURR: '1234.56',
            ZQUAN: '12.3456',
            ZQUAN_SIGN: '-12.345',
        };
        client.invoke('/COE/RBP_FE_DATATYPES', { IS_INPUT: isInput }, function(err, res) {
            should.not.exist(err);
            for (let k in isInput) {
                let inVal = isInput[k];
                let outVal = res.ES_OUTPUT[k];
                let outTyp = typeof outVal;
                if (k === 'ZFLTP') {
                    outTyp.should.equal('number');
                    inVal.should.equal(outVal.toString());
                } else {
                    outTyp.should.equal('string');
                    outVal.should.equal(inVal);
                }
            }
            done();
        });
    });

    it('BCD and FLOAT input Decimals', function(done) {
        let isInput = {
            ZFLTP: Decimal('0.123456789'),

            // Decimal
            ZDEC: Decimal('12345.67'),

            // Currency, Quantity
            ZCURR: Decimal('1234.56'),
            ZQUAN: Decimal('12.3456'),
            ZQUAN_SIGN: Decimal('-12.345'),
        };
        client.invoke('/COE/RBP_FE_DATATYPES', { IS_INPUT: isInput }, function(err, res) {
            should.not.exist(err);
            for (let k in isInput) {
                let inVal = isInput[k];
                let outVal = res.ES_OUTPUT[k];
                inVal.equals(outVal).should.equal(true);
            }
            done();
        });
    });

    it('RAW/BYTE as binary string', function(done) {
        let isInput = {
            ZRAW: '\x41\x42\x43\x44\x45\x46\x47\x48\x49\x50\x51\x52\x53\x54\x55\x56\x57',
        };
        client.invoke('/COE/RBP_FE_DATATYPES', { IS_INPUT: isInput }, function(err, res) {
            should.not.exist(err);
            Buffer(isInput.ZRAW)
                .equals(res.ES_OUTPUT.ZRAW)
                .should.equal(true);
            done();
        });
    });

    it('RAW/BYTE as string', function(done) {
        let isInput = {
            ZRAW: 'abcdefghijklmnopq',
        };
        client.invoke('/COE/RBP_FE_DATATYPES', { IS_INPUT: isInput }, function(err, res) {
            should.not.exist(err);
            Buffer(isInput.ZRAW)
                .equals(res.ES_OUTPUT.ZRAW)
                .should.equal(true);
            done();
        });
    });

    it('RAW/BYTE as Buffer', function(done) {
        let isInput = {
            ZRAW: Buffer('01234567890123456'),
        };
        client.invoke('/COE/RBP_FE_DATATYPES', { IS_INPUT: isInput }, function(err, res) {
            should.not.exist(err);
            Buffer(isInput.ZRAW)
                .equals(res.ES_OUTPUT.ZRAW)
                .should.equal(true);
            done();
        });
    });

    it('XSTRING as binary string', function(done) {
        let isInput = {
            ZRAWSTRING: '\x41\x42\x43\x44\x45\x46\x47\x48\x49\x50\x51\x52\x53\x54\x55\x56\x57',
        };
        client.invoke('/COE/RBP_FE_DATATYPES', { IS_INPUT: isInput }, function(err, res) {
            should.not.exist(err);
            Buffer(isInput.ZRAWSTRING)
                .equals(res.ES_OUTPUT.ZRAWSTRING)
                .should.equal(true);
            done();
        });
    });

    it('XSTRING as string', function(done) {
        let isInput = {
            ZRAWSTRING: 'abcdefghijklmnopq',
        };
        client.invoke('/COE/RBP_FE_DATATYPES', { IS_INPUT: isInput }, function(err, res) {
            should.not.exist(err);
            Buffer(isInput.ZRAWSTRING)
                .equals(res.ES_OUTPUT.ZRAWSTRING)
                .should.equal(true);
            done();
        });
    });

    it('XSTRING as Buffer', function(done) {
        let isInput = {
            ZRAWSTRING: Buffer('01234567890123456'),
        };
        client.invoke('/COE/RBP_FE_DATATYPES', { IS_INPUT: isInput }, function(err, res) {
            should.not.exist(err);
            Buffer(isInput.ZRAWSTRING)
                .equals(res.ES_OUTPUT.ZRAWSTRING)
                .should.equal(true);
            done();
        });
    });

    it('INT type check should detect strings', function(done) {
        let importStruct = {
            RFCINT1: '1',
        };
        let importTable = [importStruct];
        client.invoke('STFC_STRUCTURE', { IMPORTSTRUCT: importStruct, RFCTABLE: importTable }, function(err) {
            should.exist(err);
            err.should.be.an.Object;
            err.should.have.properties({
                name: 'TypeError',
                message: 'Integer number expected when filling field RFCINT1 of type 10',
            });
            done();
        });
    });

    xit('INT type check should detect floats [pending] https://github.com/nodejs/node-addon-api/issues/265', function(done) {
        let importStruct = {
            RFCINT1: 1,
            RFCINT2: 2,
            RFCINT4: 3.1,
        };
        let importTable = [importStruct];
        client.invoke('STFC_STRUCTURE', { IMPORTSTRUCT: importStruct, RFCTABLE: importTable }, function(err) {
            should.exist(err);
            err.should.be.an.Object;
            err.should.have.properties({
                name: 'TypeError',
                message: 'Integer number expected when filling field RFCINT4 of type 8',
            });
            done();
        });
    });
});