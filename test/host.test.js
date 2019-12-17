const chaiHttp = require('chai-http');
const chai = require('chai');
chai.use(chaiHttp);
const expect = chai.expect;
const HOST = "http://127.0.0.1:5000";

describe('Host', () => {
    const NAME = "test";
    it('should create a new table', (done) => {
        const PATH = `/create/${NAME}`;
        chai.request(HOST)
            .get(PATH)
            .end((error, res, body) => {
                const response = res.body;
                expect(response.message).to.equal('Success');
                done();
            });
    });

    it('should list me all the tables', (done) => {
        const PATH = `/list/`;
        chai.request(HOST)
            .get(PATH)
            .end((error, res, body) => {
                const response = res.body;
                expect(response.data).to.deep.equal([NAME]);
                done();
            });
    });

    it('should insert data to the table', (done) => {
        const DATA = JSON.stringify({key: "X", value: "Y"});
        const PATH = `/insert/${NAME}/${DATA}`;
        chai.request(HOST)
            .get(PATH)
            .end((error, res, body) => {
                const response = res.body;
                expect(response.message).to.equal('Success');
                done();
            });
    });

    it('should return me data from the table', (done) => {
        const QUERY = JSON.stringify({value: "Y"});
        const PATH = `/read/${NAME}/${QUERY}`;
        chai.request(HOST)
            .get(PATH)
            .end((error, res, body) => {
                const response = res.body;
                expect(response.message).to.equal('Success');
                const data = response.data;
                expect(data).to.deep.equal([{key: "X", value: "Y"}]);
                done();
            });
    });

    it('should return me all data from the table if not providing query', (done) => {
        const PATH = `/read/${NAME}`;
        chai.request(HOST)
            .get(PATH)
            .end((error, res, body) => {
                const response = res.body;
                expect(response.message).to.equal('Success');
                const data = response.data;
                expect(data).to.deep.equal([{key: "X", value: "Y"}]);
                done();
            });
    });

    it('should update the data', (done) => {
        const QUERY = JSON.stringify({key: "X"});
        const UPDATE = JSON.stringify({value: "Z"});
        const PATH = `/update/${NAME}/${QUERY}/${UPDATE}`;
        chai.request(HOST)
            .get(PATH)
            .end((error, res, body) => {
                const response = res.body;
                expect(response.message).to.equal('Success');
                const updated = response.update;
                expect(updated.data).to.deep.equal([{key: "X", value: "Z"}]);
                expect(updated.count).to.equal(1);
                done();
            });
    });

    it('should delete nothing if query not matched', (done) => {
        const QUERY = JSON.stringify({key: "J", value: "Z"});
        const PATH = `/delete/${NAME}/${QUERY}`;
        chai.request(HOST)
            .get(PATH)
            .end((error, res, body) => {
                const response = res.body;
                expect(response.message).to.equal('Success');
                const deleted = response.delete;
                expect(deleted.data).to.deep.equal([]);
                expect(deleted.count).to.equal(0);
                done();
            });
    });

    it('should delete everything if query is not provided', (done) => {
        const PATH = `/delete/${NAME}`;
        chai.request(HOST)
            .get(PATH)
            .end((error, res, body) => {
                const response = res.body;
                expect(response.message).to.equal('Success');
                const deleted = response.delete;
                expect(deleted.data).to.deep.equal([{key: "X", value: "Z"}]);
                expect(deleted.count).to.equal(1);
                done();
            });
    });

    it('should drop the table', (done) => {
        const PATH = `/drop/${NAME}`;
        chai.request(HOST)
            .get(PATH)
            .end((error, res, body) => {
                const response = res.body;
                expect(response.message).to.equal('Success');
                done();
            });
    });

    it('should list me all the tables', (done) => {
        const PATH = `/list/`;
        chai.request(HOST)
            .get(PATH)
            .end((error, res, body) => {
                const response = res.body;
                expect(response.data).to.deep.equal([]);
                done();
            });
    });
});