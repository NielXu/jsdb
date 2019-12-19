const { BasicTable } = require('./table');
const { exportObject, importObject } = require('./json');
const homedir = require('os').homedir();
const path = require('path');

/**
 * The normal database that can perform CRUD
 * operations but it is mutable, which means
 * it will modify the original data passed from
 * the constructor.
 */
class Database {
    constructor() {
        this.data = {};
        this.using = null;
        this.type="basic";
    }

    /**
     * Create a new table with given name.
     * 
     * @param {String} tableName Name of the new table
     * @param {Object} init The initial data be passed in the table, optional
     */
    create(tableName, init) {
        if(this.data.hasOwnProperty(tableName)) {
            throw `Table with name "${tableName}" already exists`;
        }
        this.data[tableName] = new BasicTable(tableName, init);
    }

    /**
     * Drop a table from the database, all the data will be removed.
     * 
     * @param {String} tableName Name of the table
     */
    drop(tableName) {
        if(!this.data.hasOwnProperty(tableName)) {
            throw `Table with name "${tableName}" does not exists"`;
        }
        delete this.data[tableName];
    }

    /**
     * Use a table, if no table was selected before
     * querying, exception will be raised.
     * 
     * @param {String} tableName Name of the table
     */
    use(tableName) {
        if(!this.data.hasOwnProperty(tableName)) {
            throw `Table with name "${tableName}" does not exists`;
        }
        this.using = tableName;
    }

    /**
     * List all the table names, return a list of strings
     */
    list() {
        let names = [];
        for(var key in this.data) {
            names.push(key);
        }
        return names;
    }

    /**
     * Insert new document(object) into the
     * database.
     * 
     * @param {Object} document New document
     * @param {String} tableName Table to use, this will ignore the current selection
     * of the database, it is not recommended to use
     */
    insert(document, tableName) {
        this.data[this._checkUse(tableName)].insert(document);
    }

    /**
     * Reading from the database by query and return
     * the corresponding data. If query is an empty
     * object all the data will be returned.
     * 
     * @param {Object} query Query object
     * @param {String} tableName Table to use, this will ignore the current selection
     * of the database, it is not recommended to use
     */
    read(query, tableName) {
        return this.data[this._checkUse(tableName)].read(query);
    }

    /**
     * Update the data that matched the query. If the
     * query has key like `{key.A.B: "someValue"}`, the
     * update will not affect the existing fields, but if
     * the query is `{key: {A: {B: "someValue"}}}`, the
     * existing fields will be replaced. Return an object
     * that contains the newly updated data and the number
     * of affected data as the result. 
     * 
     * @param {Object} query Query object
     * @param {Object} update Update object
     * @param {String} tableName Table to use, this will ignore the current selection
     * of the database, it is not recommended to use
     */
    update(query, update, tableName) {
        return this.data[this._checkUse(tableName)].update(query, update);
    }

    /**
     * Delete all data that match the query, if the query
     * is empty all data will be deleted. Return an object
     * that contains the number of affected data and the
     * deleted data as the result.
     * 
     * @param {Object} query Query object
     * @param {String} tableName Table to use, this will ignore the current selection
     * of the database, it is not recommended to use
     */
    delete(query, tableName) {
        return this.data[this._checkUse(tableName)].delete(query);
    }

    /**
     * Internal function, check the current use of table, return
     * a correct table name or raise exception if error occured
     * 
     * @param {String} tableName Optional tableName
     */
    _checkUse(tableName) {
        let table;
        if(tableName) {
            if(!this.data.hasOwnProperty(tableName)) {
                throw `Table with name "${tableName}" does not exists`;
            }
            table = tableName;
        }
        else {
            if(!this.using) {
                throw "No table is selected";
            }
            table = this.using;
        }
        return table;
    }
}

function _checkKey(obj, key) {
    if(obj.hasOwnProperty(key)) {
        return obj[key];
    }
    throw `Key "${key}" does not exists`;
}

/**
 * Import data from JSON file and return a corresponding database.
 * The default location of the JSON files will be `~/.jsdb`. If
 * a JSON file with the given name already exists, it will be
 * overwrited and the original data will lost.
 * 
 * @param {String} name Name of the JSON file to be imported
 * @param {String} p Path to the JSON file, default is `~/.jsdb`
 */
function importDatabase(name, p=`${path.resolve(homedir, ".jsdb")}`) {
    const obj = importObject(p, name);
    const dbType = _checkKey(obj, "type");
    let db;
    if(dbType === "basic") {
        db = new Database();
    }
    const tables = _checkKey(obj, "tables");
    tables.forEach(e => {
        db.create(_checkKey(e, "name"), _checkKey(e, "data"));
    });
    return db;
}

/**
 * Export a database to a JSON file, save all the tables and data
 * into it. If a JSON file with the given name already exists, it
 * will be overwrited and the original data will lost.
 * 
 * @param {Database} db The database to be exported
 * @param {String} name Name of the JSON file that will be used when exporting
 * @param {String} p Path to export the JSON file, default is `~/.jsdb`
 */
function exportDatabase(db, name, p=`${path.resolve(homedir, ".jsdb")}`) {
    const data = db.data;
    let tables = [];
    for(var key in data) {
        tables.push(data[key]);
    }
    exportObject({
        tables: tables,
        type: db.type,
    }, p, name);
}

module.exports = {
    BasicDatabase: Database,
    importDatabase: importDatabase,
    exportDatabase: exportDatabase
}