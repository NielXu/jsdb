const { importObject, exportObject } = require('../src/json');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

const FILE = "test.json";
const FILE_PATH = path.resolve(__dirname, FILE);

describe('Export', () => {
    it('should raise error if path not exists', () => {
        const p = path.resolve(__dirname, 'null');
        expect(()=>
            exportObject({}, p, FILE))
        .to.throw(`Path not found: ${p}`);
    });

    it('should raise error if it is not object type', () => {
        expect(()=>exportObject("Test", __dirname, FILE)).to.throw(`Unsupported object type: string`);
    });

    it('should save create new JSON file with the object', () => {
        const data = {
            key: "X",
            value: "Y"
        };
        exportObject(data, __dirname, FILE);
        expect(fs.existsSync(FILE_PATH)).to.be.true;
    });

    it('should work if not providing the .json extension', () => {
        const data = {
            key: "X",
            value: "Y"
        };
        exportObject(data, __dirname, "test");
        expect(fs.existsSync(FILE_PATH)).to.be.true;
    });

    // Cleanup
    after(() => {
        fs.unlinkSync(FILE_PATH);
    });
});

describe('Import', () => {
    before(() => {
        const data = {
            key: "X",
            value: "Y"
        };
        exportObject(data, __dirname, FILE);
        expect(fs.existsSync(FILE_PATH)).to.be.true;
    });

    it('should raise error if cannot find the JSON file', () => {
        const p = path.resolve(__dirname, "null");
        expect(()=>importObject(p, FILE)).to.throw(`JSON file does not exists ${p}`);
    });

    it('should import the JSON object from file', () => {
        const obj= importObject(__dirname, FILE);
        expect(obj).to.deep.equal({key: "X", value: "Y"});
    });

    it('should be able to import array', () => {
        const data = [{key: "X", value: "Y"}, {key: "G", value: "Z"}];
        exportObject(data, __dirname, FILE);
        const obj = importObject(__dirname, FILE);
        expect(obj).to.deep.equal(data);
    })

    // Cleanup
    after(() => {
        fs.unlinkSync(FILE_PATH);
    });
});