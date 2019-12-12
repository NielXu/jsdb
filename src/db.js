const { parseQuery } = require('./query');

/**
 * The normal database that can perform CRUD
 * operations but it is mutable, which means
 * it will modify the original data passed from
 * the constructor.
 */
class Database {
    constructor(init) {
        this.data = init? init : [];
    }

    /**
     * Insert new document(object) into the
     * database.
     * 
     * @param {Object} document New document
     */
    insert(document) {
        this.data.push(document);
    }

    /**
     * Reading from the database by query and return
     * the corresponding data. If query is an empty
     * object all the data will be returned.
     * 
     * @param {Object} query Query object
     */
    read(query) {
        return parseQuery(this.data, query);
    }

    update(query, update) {

    }

    delete(query) {
        const found = parseQuery(this.data, query);
        let candidate = [];
        for(var i=0;i<this.data.length;i++) {
            const data = this.data[i];
            for(var j=0;j<found.length;j++) {
                const foundData = found[j];
                if(data == foundData) {
                    candidate.push(i);
                }
            }
        }
        for(var i=candidate.length-1;i>=0;i--) {
            this.data.splice(candidate[i], 1);
        }
    }
}

module.exports = {
    BasicDatabase: Database
}