var express = require('express');
var router = express.Router();
var db = require('../db.js');
var conn = null;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'Login Agent Account' });
});

/* GET login page. */
router.post('/login', function (req, res, next) {
    var email = req.body.emailAddress;
    var psd = req.body.psd;
    data = {"name": email};
    res.render('portal', { title: 'Welcome ' + email, data: data });
});

/* GET portal page*/
router.get('/portal', function (req, res, next) {
    var decision = req.query.action;
    if (decision == "audit") {
        res.render('submit', { title: 'Submit Twitter Account' });
    } else if (decision == "review") {
        res.render('review', { title: 'Review Previous Decision' });
    } else {
        data = {"name": "XXX"};
        res.render('portal', { title: 'Welcome' , data: data });
    }
});

/* GET review page */
router.get('/review', function (req, res, next) {
    res.render('review', { title: 'Review Previous Decision' });
});

/* GET detail page */
router.get('/detail', function (req, res, next) {
    res.render('detail', { title: 'Decision Detail' });
});

/* GET submit page. */
router.get('/submit', function(req, res, next) {
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

/* GET report page. */
router.get('/report', function(req, res, next) {
    var decision = req.query.action;
    if (decision == "no") {
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
    } else {
        res.render('decision', { title: 'Make a Decision' });
    }
});

/* GET anonymized page. */
router.get('/anonymized', function(req, res, next) {
    var decision = req.query.action;
    if (decision == "no") {
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
    } else {
        res.render('decision', { title: 'Make a Decision' });
    }
});

/* GET original page. */
router.get('/original', function(req, res, next) {
    res.render('decision', { title: 'Make a Decision' });
});

/* GET decision page. */
router.get('/decision', function(req, res, next) {
    var decision = req.query.action;
    if (decision == "yes") {
        ;
    } else {
        ;
    }
    res.render('submit', { title: 'Submit Twitter Account' });
});

module.exports = router;
