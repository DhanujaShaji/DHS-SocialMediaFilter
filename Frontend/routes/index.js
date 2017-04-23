const express = require('express');
const router = express.Router();
const db = require('../db.js');
const request = require('request');
const bcrypt = require('bcrypt');
const schedule = require('node-schedule');
var conn = null;
var SuperAgentLevel = 3;
const defaultExpiringPeriod=15;
const defaultIncresePeriod=30;
const pageLimit=8;

const saltRounds = 10;
const myPlaintextPassword = 'test';

schedule.scheduleJob('0 * * * * *', function(){
    console.log('The answer to life, the universe, and everything!');
});

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

function storeHashPassword(name,pass) {
    var storePassword='update Agent set password = ? where account =?';
    bcrypt.hash(pass, saltRounds, function(err, hash) {
        conn.query(storePassword,[hash,name],function (err, res) {
            if(!err){
                return true;
            }else {
                return false;
            }
        });
    });
}

function authenticate(name, pass, fn) {
    if (!module.parent) {
        console.log('authenticating %s:%s', name, pass);
    }
    if (!conn || !conn._socket.readable) {
        conn = db.getConnection(db.client, db.settings);
        db.connectDB(conn);
    }

    var retrievePassword='select agentId,agentName,level,password from Agent where account=?';
    conn.query(retrievePassword,[name],function (err, res) {
        if(!err){
            var hashedPassword=res[0]['password'];
            var agent = res[0]['agentName'];
            var agentId = res[0]['agentId'];
            var agentLevel = res[0]['level'];
            //console.log("password:"+hashedPassword);
            bcrypt.compare(myPlaintextPassword, hashedPassword, function(err, res) {
                if(res===true){
                    //console.log("hash true");
                    return fn(agent,agentId,agentLevel);
                }else {
                    //console.log("hash false");
                    return fn(null);
                }
            });
        }
    });

    /*var authenticateSQL="select agentId,agentName,level from Agent where account = ? && password = ?";
    conn.query(authenticateSQL,[name,pass],function (err,res) {
        if(res!==undefined&&res.length===1){
            var agent = res[0]['agentName'];
            var agentId = res[0]['agentId'];
            var agentLevel = res[0]['level'];
            return fn(agent,agentId,agentLevel);
        } else {
            return fn(null);
        }
    });*/
}

function checkSignIn(req,res,next){
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

function connectToDB(req,res,next) {
    if (!conn || !conn._socket.readable) {
        conn = db.getConnection(db.client, db.settings);
        db.connectDB(conn);
    }
    next();
}

/* GET default page. */
router.get('/', checkSignIn, function(req, res, next) {
    res.redirect('portal');
});

/* GET login page. */
router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Login Agent Account'});
});

router.get('/logout', function(req, res){
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function(){
        res.redirect('/login');
    });
});

/* POST login page. */
router.post('/login', function (req, res, next) {
    var decision = req.body.action;
    if (decision === 'login') {
        var agentName = req.body.username;
        var psd = req.body.psd;

        authenticate(agentName, psd, function(agent,agentId,level){
            if (agent) {
                // Regenerate session when signing in
                // to prevent fixation
                req.session.regenerate(function(){
                    // Store the user's primary key
                    // in the session store to be retrieved,
                    // or in this case the entire user object
                    req.session.user = agent;
                    req.session.agentId = agentId;
                    req.session.level = level;
                    res.redirect('portal');
                });
            } else {
                res.render('error', {
                    title: 'Incorrect Username/Password',
                    message: 'Incorrect username/password combination',
                    info: 'The credentials you entered are invalid. If you forgot ' +
                    'your password, please click “Forgot Password” to reset it.'
                });
            }
        });
    } else if (decision === 'forgetPassword') {
        // TODO: forget password
    } else {
        res.redirect('login');
    }
});

/* GET portal page*/
router.get('/portal',checkSignIn, function (req, res, next) {
    var decision = req.query.action;
    if (decision === "audit") {
        res.redirect('submit');
    } else if (decision === "review") {
        res.redirect('review');
    } else if (decision === 'passcode') {

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

router.get('/passcode', checkSignIn, connectToDB, function (req, res, next) {
    var hasPermission = true;
    var decision = req.query.action;
    var agentLevel = req.session.level;
    var generatedPasscodes = [];

    if (agentLevel !== SuperAgentLevel) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You do not have permission to view this page.'
        });
    }

    if (decision === 'generate') {
        var code = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 30);

        generatedPasscodes.push({'code': code, 'valid': 'valid'});
        var valid=1;
        const sql='insert into passcode(passcode,valid) value(?,?)';
        const changeValidSQL= 'update passcode set valid = 0 where valid =1';

        conn.query(changeValidSQL,function (err, result) {
            console.log("change passcode successfully!");
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
            console.log("retrieved passcode:"+result[0]['passcode']);
            generatedPasscodes.push({'code': result[0]['passcode'], 'valid': 'valid'});
            data = {'passcode': 'passcode placeholder...', 'generatedPasscodes': generatedPasscodes};
            res.render('passcode', { title: 'Passcode' , data: data });
        })
    }
});

/* GET review page */
router.get('/review', checkSignIn, connectToDB, function (req, res, next) {
    var decision = req.query.action;

    if (decision === 'home') {
        res.redirect('portal');
    } else {
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
router.get('/detail', checkSignIn, connectToDB, function (req, res, next) {
    var decision = req.query.action;
    var id = req.query.id;

    if (decision === 'review' && typeof(id) !== 'undefined') {
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
            var newDecision = result[0]['value'];
            var decisionTime = new Date();
            var expireTime = new Date();
            expireTime.setDate(expireTime.getDate()+defaultExpiringPeriod);
            conn.query(addNewDecision,[result[0]['userId'], result[0]['agentId'], newDecision, decisionTime, expireTime,],
                function (err, result)
            {

            })
        });
    } else {
        res.redirect('review');
    }
});

/* GET submit page. */
router.get('/submit', checkSignIn, connectToDB, function(req, res, next) {

    var decision = req.query.action;
    var account = req.query.twitter;
    if (decision === 'submit') {
        console.log("account is:",account);
        var sql = "select userId from user where userName = '" + account + "'";
        conn.query(sql,function (err, result) {
            if (result.length === 1) {
                for (var index in result) {
                    req.session.userId = result[index].userId;
                    console.log("userId:", result[index].userId);
                    res.redirect('report?action=submit&twitter=' + account);
                }
            } else {
                console.log("cannot find users!");
                res.render('error', {
                    title: 'User not exist',
                    message: 'We cannot find the user you want to look ',
                    info: 'Please check the user name and re-submit again'
                });
            }
        });
    } else if (decision === 'home') {
        res.redirect('portal');
    } else {
        res.render('submit', { title: 'Submit Twitter Handle'});
    }
});

/* GET report page. */
router.get('/report', checkSignIn, function(req, res, next) {

    var decision = req.query.action;
    var account = req.query.twitter;

    if (decision === 'submit' && typeof(account) !== 'undefined') {
        const options = {
            method: 'get',
            uri:'',
            json:true,
            qs:{
                account:account
            },
            timeout:5*1000
        }
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var statics = JSON.parse(body);
                console.log("statics"+statics);
            }
        });
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
router.get('/anonymized', checkSignIn, connectToDB, function(req, res, next) {

    var decision = req.query.action;
    var account = req.query.twitter;

    var validAccount = true;
    var userId = req.session.userId;

    if (!validAccount) {
        res.render('error', {
            title: 'Twitter handle not found',
            message: 'Twitter handle not found',
            info: 'The Twitter handle entered could not be found. Please verify ' +
            'the spelling or search for the account on the Twitter website using ' +
            'either name or email of the registered account before proceeding.'
        });
    } else if (decision === 'audit' && typeof(userId) !== 'undefined') {

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
router.get('/original', checkSignIn, connectToDB, function(req, res, next) {

    var decision = req.query.action;
    var account = req.query.twitter;
    var passcode = req.query.passcode;
    var userId = req.session.userId;

    if(userId === undefined){
        res.redirect('submit');
    }

    const passCodeSQL="select * from passcode where passcode = ? && valid = 1";
    conn.query(passCodeSQL,[passcode],function (err,result) {
        console.log("original result length:"+result.length);
        if (result!==undefined&&result.length === 1) {
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
            res.render('error', {
                title: 'Incorrect Passcode',
                message: 'Incorrect Passcode Entry ',
                info: 'The passcode entered is not valid.'
            });
        }
    })
});

/* GET decision page. */
router.get('/decision', checkSignIn, connectToDB, function(req, res, next) {

    var decision = req.query.action;
    var account = req.query.twitter;

    var userId=req.session.userId;
    if(userId === undefined){
        res.redirect('submit');
    }
    var agentId=req.session.agentId;
    if(userId === undefined){
        res.redirect('login');
    }
    var decisionTime = new Date();
    var expireTime = new Date();
    expireTime.setDate(expireTime.getDate()+defaultExpiringPeriod);

    var sql="insert into decision(userId,agentId,value,decisionTime,expireTime) values(?,?,?,?,?)";
    if (decision === 'submit' && typeof(account) !== 'undefined') {
        data = [];
        res.render('decision', { title: 'Make a Decision', account: account });
    } else if (decision === 'yes' && typeof(account) !== 'undefined') {
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
