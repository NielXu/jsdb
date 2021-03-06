const express = require('express');
const { BasicDatabase } = require('./db');
const argv = require('yargs').argv;

const app = new express();
const db = new BasicDatabase();
app.set('json spaces', 2);

app.get('/', (req, res, next) => {
    res.json({
        message: "Welcome to JSDB host, the following list of urls can be used to operate the database",
        urls: [
            {
                url: "GET /create/{tableName}",
                manual: "Create a new table with given name"
            }, {
                url: "GET /drop/{tableName}",
                manual: "Drop a table by its name"
            }, {
                url: "GET /list",
                manual: "List all the table names"
            }, {
                url: "GET /insert/{tableName}/{data}",
                manual: "Insert new data to the table"
            }, {
                url: "GET /read/{tableName}/{query}?",
                manual: "Read data from the table that matched the query",
                additional: "If query is not provided, all data from the table will be returned"
            }, {
                url: "GET /update/{tableName}/{query}/{update}",
                manual: "Update the data in table that matched the query",
                additional: "The updated data will be returned"
            }, {
                url: "GET /delete/{tableName}/{query}",
                manual: "Delete the data in table that matched the query",
                additional: "If query is not provided, all data in the table will be deleted, deleted data will be returned"
            },
        ]
    });
});

app.get('/list', (req, res, next) => {
    try {
        const result = db.list();
        res.json({message: 'Success', data: result});
    }
    catch(e) {
        res.json({message: "Error occured when listing tables", error: e.message? e.message : e});
    }
});

app.get('/create/:tableName', (req, res, next) => {
    if(!req.params.tableName) {
        res.json({message: "Erorr: missing tableName in url"});
    }
    else {
        try {
            db.create(req.params.tableName);
            res.json({message: 'Success'});
        }
        catch(e) {
            res.json({
                message: `Error occured when creating new table "${req.params.tableName}"`,
                error: e.message? e.message : e
            });
        }
    }
});

app.get('/drop/:tableName', (req, res, next) => {
    if(!req.params.tableName) {
        res.json({message: "Error: missing tableName in url"});
    }
    else {
        try {
            db.drop(req.params.tableName);
            res.json({message: 'Success'});
        }
        catch(e) {
            res.json({
                message: `Error occured when dropping table "${req.params.tableName}"`,
                error: e.message? e.message : e
            });
        }
    }
});

app.get('/insert/:tableName/:data', (req, res, next) => {
    if(!req.params.tableName) {
        res.json({message: "Error: missing tableName in url"});
    }
    else if(!req.params.data) {
        res.json({message: "Error: missing data in url"});
    }
    else {
        try {
            const data = JSON.parse(req.params.data);
            db.insert(data, req.params.tableName);
            res.json({message: 'Success'});
        }
        catch(e) {
            res.json({
                message: `Error occured when inserting data to table`,
                error: e.message? e.message : e
            });
        }
    }
});

app.get('/read/:tableName/:query?', (req, res, next) => {
    if(!req.params.tableName) {
        res.json({message: "Error: missing tableName in url"});
    }
    else {
        try {
            const query = req.params.query? JSON.parse(req.params.query) : {};
            const result = db.read(query, req.params.tableName);
            res.json({message: 'Success', data: result});
        }
        catch(e) {
            res.json({
                message: `Error occured when reading data`,
                error: e.message? e.message : e
            });
        }
    }
});

app.get('/update/:tableName/:query/:update', (req, res, next) => {
    if(!req.params.tableName) {
        res.json({message: "Error: missing tableName in url"});
    }
    else if(!req.params.query) {
        res.json({message: "Error: missing query in url"});
    }
    else if(!req.params.update) {
        res.json({message: "Error: missing update in url"});
    }
    else {
        try {
            const query = JSON.parse(req.params.query);
            const update = JSON.parse(req.params.update);
            const updated = db.update(query, update, req.params.tableName);
            res.json({message: 'Success', update: updated});
        }
        catch(e) {
            res.json({
                message: `Error occured when updating data`,
                error: e.message? e.message : e
            });
        }
    }
});

app.get('/delete/:tableName/:query?', (req, res, next) => {
    if(!req.params.tableName) {
        res.json({message: "Error: missing tableName in url"});
    }
    else {
        try {
            const query = req.params.query? JSON.parse(req.params.query) : {};
            const deleted = db.delete(query, req.params.tableName);
            res.json({message: 'Success', delete: deleted});
        }
        catch(e) {
            res.json({
                message: `Error occured when deleting data`,
                error: e.message? e.message : e
            });
        }
    }
});

const PORT = argv.PORT? argv.PORT : 5000;
app.listen(PORT);
console.log(`JSDB running on PORT: ${PORT} ...`);