var express = require('express');
var router = express.Router();
var db = require('../db.js');
var conn = null;
var GLUserId = null;

function dealWithContent(value,indice,context,level) {
    var res=[];
    if(value)
    var str1 = value.slice(0,indice);
    res.push({type:"text", content: str1});
    res.push({type:"keyword",
        content:context,
        level:level,
        reasonTitle:"Sensitive Type",
        reasonContent:"Dangerous Keyword"});
    var length=context.length;
    var str2 = value.slice(indice+length);
    res.push({type:"text", content: str2});
    return res;
}

function dealWithPostTime(time) {
    return time.slice()
}
/* GET login page. */
// TODO: implement your login system
var isLogin = false;

// TODO: implement your passcode generate system
var generatedPasscodes = [];


=======


/* GET default page. */
router.get('/', function(req, res, next) {
    // TODO: check current login status

    if (isLogin) {
        res.redirect('portal')
    } else {
        res.redirect('login');
    }
});

<<<<<<< HEAD
/* GET portal page. */
router.post('/login', function (req, res, next) {
    var email = req.body.emailAddress;
    var psd = req.body.psd;
    data = {"name": email};
    res.render('portal', { title: 'Welcome ' + email, data: data});
=======
/* GET login page. */
router.get('/login', function (req, res, next) {
    // TODO: check current login status

    if (isLogin) {
        res.redirect('portal')
    } else {
        res.render('login', {title: 'Login Agent Account'});
    }
});

/* POST login page. */
router.post('/login', function (req, res, next) {
    // TODO: check current login status

    var decision = req.body.action;

    if (isLogin) {
        res.redirect('portal');
    } else if (decision == 'login') {
        var username = req.body.username;
        var psd = req.body.psd;

        // TODO: authentication
        var authenticateResult = true;
        isLogin = true;

        if (authenticateResult) {
            // TODO: get current user info
            var data = {"name": username};

            res.redirect('portal');
        } else {
            res.render('error', {
                title: 'Incorrect Username/Password',
                message: 'Incorrect username/password combination',
                info: 'The credentials you entered are invalid. If you forgot ' +
                'your password, please click “Forgot Password” to reset it.'
            });
        }
    } else if (decision == 'forgetPassword') {
        // TODO: forget password
    } else {
        res.redirect('login');
    }
>>>>>>> 6181d1cf4da546fba0e99548e8b47e44af9fd694
});

/* GET page*/
router.get('/portal', function (req, res, next) {
    // TODO: check current login status

    var decision = req.query.action;
<<<<<<< HEAD
    if (decision === "audit") {
        res.render('submit', { title: 'Submit Twitter Account' });
    } else if (decision === "review") {
        res.render('review', { title: 'Review Previous Decision' });
=======

    if (isLogin == false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision == "audit") {
        res.redirect('submit');
    } else if (decision == "review") {
        res.redirect('review');
    } else if (decision == 'passcode') {
        // TODO: generate passcode (supervisor only)

        res.redirect('passcode');
    } else if (decision == 'account') {
        // TODO: get account list (supervisor only)

        // TODO: implement account management
        res.redirect('portal');
>>>>>>> 6181d1cf4da546fba0e99548e8b47e44af9fd694
    } else {
        // TODO: get current user info
        var data = {"name": 'user'};

        res.render('portal', {title: 'Welcome ' + 'user', data: data});
    }
});

router.get('/passcode', function (req, res, next) {
    // TODO: check current login status
    // TODO: check current user role
    var hasPermission = true;

    var decision = req.query.action;

    if (isLogin == false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (hasPermission == false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You do not have permission to view this page.'
        });
    } else if (decision == 'generate') {
        // TODO: store new passcode into database
        var code = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 30);
        generatedPasscodes.push({'code': code, 'valid': 'valid'});

        var data = {'passcode': code, 'generatedPasscodes': generatedPasscodes};

        res.render('passcode', { title: 'Passcode' , data: data });
    } else if (decision == 'home') {
        res.redirect('portal');
    } else {
        // TODO: get generated passcode from database
        data = {'passcode': 'passcode placeholder...', 'generatedPasscodes': generatedPasscodes};

        res.render('passcode', { title: 'Passcode' , data: data });
    }
});

/* GET review page */
router.get('/review', function (req, res, next) {
    // TODO: check current login status

    var decision = req.query.action;

    if (isLogin == false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision == 'home') {
        res.redirect('portal');
    } else {
        // TODO: add previous decisions to data
        var previousDecisions = [
            {'id': '1', 'date': '12/12/2017', 'twitter': 'Cookie_lover', 'agent': 'Darth Vader'},
            {'id': '2', 'date': '12/11/2017', 'twitter': 'Privacy_lover', 'agent': 'XXX'}
        ];

        res.render('review', {title: 'Review Previous Decision', 'previousDecisions': previousDecisions});
    }
});

/* GET detail page */
router.get('/detail', function (req, res, next) {
    // TODO: check current login status

    var decision = req.query.action;

    var id = req.query.id;

    if (isLogin == false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision == 'review' && typeof(id) != 'undefined') {
        // TODO: send decision detail info
        var decisionData = {};

        res.render('detail', {title: 'Decision Detail', data: decisionData});
    } else if (decision == 'increase' && typeof(id) != 'undefined') {
        // TODO: Increase Retention by 1 Month
    } else if (decision == 'changeDecision' && typeof(id) != 'undefined') {
        // TODO: Change Decision
    } else {
        res.redirect('review');
    }
});

/* GET report page. */
router.get('/submit', function(req, res, next) {
<<<<<<< HEAD
    var account = req.query.account;

    if (!!conn && !!conn._socket.readable) {
        conn = conn;
    } else {
        conn = db.getConnection(db.client, db.settings);
        db.connectDB(conn);
    }
    console.log("account is:",account);
    var sql = "select userId from user where userName = '" + account + "'";
    conn.query(sql,function (err, result) {
        console.log("submit->result:",result);
        if (result.length == 1) {
            for (var index in result) {
                GLUserId = result[index].userId;
                console.log("userId:", GLUserId);
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
                res.render('report', { title: 'Statistic Report'});
            }
        } else {
            console.log("cannot find users!");
            res.render('submit', { title: 'Please re-submit Twitter Account' });
        }
    });
=======
    // TODO: check current login status

    var decision = req.query.action;
    var account = req.query.twitter;

    if (isLogin == false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision == 'submit') {
        res.redirect('report?action=submit&twitter=' + account);
    } else if (decision == 'home') {
        res.redirect('portal');
    } else {
        res.render('submit', { title: 'Submit Twitter Handle'});
    }
>>>>>>> 6181d1cf4da546fba0e99548e8b47e44af9fd694
});

/* GET anonymized/decision page. */
router.get('/report', function(req, res, next) {
    // TODO: check current login status

    var decision = req.query.action;
<<<<<<< HEAD
    var userId = GLUserId;
    if (decision === "no") {
        if (!!conn && !!conn._socket.readable) {
            conn = conn;
        } else {
            conn = db.getConnection(db.client, db.settings);
            db.connectDB(conn);
        }
        var dataSQL= "select tweets.anonymizedText, tweets.postTime, flags2tweets.indices, " +
            "flags2tweets.degree, flag.flagContext " +
            "from tweets left join flags2tweets on (tweets.tweetId = flags2tweets.tweetId) " +
            "left join flag on (flags2tweets.flagId = flag.flagId) " +
            "where userId = ?;";
        conn.query(dataSQL, [userId],function(err, result) {
            var data=[];
            //console.log("result is:",result);
            for(var index in result){
                var degreeType;
                var comment;
                if(result[index].degree !== null){
                    switch(result[index].degree) {
                        case 1: degreeType = 'danger';comment='(flagged)';break;
                        case 2: degreeType = 'warning';comment='(uncertain)';break;
                    }
                    var content=dealWithContent(result[index].anonymizedText,
                        result[index].indices,
                        result[index].flagContext,
                        degreeType
                    );
                    data.push({
                        type: degreeType,
                        date: result[index].postTime.toLocaleDateString(),
                        comment: comment,
                        content: content
                    });
                } else {
                    data.push({
                        type: 'success',
                        date: result[index].postTime.toLocaleDateString(),
                        comment: '(not flagged)',
                        content: [{type:"text",content:result[index].anonymizedText}]
                    });
                }

            }
            res.render('anonymized', { title: 'Anonymized Twitter Data', data: data });
        });
=======
    var account = req.query.twitter;

    if (isLogin == false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision == 'submit' && typeof(account) != 'undefined') {
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

        res.render('report', { title: 'Statistic Report', data: data, account: account  });
    } else if (decision == 'no' && typeof(account) != 'undefined') {
        res.redirect('anonymized?action=audit&twitter=' + account);
    } else if (decision == 'yes' && typeof(account) != 'undefined') {
        res.redirect('decision?action=submit&twitter=' + account);
    } else if (decision == 'home') {
        res.redirect('portal');
>>>>>>> 6181d1cf4da546fba0e99548e8b47e44af9fd694
    } else {
        res.redirect('submit');
    }
});

/* GET original page. */
router.get('/anonymized', function(req, res, next) {
    // TODO: check current login status

    var decision = req.query.action;
<<<<<<< HEAD
    var userId = GLUserId;
    if (decision === "no") {
        if (!!conn && !!conn._socket.readable) {
            conn = conn;
        } else {
            conn = db.getConnection(db.client, db.settings);
            db.connectDB(conn);
        }
        var dataSQL= "select tweets.tweetText, tweets.postTime, flags2tweets.indices, " +
            "flags2tweets.degree, flag.flagContext " +
            "from tweets left join flags2tweets on (tweets.tweetId = flags2tweets.tweetId) " +
            "left join flag on (flags2tweets.flagId = flag.flagId) " +
            "where userId = ?;";
        conn.query(dataSQL, [userId],function(err, result) {
            var data=[];
            for(var index in result) {
                var degreeType;
                var comment;
                if (result[index].degree !== null) {
                    switch (result[index].degree) {
                        case 1:
                            degreeType = 'danger';
                            comment = '(flagged)';
                            break;
                        case 2:
                            degreeType = 'warning';
                            comment = '(uncertain)';
                            break;
                    }
                    var content = dealWithContent(result[index].tweetText,
                        result[index].indices,
                        result[index].flagContext,
                        degreeType
                    );
                    data.push({
                        type: degreeType,
                        date: result[index].postTime.toLocaleDateString(),
                        comment: comment,
                        content: content
                    });
                } else {
                    data.push({
                        type: 'success',
                        date: result[index].postTime.toLocaleDateString(),
                        comment: '(not flagged)',
                        content: [{type: "text", content: result[index].tweetText}]
                    });
                }
            }
            res.render('original', { title: 'Original Twitter Data:', data: data });
        });
=======
    var account = req.query.twitter;

    // TODO: check twitter account
    var validAccount = true;

    if (isLogin == false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (!validAccount) {
        res.render('error', {
            title: 'Twitter handle not found',
            message: 'Twitter handle not found',
            info: 'The Twitter handle entered could not be found. Please verify ' +
            'the spelling or search for the account on the Twitter website using ' +
            'either name or email of the registered account before proceeding.'
        });
    } else if (decision == 'audit' && typeof(account) != 'undefined') {
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

        res.render('anonymized', { title: 'Anonymized Twitter Data', data: data, account: account });
    } else if (decision == 'no' && typeof(account) != 'undefined') {
        var passcode = req.query.passcode;
        res.redirect('original?action=audit&passcode=' + passcode + '&twitter=' + account);
    } else if (decision == 'yes' && typeof(account) != 'undefined') {
        res.redirect('decision?action=submit&twitter=' + account);
    } else if (decision == 'home') {
        res.redirect('portal');
>>>>>>> 6181d1cf4da546fba0e99548e8b47e44af9fd694
    } else {
        res.redirect('submit');
    }
});

/* GET decision page. */
router.get('/original', function(req, res, next) {
    // TODO: check current login status

    var decision = req.query.action;
    var account = req.query.twitter;

    // TODO: check passcode
    var passcode = req.query.passcode;
    var validPasscode = true;

    if (isLogin == false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (!validPasscode) {
        res.render('error', {
            title: 'Incorrect Passcode',
            message: 'Incorrect Passcode Entry ',
            info: 'The passcode entered is not valid.'
        });
    } else if (decision == 'audit' && typeof(account) != 'undefined') {
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
                {'type': 'keyword', 'content': 'personal info ', 'level': 'warning', 'reason-title': 'Anonymized Info',
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

        res.render('original', { title: 'Original Tweets', data: data, account: account });
    } else if (decision == 'submit' && typeof(account) != 'undefined') {
        res.redirect('decision?action=submit&twitter=' + account);
    } else if (decision == 'home') {
        res.redirect('portal');
    } else {
        res.redirect('submit');
    }
});

/* GET decision page. */
router.get('/decision', function(req, res, next) {
    // TODO: check current login status

    var decision = req.query.action;
<<<<<<< HEAD
    if (decision === "yes") {

    } else {

=======
    var account = req.query.twitter;

    if (isLogin == false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision == 'submit' && typeof(account) != 'undefined') {
        // TODO: add some info to make a decision
        data = [];

        res.render('decision', { title: 'Make a Decision', account: account });
    } else if (decision == 'yes' && typeof(account) != 'undefined') {
        // TODO: make decision

        res.render('error', {
            title: 'Decision Confirmation',
            message: 'Passenger ' + account + " Pass the Audit",
            info: 'You have determined that the traveler’s Twitter ' +
            'Account raises no concerns regarding this traveler’s entry ' +
            'into the United States.'
        });
    } else if (decision == 'no' && typeof(account) != 'undefined') {
        // TODO: make decision

        res.render('error', {
            title: 'Decision Confirmation',
            message: 'Passenger ' + account + " Fail the Audit",
            info: 'You have determined that the traveler’s Twitter ' +
            'Account raises concerns regarding this traveler’s ' +
            'entry into the United States.'
        });
    } else if (decision == 'home') {
        res.redirect('portal');
    } else {
        res.redirect('submit');
>>>>>>> 6181d1cf4da546fba0e99548e8b47e44af9fd694
    }
});

module.exports = router;
