var express = require('express');
var router = express.Router();
var db = require('../db.js');
var conn = null;
var GLUserId = null;
var GLagentID = 1;
var defaultExpiringPeriod=15;
var defaultIncresePeriod=30;
var pageLimit=8;

function dealWithContent(value,indice,context,level) {
    var res=[];
    if(typeof (value) ===　'string'){
        var str1 = value.slice(0,indice);
    }
    res.push({type:"text", content: str1});
    res.push({type:"keyword",
        content:context,
        level:level,
        reasonTitle:"Sensitive Type",
        reasonContent:"Dangerous Keyword"});
    var length=context.length;
    if(typeof (value) ===　'string' ){
        var str2 = value.slice(indice+length);
    }
    res.push({type:"text", content: str2});
    return res;
}

function dealWithPostTime(time) {
    return time.slice()
}

// TODO: implement your login system
var isLogin = false;

// TODO: implement your passcode generate system
var generatedPasscodes = [];

/* GET default page. */
router.get('/', function(req, res, next) {
    // TODO: check current login status
    if (isLogin) {
        res.redirect('portal')
    } else {
        res.redirect('login');
    }
});

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
    } else if (decision === 'login') {
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
    } else if (decision === 'forgetPassword') {
        // TODO: forget password
    } else {
        res.redirect('login');
    }
});

/* GET portal page*/
router.get('/portal', function (req, res, next) {
    // TODO: check current login status
    var decision = req.query.action;
    if (isLogin === false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision === "audit") {
        res.redirect('submit');
    } else if (decision === "review") {
        res.redirect('review');
    } else if (decision === 'passcode') {
        // TODO: generate passcode (supervisor only)

        res.redirect('passcode');
    } else if (decision === 'account') {
        // TODO: get account list (supervisor only)

        // TODO: implement account management
        res.redirect('portal');
    } else {
        // TODO: get current user info
        var data = {"name": 'user'};

        res.render('portal', {title: 'Welcome ' + 'user', data: data});
    }
});

router.get('/passcode', function (req, res, next) {
    var hasPermission = true;
    var decision = req.query.action;

    if (isLogin === false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (hasPermission === false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You do not have permission to view this page.'
        });
    } else if (decision === 'generate') {
        var code = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 30);
        generatedPasscodes.push({'code': code, 'valid': 'valid'});
        if (!conn || !conn._socket.readable) {
            conn = db.getConnection(db.client, db.settings);
            db.connectDB(conn);
        }
        var valid=1;
        const sql="insert into passcode(passcode,valid) value(?,?)";
        const changeValidSQL= "update passcode set valid = 0 where valid =1";
        conn.query(changeValidSQL,function (err, result) {
            conn.query(sql,[code,valid], function (err,result) {
                console.log("passcode store successfully");
            });
        })
        var data = {'passcode': code, 'generatedPasscodes': generatedPasscodes};
        res.render('passcode', { title: 'Passcode' , data: data });
    } else if (decision === 'home') {
        res.redirect('portal');
    } else {
        const getPasscodeSQL = 'select passcode from passcode where valid = 1';
        conn.query(getPasscodeSQL,function (err, result) {
            if(result.length!==1){
                console.log("get passcode err!");
            }
            generatedPasscodes = result[0]['passcode'];
            data = {'passcode': 'passcode placeholder...', 'generatedPasscodes': generatedPasscodes};
            res.render('passcode', { title: 'Passcode' , data: data });
        })
    }
});

/* GET review page */
router.get('/review', function (req, res, next) {
    var decision = req.query.action;

    if (isLogin === false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision === 'home') {
        res.redirect('portal');
    } else {
        if (!conn || !conn._socket.readable) {
            conn = db.getConnection(db.client, db.settings);
            db.connectDB(conn);
        }
        const previousDecisionsSQL="select decisionId, decisionTime, userName, agentName " +
            "from decision, user, Agent where decision.userId = user.userId &&" +
            " decision.agentId = Agent.agentId";
        conn.query(previousDecisionsSQL,function (err, result) {
            if(result.length!==0){
                var previousDecisions = [];
                for(var index in result){
                    if(index>pageLimit){
                        break;
                    }
                    previousDecisions.push({
                        'id': result[index]['decisionId'],
                        'date': result[index]['decisionTime'].toLocaleDateString(),
                        'twitter': result[index]['userName'],
                        'agent': result[index]['agentName']
                    })
                }
                res.render('review', {title: 'Review Previous Decision', 'previousDecisions': previousDecisions});
            }else{
                console.log("review error: result length is 0");
            }
        });
    }
});

/* GET detail page */
router.get('/detail', function (req, res, next) {
    var decision = req.query.action;
    var id = req.query.id;

    if (isLogin === false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision === 'review' && typeof(id) !== 'undefined') {
        var decisionData = {};
        const getDecisionSQL='select fullName, userName, agentName, value ' +
            'from decision, user, Agent where decision.decisionId = ? && decision.userId = user.userId &&' +
            'decision.agentId = Agent.agentId';
        conn.query(getDecisionSQL, [id], function (err, result) {
            if(err){
                console.log(err);
            }
            if(result===undefined || result.length!==1){
                console.log("get decision detail err!");
            }
            res.render('detail', {title: 'Decision Detail', data: decisionData});
        });
    } else if (decision === 'increase' && typeof(id) !== 'undefined') {
        const increseRetentionSQL='update decision set expireTime = ? where decisionId = ?';
        const getRetentionSQL='select expireTime from decision where decisionId = ?';
        conn.query(getRetentionSQL,[id],function (err, result) {
            if(result.length!==1){
                console.log("get retention time err!");
            }
            var expireTime = result[0]['expireTime'];
            var increasedTime = new Date();
            increasedTime.setDate(expireTime.getDate()+defaultIncresePeriod);
            conn.query(increseRetentionSQL, [increasedTime, id], function (err, result) {
                console.log("increase retention success!");
            });
        });
    } else if (decision === 'changeDecision' && typeof(id) !== 'undefined') {
        const changeOriDecision='update decision set valid = 0 where decisionId = ? && valid = 1';
        const getDecision='select * from decision where decisionId = ? && valid = 1';
        const addNewDecision="insert into decision(userId,agentId,value,decisionTime,expireTime) values(?,?,?,?,?)";
        const addLog='';
        conn.query(changeOriDecision,[id],function (err, result) {
            if(result.length!==1){
                console.log("change decision result:" + result);
            }
        });
        conn.query(getDecision, [id], function (err, result) {
            if(result.length!==1){
                console.log("get more than 1 decision result:" + result);
            }
            conn.query(addNewDecision,[
                result[0]['userId'],
                result[0]['agentId'],
                result[0]['value'],
                result[0]['decisionTime'],
                result[0]['expireTime'],
            ],function (err, result)
            {
            })
        });
    } else {
        res.redirect('review');
    }
});

/* GET submit page. */
router.get('/submit', function(req, res, next) {

    var decision = req.query.action;
    var account = req.query.twitter;

    if (isLogin === false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision === 'submit') {
        if (!conn || !conn._socket.readable) {
            conn = db.getConnection(db.client, db.settings);
            db.connectDB(conn);
        }
        console.log("account is:",account);
        var sql = "select userId from user where userName = '" + account + "'";
        conn.query(sql,function (err, result) {
            if (result.length === 1) {
                for (var index in result) {
                    GLUserId = result[index].userId;
                    console.log("userId:", GLUserId);
                    res.redirect('report?action=submit&twitter=' + account);
                }
            } else {
                console.log("cannot find users!");
                res.render('submit', { title: 'Please re-submit Twitter Account' });
            }
        });
    } else if (decision === 'home') {
        res.redirect('portal');
    } else {
        res.render('submit', { title: 'Submit Twitter Handle'});
    }
});

/* GET report page. */
router.get('/report', function(req, res, next) {

    var decision = req.query.action;
    var account = req.query.twitter;

    if (isLogin === false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision === 'submit' && typeof(account) !== 'undefined') {

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
    } else if (decision === 'no' && typeof(account) !== 'undefined') {
        res.redirect('anonymized?action=audit&twitter=' + account);
    } else if (decision === 'yes' && typeof(account) !== 'undefined') {
        res.redirect('decision?action=submit&twitter=' + account);
    } else if (decision === 'home') {
        res.redirect('portal');
    } else {
        res.redirect('submit');
    }
});

/* GET anonymized page. */
router.get('/anonymized', function(req, res, next) {

    var decision = req.query.action;
    var account = req.query.twitter;


    var validAccount = true;
    var userId = GLUserId;
    if (isLogin === false) {
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
    } else if (decision === 'audit' && typeof(account) !== 'undefined') {
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
                if(index>pageLimit){
                    break;
                }
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
            res.render('anonymized', { title: 'Anonymized Twitter Data', data: data, account: account });
        });
    } else if (decision === 'no' && typeof(account) !== 'undefined') {
        var passcode = req.query.passcode;
        res.redirect('original?action=audit&passcode=' + passcode + '&twitter=' + account);
    } else if (decision === 'yes' && typeof(account) !== 'undefined') {
        res.redirect('decision?action=submit&twitter=' + account);
    } else if (decision === 'home') {
        res.redirect('portal');
    } else {
        res.redirect('submit');
    }
});

/* GET original page. */
router.get('/original', function(req, res, next) {

    var decision = req.query.action;
    var account = req.query.twitter;

    var passcode = req.query.passcode;
    var validPasscode = true;
    var userId = GLUserId;

    if (!conn || !conn._socket.readable) {
        conn = db.getConnection(db.client, db.settings);
        db.connectDB(conn);
    }

    if (isLogin === false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    }

    const passCodeSQL="select * from passcode where passcode = ? && valid = 1";
    conn.query(passCodeSQL,[passcode],function (err,result) {
        if (result.length !== 1) {
            validPasscode=false;
            if (!validPasscode) {
                res.render('error', {
                    title: 'Incorrect Passcode',
                    message: 'Incorrect Passcode Entry ',
                    info: 'The passcode entered is not valid.'
                });
            }
            if (decision === 'audit' && typeof(account) !== 'undefined') {
                var dataSQL= "select tweets.tweetText, tweets.postTime, flags2tweets.indices, " +
                    "flags2tweets.degree, flag.flagContext " +
                    "from tweets left join flags2tweets on (tweets.tweetId = flags2tweets.tweetId) " +
                    "left join flag on (flags2tweets.flagId = flag.flagId) " +
                    "where userId = ?;";
                conn.query(dataSQL, [userId],function(err, result) {
                    var data=[];
                    for(var index in result){
                        if(index>pageLimit){
                            break;
                        }
                        var degreeType;
                        var comment;
                        if(result[index].degree !== null){
                            switch(result[index].degree) {
                                case 1: degreeType = 'danger';comment='(flagged)';break;
                                case 2: degreeType = 'warning';comment='(uncertain)';break;
                            }
                            var content=dealWithContent(result[index].tweetText,
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
                                content: [{type:"text",content:result[index].tweetText}]
                            });
                        }
                    }
                    res.render('original', { title: 'Original Tweets', data: data, account: account });
                });
            } else if (decision === 'submit' && typeof(account) !== 'undefined') {
                res.redirect('decision?action=submit&twitter=' + account);
            } else if (decision === 'home') {
                res.redirect('portal');
            } else {
                res.redirect('submit');
            }
        }else {
            console.log("original error:"+result);
        }
    })
});

/* GET decision page. */
router.get('/decision', function(req, res, next) {

    var decision = req.query.action;
    var account = req.query.twitter;

    var userId=GLUserId;
    var agentId=GLagentID;
    var decisionTime = new Date();
    var expireTime = new Date();
    expireTime.setDate(expireTime.getDate()+defaultExpiringPeriod);
    var sql="insert into decision(userId,agentId,value,decisionTime,expireTime) values(?,?,?,?,?)";

    if (isLogin === false) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You must be logged in to perform this action.'
        });
    } else if (decision === 'submit' && typeof(account) !== 'undefined') {
        data = [];
        res.render('decision', { title: 'Make a Decision', account: account });
    } else if (decision === 'yes' && typeof(account) !== 'undefined') {
        if (!conn || !conn._socket.readable) {
            conn = db.getConnection(db.client, db.settings);
            db.connectDB(conn);
        }
        var pass = 1;
        conn.query(sql,[userId,agentId,pass,decisionTime,expireTime],function (err,result) {
            if(err){
                console.log(err);
            }
            console.log("decision pass:"+result);
        })
        res.render('error', {
            title: 'Decision Confirmation',
            message: 'Passenger ' + account + " Pass the Audit",
            info: 'You have determined that the traveler’s Twitter ' +
            'Account raises no concerns regarding this traveler’s entry ' +
            'into the United States.'
        });
    } else if (decision === 'no' && typeof(account) !== 'undefined') {
        if (!conn || !conn._socket.readable) {
            conn = db.getConnection(db.client, db.settings);
            db.connectDB(conn);
        }
        var denied=0;
        conn.query(sql,[userId,agentId,denied,decisionTime,expireTime],function (err,result) {
            if(err){
                console.log(err);
            }
            console.log("decision denied:"+result);
        })
        res.render('error', {
            title: 'Decision Confirmation',
            message: 'Passenger ' + account + " Fail the Audit",
            info: 'You have determined that the traveler’s Twitter ' +
            'Account raises concerns regarding this traveler’s ' +
            'entry into the United States.'
        });
    } else if (decision === 'home') {
        res.redirect('portal');
    } else {
        res.redirect('submit');
    }
});

module.exports = router;
