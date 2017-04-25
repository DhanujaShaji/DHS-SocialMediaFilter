/**
 *
 * used to connect to database
 */

var express = require('express');
var client = require('mysql');
var app = express();

/**
 * init database setting
 */
var settings = {
    host: '104.197.6.255',
    user: 'peuser',
    password: 'peuser',
    database: 'EPS'
};

function getConnection(client, settings) {
    return client.createConnection(settings);
}

function connectFun(conn) {
    conn.connect(function (error, results) {
        if (error) {
            console.log('Connection Error: ' + error.message);
            return;
        }
        console.log('Connected to MySQL');
    });
}

function execQuery(sql, conn, successFun, errFun) {
    conn.query(sql, function (err, rows, fields) {
        if (err) throw err;
        if (rows.constructor === Array) {
            if (!!rows.length) {

                successFun();
            } else {
                errFun();
            }
        } else {
            if (rows.affectedRows === 1) {
                successFun();
            } else {
                errFun();
            }
        }
    });
}

var exports = {
    client: client,
    settings: settings,
    getConnection: getConnection,
    connectDB: connectFun,
    execQuery: execQuery
};

module.exports = exports;