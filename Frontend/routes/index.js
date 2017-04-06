var express = require('express');
var router = express.Router();
var db = require('../db.js');
var conn = null;

/* GET home page. */
router.get('/', function(req, res, next) {

    // TODO: goto portal page if login

    // goto login page if not login
    res.render('login', { title: 'Login Agent Account' });
});

/* GET login page. */
router.post('/login', function (req, res, next) {
    var decision = req.body.action;
    if (decision == 'login') {
        var username = req.body.username;
        var psd = req.body.psd;

        // TODO: authentication

        // TODO: get current user info
        data = {"name": username};

        res.render('portal', {title: 'Welcome ' + username, data: data});
    } else if (decision == 'forgetPassword') {
        // TODO: forget password
    }
});

/* GET portal page*/
router.get('/portal', function (req, res, next) {
    var decision = req.query.action;
    if (decision == "audit") {

        // TODO: send current user identifier to distinguish different decision
        auditData = [];

        res.render('submit', { title: 'Submit Twitter Account', data: auditData });
    } else if (decision == "review") {

        // TODO: add previous decisions to data
        previousDecisions = [];

        res.render('review', { title: 'Review Previous Decision', data: previousDecisions });
    } else if (decision == 'passcode') {

        // TODO: generate passcode (supervisor only)
        data = {"passcode": "slopitjmgbhnkirot456rky"};

        res.render('passcode', { title: 'Passcode' , data: data });
    } else {
        // TODO: get current user info
        data = {"name": 'user'};

        res.render('portal', {title: 'Welcome ' + 'user', data: data});
    }
});

router.get('/passcode', function (req, res, next) {
    var decision = req.query.action;
    if (decision == 'generate') {

        // TODO: generate passcode (supervisor only)
        data = {"passcode": "ap893rhdfaw893ey4htp2"};

        res.render('passcode', { title: 'Passcode' , data: data });
    } else if (decision == 'back') {

        // TODO: get current user info
        data = {"name": 'user'};

        res.render('portal', {title: 'Welcome ' + 'user', data: data});
    }
});

/* GET review page */
router.get('/review', function (req, res, next) {

    // TODO: add previous decisions to data
    previousDecisions = [];

    res.render('review', { title: 'Review Previous Decision' });
});

/* GET detail page */
router.get('/detail', function (req, res, next) {

    // TODO: send decision detail info
    decisionData = {};

    res.render('detail', { title: 'Decision Detail', data: decisionData });
});

/* GET submit page. */
router.get('/submit', function(req, res, next) {

    // TODO: mockup data, need to replace with the real data from database
    data = [
        {'title': 'Flagged Tweets:', 'content': [
            {'type': 'paragraph', 'content': '[num of flagged tweets] ([percentage]). || Average per traveler: [average number of flagged tweets]'},
            {'type': 'paragraph', 'content': 'Ex). 120 (49%). || Average per traveler: 19'}
        ]},
        {'title': 'Blacklisted Entities Following:', 'content': [
            {'type': 'paragraph', 'content': '[num of blacklisted entities following] ([percentage])'},
            {'type': 'paragraph', 'content': 'Ex). 30 (12%)'}
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

        // TODO: mockup data, need to replace with the real data from database
        data = [
            {'type': 'danger', 'date': '2012-12-21', 'comment': '(flagged)', 'content': [
                {'type': 'text', 'content': 'Cookies are bad I will '},
                {'type': 'keyword', 'content': 'kill ', 'level': 'danger', 'reason-title': 'Sensitive Type',
                    'reason-content': 'Dangerous Keyword'},
                {'type': 'text', 'content': 'them. '},
                {'type': 'at', 'content': '@user'},
                {'type': 'tag', 'content': '#tag'}
            ]},
            {'type': 'success', 'date': '2012-12-22', 'comment': '(not flagged)', 'content': [
                {'type': 'text', 'content': 'I had '},
                {'type': 'keyword', 'content': '***** ', 'level': 'warning', 'reason-title': 'Anonymized Info',
                    'reason-content': 'censors personal info'},
                {'type': 'at', 'content': '@user'},
                {'type': 'tag', 'content': '#tag'}
            ]},
            {'type': 'success', 'date': '2012-12-22', 'comment': '(not flagged)', 'content': [
                {'type': 'text', 'content': 'I like pie. \n'},
                {'type': 'at', 'content': '@user'},
                {'type': 'tag', 'content': '#tag'}
            ]}
        ];

        res.render('anonymized', { title: 'Anonymized Twitter Data', data: data });
    } else {

        // TODO: add some info to make a decision
        data = [];

        res.render('decision', { title: 'Make a Decision', data: data });
    }
});

/* GET anonymized page. */
router.get('/anonymized', function(req, res, next) {
    var decision = req.query.action;
    if (decision == "no") {

        // TODO: mockup data, need to replace with the real data from database
        data = [
            {'type': 'danger', 'date': '2012-12-21', 'comment': '(flagged)', 'content': [
                {'type': 'text', 'content': '2012 will'},
                {'type': 'keyword', 'content': 'destroy', 'level': 'danger', 'reason-title': 'Sensitive Type',
                    'reason-content': 'Dangerous Keyword'},
                {'type': 'text', 'content': 'the world!!!'},
                {'type': 'at', 'content': '@someone'},
                {'type': 'tag', 'content': '#sometag'}
            ]},
            {'type': 'success', 'date': '2012-12-22', 'comment': '(not flagged)', 'content': [
                {'type': 'text', 'content': 'I had sex with her tonight'},
                {'type': 'at', 'content': '@someone'},
                {'type': 'tag', 'content': '#sometag'}
            ]}
        ];

        res.render('original', { title: 'Original Twitter Data:', data: data });
    } else {

        // TODO: add some info to make a decision
        data = [];

        res.render('decision', { title: 'Make a Decision' });
    }
});

/* GET original page. */
router.get('/original', function(req, res, next) {

    // TODO: add some info to make a decision
    data = [];

    res.render('decision', { title: 'Make a Decision' });
});

/* GET decision page. */
router.get('/decision', function(req, res, next) {
    var decision = req.query.action;
    if (decision == "yes") {
        // TODO: pass decision
    } else {
        // TODO: deny decision
    }
    res.render('submit', { title: 'Submit Twitter Account' });
});

module.exports = router;
