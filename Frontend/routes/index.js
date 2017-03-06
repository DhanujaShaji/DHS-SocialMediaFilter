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
    res.render('report', { title: 'Statistic Report' });
});

/* GET anonymized page. */
router.get('/anonymized', function(req, res, next) {
    res.render('anonymized', { title: 'Anonymized Twitter Data' });
});

/* GET original page. */
router.get('/original', function(req, res, next) {
    res.render('original', { title: 'Original Twitter Data:' });
});

/* GET decision page. */
router.get('/decision', function(req, res, next) {
    res.render('decision', { title: 'Make a Decision' });
});

module.exports = router;
