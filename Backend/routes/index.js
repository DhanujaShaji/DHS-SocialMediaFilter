var express = require('express');
var router = express.Router();
var db = require('../db.js');
var conn = null;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('submit', { title: 'Submit Twitter Account' });
});

/* GET submit page. */
router.get('/submit', function(req, res, next) {
    res.render('submit', { title: 'Submit Twitter Account' });
});

/* GET report page. */
router.get('/report', function(req, res, next) {
    var account = req.query.Account;
    if (!!conn && !!conn._socket.readable) {
        conn = conn;
    } else {
        conn = db.getConnection(db.client, db.settings);
        db.connectDB(conn);
    }
    conn.query('SELECT * FROM user', function(err, result) {
        console.log(result);
    });
    data = [
        {'title': 'Flagged Tweets:', 'content': [
            {'type': 'paragraph', 'content': 'Total Number: 123 Flagged Number: 23 Percentage: xx%'}
        ]},
        {'title': 'Blacklist Followers:', 'content': [
            {'type': 'paragraph', 'content': 'Total Number: 321 Flagged Number: 21 Percentage: xx%'}
        ]},
        {'title': 'Other Statistic Report:', 'content': [
            {'type': 'paragraph', 'content': '......'}
        ]}];
    res.render('report', { title: 'Statistic Report', data: data });
});

/* GET anonymized page. */
router.get('/anonymized', function(req, res, next) {
    var account = req.query.Account;
    if (!!conn && !!conn._socket.readable) {
        conn = conn;
    } else {
        conn = db.getConnection(db.client, db.settings);
        db.connectDB(conn);
    }
    data = [
        {'type': 'danger', 'date': '2012-12-21', 'comment': '(flagged)', 'content': [
            {'type': 'text', 'content': '2012 will'},
            {'type': 'keyword', 'content': 'destroy', 'level': 'danger', 'reason-title': 'Sensitive Type',
                'reason-content': 'Dangerous Keyword'},
            {'type': 'text', 'content': 'the world!!!'},
            {'type': 'at', 'content': '@***'},
            {'type': 'tag', 'content': '#***'}
        ]},
        {'type': 'warning', 'date': '2012-12-21', 'comment': '(uncertain)', 'content': [
            {'type': 'text', 'content': "The world hasn\'t been"},
            {'type': 'keyword', 'content': 'destroyed', 'level': 'warning', 'reason-title': 'Sensitive Type',
                'reason-content': 'Dangerous Keyword'},
            {'type': 'text', 'content': '!!!'},
            {'type': 'at', 'content': '@***'},
            {'type': 'tag', 'content': '#***'}
        ]},
        {'type': 'success', 'date': '2012-12-22', 'comment': '(not flagged)', 'content': [
            {'type': 'text', 'content': 'Hello World :)'},
            {'type': 'at', 'content': '@***'},
            {'type': 'tag', 'content': '#***'}
        ]}
    ];
    res.render('anonymized', { title: 'Anonymized Twitter Data', data: data });
});

/* GET original page. */
router.get('/original', function(req, res, next) {
    var account = req.query.Account;
    if (!!conn && !!conn._socket.readable) {
        conn = conn;
    } else {
        conn = db.getConnection(db.client, db.settings);
        db.connectDB(conn);
    }
    data = [
        {'type': 'danger', 'date': '2012-12-21', 'comment': '(flagged)', 'content': [
            {'type': 'text', 'content': '2012 will'},
            {'type': 'keyword', 'content': 'destroy', 'level': 'danger', 'reason-title': 'Sensitive Type',
                'reason-content': 'Dangerous Keyword'},
            {'type': 'text', 'content': 'the world!!!'},
            {'type': 'at', 'content': '@someone'},
            {'type': 'tag', 'content': '#sometag'}
        ]},
        {'type': 'warning', 'date': '2012-12-21', 'comment': '(uncertain)', 'content': [
            {'type': 'text', 'content': "The world hasn\'t been"},
            {'type': 'keyword', 'content': 'destroyed', 'level': 'warning', 'reason-title': 'Sensitive Type',
                'reason-content': 'Dangerous Keyword'},
            {'type': 'text', 'content': '!!!'},
            {'type': 'at', 'content': '@someone'},
            {'type': 'tag', 'content': '#sometag'}
        ]},
        {'type': 'success', 'date': '2012-12-22', 'comment': '(not flagged)', 'content': [
            {'type': 'text', 'content': 'Hello World :)'},
            {'type': 'at', 'content': '@someone'},
            {'type': 'tag', 'content': '#sometag'}
        ]}
    ];
    res.render('original', { title: 'Original Twitter Data:', data: data });
});

/* GET decision page. */
router.get('/decision', function(req, res, next) {
    res.render('decision', { title: 'Make a Decision' });
});

module.exports = router;
