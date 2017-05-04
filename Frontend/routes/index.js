const express = require('express');
const router = express.Router();
const db = require('../db.js');
const request = require('request');
const bcrypt = require('bcrypt');
const schedule = require('node-schedule');
var async = require("async");
var conn = null;
var SupervisorLevel = 3; //Supervisor level
const defaultExpiringPeriod = 15; //15 days, expireation time for a decision.
const defaultIncresePeriod = 1; //1 Month, increase time for a decision when choose to increase the expire time.
const pageLimit = 15; //limitation for number of tweets to be displayed on each page.
const saltRounds = 10; // the number of rounds to be hashed.
const timeSetting = '0 0 5 * * *' //5:00 AM of each day.
const testTimeSetting = '0 * * * * *'; //0s of each miniue.
const deletePasscodeTimeSetting = '0 * * * * *'
const debug = false;
const defaultMaxiumTweetsCount = 20;


/**
 * sheduled job for delete data which exceeds the expiretime in database.
 * timeSetting indicates when to execute those commands;
 */
schedule.scheduleJob(testTimeSetting, function () {
    if (debug) {
        if (!conn || !conn._socket.readable) {
            conn = db.getConnection(db.client, db.settings);
            db.connectDB(conn);
        }
        const deleteTweetsSQL = 'delete from tweets';
        const deleteUserSQL = 'delete from user where userId = ?';
        const getExpireDicisionSQL = 'select decisionId,userId from decision where expireTime >= ?'
        const deleteDecisionSQL = 'delete from decision where decisionId = ?';
        conn.query(deleteTweetsSQL, function (err, result) {
        });
        conn.query(getExpireDicisionSQL, [], function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            for (var index in result) {
                var decisionId = result[index]['decisionId'];
                var userId = result[index]['userId'];
                conn.query(deleteDecisionSQL, [decisionId], function (err, result) {
                });
                conn.query(deleteUserSQL, [userId], function (err, result) {
                });
            }
        })
    }
    console.log('The answer to life, the universe, and everything!');
});

schedule.scheduleJob(deletePasscodeTimeSetting, function () {
    if (!conn || !conn._socket.readable) {
        conn = db.getConnection(db.client, db.settings);
        db.connectDB(conn);
    }
    const deletePasscodeSQL = 'delete from passcode where createTime < now() - INTERVAL 2 minute;'
    conn.query(deletePasscodeSQL, function (err, result) {
    })
});
/**
 *
 * @param value
 * @param indice
 * @param context
 * @param level
 * @returns {Array}
 *
 * construct the data structure needed by frontend. The data structure here is the one page
 * of tweets;
 */
function dealWithContent(value, indice, context, level) {
    var res = [];
    if (typeof (value) === 'string') {
        var str1 = value.slice(0, indice);
    }
    res.push({type: "text", content: str1});
    res.push({
        type: "keyword",
        content: context,
        level: level,
        reasonTitle: "Sensitive Type",
        reasonContent: "Dangerous Keyword"
    });
    var length = context.length;
    if (typeof (value) === 'string') {
        var str2 = value.slice(indice + length);
    }
    res.push({type: "text", content: str2});
    return res;
}

/**
 *
 * @param name //username
 * @param pass //password
 * @param fn //function object
 *
 * authenticate the user
 */
function authenticate(name, pass, fn) {
    if (!module.parent) {
        console.log('authenticating %s:%s', name, pass);
    }
    if (!conn || !conn._socket.readable) {
        conn = db.getConnection(db.client, db.settings);
        db.connectDB(conn);
    }

    var retrievePassword = 'select agentId,agentName,level,password from Agent where account=?';
    conn.query(retrievePassword, [name], function (err, res) {
        if (!err) {
            if (res.length === 0) {
                return fn(null);
            }
            var hashedPassword = res[0]['password'];
            var agent = res[0]['agentName'];
            var agentId = res[0]['agentId'];
            var agentLevel = res[0]['level'];
            //console.log("password:"+hashedPassword);
            bcrypt.compare(pass, hashedPassword, function (err, res) {
                if (res === true) {
                    //console.log("hash true");
                    return fn(agent, agentId, agentLevel);
                } else {
                    //console.log("hash false");
                    return fn(null);
                }
            });
        }
    });
}

/**
 *
 * @param req
 * @param res
 * @param next
 *
 * check whether a user has sign in or not
 */
function checkSignIn(req, res, next) {
    if (req.session.agentName) {
        next();
    } else {
        res.redirect('/login');
    }
}

/**
 *
 * @param req
 * @param res
 * @param next
 *
 * connect to database if not.
 */
function connectToDB(req, res, next) {
    if (!conn || !conn._socket.readable) {
        conn = db.getConnection(db.client, db.settings);
        db.connectDB(conn);
    }
    next();
}

/**
 *
 * @param res
 * @param err
 *
 * if there is an error, return error page.
 */
function dealwithInternalError(res, err) {
    if (err) {
        res.render('error', {
            title: 'Internal error',
            message: 'Internal error',
            info: 'An internal error happend! Sorry for this.'
        });
        console.log(err);
    }
}

/**
 * sort according to a property name of a object.
 * @param property
 * @returns {Function}
 */
function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

/**
 * sort according to multiple properties of a object.
 * @returns {Function}
 */
function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while (result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}

function toPercentage(number) {
    return ( number * 100).toFixed(2) + '%';
}

/**
 * GET default page.
 */
router.get('/', checkSignIn, function (req, res, next) {
    res.render('login', {title: 'Login Agent Account'});
});

/**
 *  GET login page.
 */
router.get('/login', function (req, res, next) {
    if (req.session.agentName) {
        res.redirect('portal');
    } else {
        res.render('login', {title: 'Login Agent Account'});
    }
});

/**
 * Get logout out page
 * the session used to identify the user will be destroyed here.
 */
router.get('/logout', function (req, res) {
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function () {
        res.redirect('/login');
    });
});

/**
 * POST login page.
 * this router is used for login process.
 */
router.post('/login', function (req, res, next) {
    var action = req.body.action;
    if (action === 'login') {
        var agentName = req.body.username;
        var psd = req.body.psd;

        authenticate(agentName, psd, function (agentName, agentId, level) {
            if (agentName) {
                // Regenerate session when signing in
                // to prevent fixation
                req.session.regenerate(function () {
                    // Store the user's info
                    // in the session store to be retrieved.
                    req.session.agentName = agentName;
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
    } else if (action === 'forgetPassword') {
        res.render(error, {
            title: 'Unimplemented function',
            message: 'This function hasn\'t been implemented',
            info: 'This function hasn\'t been implemented'
        })
    } else {
        res.redirect('login');
    }
});

/**
 * GET portal page, where you choose which function you want to do, reveiew past decision, genetate new passcode,
 * manage accounts etc.
 */
router.get('/portal', checkSignIn, function (req, res, next) {
    var action = req.query.action;
    if (action === "audit") {
        res.redirect('submit');
    } else if (action === "review") {
        res.redirect('review');
    } else if (action === 'passcode') {
        res.redirect('passcode');
    } else if (action === 'account') {
        res.redirect('addAccounts');
    } else if (action == 'logout') {
        res.redirect('logout');
    } else if (action == 'search') {
        var keyword = req.query.keyword;
        res.render('error', {
            title: 'This function hasn\'t been implemented',
            message: 'This function hasn\'t been implemented',
            info: 'Search tweets with keyword \'' + keyword + '\'.'
        });
    } else {
        var data = {"name": 'user'};
        res.render('portal', {title: 'Welcome ' + 'user', data: data});
    }
});

/**
 * get passcode page where you can generate new passcode.
 */
router.get('/passcode', checkSignIn, connectToDB, function (req, res, next) {
    var hasPermission = true;
    var action = req.query.action;
    var agentLevel = req.session.level;
    var generatedPasscodes = [];

    //only supervisor can access this page.
    if (agentLevel !== SupervisorLevel) {
        res.render('error', {
            title: 'Unauthenticated Access',
            message: 'Unauthenticated Access to page via direct URL access ',
            info: 'You do not have permission to view this page.'
        });
    }

    if (action === 'generate') {
        //generate new passcode
        var code = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);

        generatedPasscodes.push({'code': code, 'valid': 'Valid'});
        var valid = 1;
        const sql = 'insert into passcode(passcode,valid) value(?,?)';
        const changeValidSQL = 'update passcode set valid = 0 where valid =1';

        conn.query(changeValidSQL, function (err, result) {
            console.log("change passcode successfully!");
            conn.query(sql, [code, valid], function (err, result) {
                console.log("passcode store successfully");
            });
        })

        var data = {'passcode': code, 'generatedPasscodes': generatedPasscodes};
        res.render('passcode', {title: 'Passcode', data: data});

    } else if (action === 'home') {
        res.redirect('portal');
    } else {
        //get past valide passcode.
        const getPasscodeSQL = 'select passcode,valid from passcode';
        conn.query(getPasscodeSQL, function (err, result) {
            if (err) {
                dealwithInternalError(res, err);
            }
            for (var index in result) {
                //console.log("index:"+index+" valid:"+result[index]['valid']);
                if (result[index]['valid'] === 1) {
                    generatedPasscodes.push({'code': result[index]['passcode'], 'valid': 'valid'});
                } else {
                    generatedPasscodes.push({'code': result[index]['passcode'], 'valid': 'invalid'});
                }
            }
            data = {'passcode': 'passcode will appear here when generated…', 'generatedPasscodes': generatedPasscodes};
            res.render('passcode', {title: 'Passcode', data: data});
        })
    }
});

/**
 * GET review page where you review historical decision about a user.
 */
router.get('/review', checkSignIn, connectToDB, function (req, res, next) {
    var action = req.query.action;
    var agentLevel = req.session.level;
    var agentId = req.session.id;

    if (action === 'home') {
        res.redirect('portal');
    } else {
        if (agentLevel == SupervisorLevel) {
            const previousDecisionsSQL = "select decisionId, decisionTime, userName, agentName " +
                "from decision, user, Agent where decision.userId = user.userId &&" +
                " decision.agentId = Agent.agentId && decision.valid = 1";
            conn.query(previousDecisionsSQL, function (err, result) {
                if (result.length !== 0) {
                    var previousDecisions = [];
                    for (var index in result) {
                        if (index > pageLimit) {
                            break;
                        }
                        previousDecisions.push({
                            'id': result[index]['decisionId'],
                            'date': result[index]['decisionTime'].toLocaleDateString(),
                            'twitter': result[index]['userName'],
                            'agent': result[index]['agentName'],
                        })
                    }
                    previousDecisions.sort(dynamicSort('tweetDate'));
                    res.render('review', {title: 'Review Previous Decision', 'previousDecisions': previousDecisions});
                } else {
                    console.log("review error: result length is 0");
                }
            });
        } else {
            const previousDecisionsSQL2 = "select decisionId, decisionTime, userName, agentName " +
                "from decision, user, Agent where decision.userId = user.userId &&" +
                " decision.agentId = Agent.agentId && Agent.agentId = ? && decision.valid = 1";
            conn.query(previousDecisionsSQL2, [agentId], function (err, result) {
                var previousDecisions = [];
                for (var index in result) {
                    if (index > pageLimit) {
                        break;
                    }
                    previousDecisions.push({
                        'id': result[index]['decisionId'],
                        'date': result[index]['decisionTime'].toLocaleDateString(),
                        'twitter': result[index]['userName'],
                        'agent': result[index]['agentName']
                    })
                }
                previousDecisions.sort(dynamicSort('tweetDate'));
                res.render('review', {title: 'Review Previous Decision', 'previousDecisions': previousDecisions});
            });
        }
    }
});

/**
 * GET detail decision page where you can get detail information of a typical decision and make your new decision.
 */
router.get('/detail', checkSignIn, connectToDB, function (req, res, next) {
    var action = req.query.action;
    var decisionId = req.query.id;
    // You can get decision id
    console.log("decisionId:" + decisionId);
    console.log("action:" + action);

    if (action === 'review' && typeof(decisionId) !== 'undefined') {
        var decisionData = {};
        const getDecisionSQL = 'select decision.userId, decision.decisionId, userName, agentName, value, expireTime ' +
            'from decision inner join user on(decision.userId = user.userId) ' +
            'inner join Agent on(decision.agentId = Agent.agentId) ' +
            'where decision.decisionId = ?';
        const dataSQL = "select tweets.tweetText, tweets.anonymizedText, tweets.postTime, flags2tweets.indices, " +
            "flags2tweets.degree, flag.flagContext " +
            "from tweets left join flags2tweets on (tweets.tweetId = flags2tweets.tweetId) " +
            "left join flag on (flags2tweets.flagId = flag.flagId) " +
            "where userId = ? && tweets.flagsCount != 0;";
        const getOtherDecisionSQL = 'select decisionId, agentName, decisionTime, valid, value ' +
            'from decision inner join user on(decision.userId = user.userId) ' +
            'inner join Agent on(decision.agentId = Agent.agentId) ' +
            'where user.userName = ? && decision.decisionId != ? && decision.valid = 0';
        conn.query(getDecisionSQL, [decisionId], function (err, result) {
            if(err){
                console.log(err);
            }
            var decision = 'denied';
            var userName = result[0].userName;
            var userId = result[0]['userId'];
            if (result[0].value === 1) {
                decision = 'Passed';
            }
            decisionData = {
                'twitter': userName,
                'decision': decision,
                'agent': result[0].agentName,
                'expiration': result[0].expireTime.toLocaleDateString(),
                'tweets': [],
                'history': []
            };
            conn.query(dataSQL,[userId],function (err, dataResult) {
                for (var index in dataResult) {
                    if (index > pageLimit) {
                        break;
                    }
                    var degreeType;
                    var comment;
                    //fixed null value for tweetDate
                    var tweetDate = null;
                    if (dataResult[index]['postTime'] !== null) {
                        tweetDate = dataResult[index]['postTime'].toLocaleDateString();
                    } else {
                        tweetDate = "null";
                    }
                    if (dataResult[index].degree !== null) {
                        switch (dataResult[index].degree) {
                            case 1:
                                degreeType = 'danger';
                                comment = '(flagged)';
                                break;
                            case 2:
                                degreeType = 'warning';
                                comment = '(uncertain)';
                                break;
                        }
                        var content = dealWithContent(dataResult[index].tweetText,
                            dataResult[index].indices,
                            dataResult[index].flagContext,
                            degreeType
                        );
                        decisionData.tweets.push({
                            type: degreeType,
                            date: tweetDate,
                            comment: comment,
                            content: content
                        });
                    } else {
                        decisionData.tweets.push({
                            type: 'success',
                            date: tweetDate,
                            comment: '(not flagged)',
                            content: [{type: "text", content: dataResult[index].anonymizedText}]
                        });
                    }
                }
                decisionData.tweets.sort(dynamicSortMultiple("type", 'tweetDate'));
                conn.query(getOtherDecisionSQL, [userName, decisionId], function (err, otherResult) {
                    for (var index in otherResult) {
                        var decision = 'Passed';
                        if(otherResult[index]['value']!=1){
                            decision = 'Failed';
                        }
                        decisionData.history.push({
                            'date': otherResult[index].decisionTime.toLocaleDateString(),
                            'agent': otherResult[index].agentName,
                            'action': 'Change decision to ' + decision
                        })
                    }
                    res.render('detail', {title: 'Decision Detail', data: decisionData, 'decisionId': decisionId});
                });
            });
        });
    } else if (action === 'increase' && typeof(decisionId) !== 'undefined') {
        console.log("detail action increase:" + decisionId);
        const increseRetentionSQL = 'update decision set expireTime = ? where decisionId = ?';
        const getRetentionSQL = 'select expireTime from decision where decisionId = ?';
        conn.query(getRetentionSQL, [decisionId], function (err, result) {
            if (result.length !== 1) {
                console.log("get retention time err!");
            }
            var expireTime = result[0]['expireTime'];
            var increasedTime = new Date();
            increasedTime.setDate(expireTime.getDate());
            increasedTime.setMonth(expireTime.getMonth() + defaultIncresePeriod);
            conn.query(increseRetentionSQL, [increasedTime, decisionId], function (err, result) {
                console.log("increase retention success!");
                res.redirect('detail?action=review&id='+decisionId);
            });
        });
    } else if (action === 'changeDecision' && typeof(decisionId) !== 'undefined') {
        const changeOriDecision = 'update decision set value = ? where decisionId = ? && valid = 1';
        const getDecision = 'select * from decision where decisionId = ?';
        const addNewDecision = "insert into decision(userId, agentId, value, " +
            "decisionTime, expireTime, valid) values(?,?,?,?,?,?)";
        const addLog = 'insert into decisionChangeLog(oriDecisionId, newDecisionId) values(?,LAST_INSERT_ID())';
        var tasks = [
            getTask = function (callback) {
                conn.query(getDecision, [decisionId], function (err, result) {
                    if (result.length !== 1) {
                        console.log("get more than 1 decision result length:" + result.length);
                        dealwithInternalError(res, true);
                    }
                    var userId = result[0]['userId'];
                    var agentId = result[0]['agentId'];
                    var newDecision = !result[0]['value'];
                    callback(null,userId,agentId,newDecision);
                });
            },
            addNewTask = function (userId,agentId,newDecision,callback) {
                var decisionTime = new Date();
                var expireTime = new Date();
                expireTime.setDate(expireTime.getDate() + defaultExpiringPeriod);
                console.log("newDecision "+newDecision);
                conn.query(addNewDecision, [userId, agentId, newDecision, decisionTime, expireTime, 0], function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    callback(null,newDecision);
                });
            },
            addLogTask = function (newDecision,callback) {
                conn.query(addLog, [decisionId], function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    callback(null,newDecision);
                });
            },
            changeOriTask = function (newDecision,callback) {
                conn.query(changeOriDecision, [newDecision, decisionId], function (err, result2) {
                    if (result2.length !== 1) {
                        console.log("change decision result:" + result2);
                    }
                    if (err) {
                        console.log(err);
                    }
                    callback(null);
                });
            }
        ];
        async.waterfall(tasks, function (err, finalResults) {
            if(err){
                console.log(err);
            }
            res.redirect('detail?action=review&id='+decisionId);
        });

        /* conn.query(getDecision, [decisionId], function (err, result) {
         if (result.length !== 1) {
         console.log("get more than 1 decision result length:" + result.length);
         dealwithInternalError(res, true);
         }
         var newDecisionId = ++decisionId;
         var newDecision = !result[0]['value'];
         var decisionTime = new Date();
         var expireTime = new Date();
         expireTime.setDate(expireTime.getDate() + defaultExpiringPeriod);

         conn.query(addNewDecision, [newDecisionId, result[0]['userId'], result[0]['agentId'],
         newDecision, decisionTime, expireTime, 0], function (err, result3) {
         dealwithInternalError(res, err);
         conn.query(addLog, [decisionId, newDecisionId], function (err, result4) {
         dealwithInternalError(res, err);
         res.redirect('portal');
         })
         });
         });*/
    } else {
        res.redirect('review');
    }
});

/**
 * GET submit page. submit userId(twitter) you want to search.
 */
router.get('/submit', checkSignIn, connectToDB, function (req, res, next) {

    var action = req.query.action;
    var account = req.query.twitter;
    if (action === 'submit') {
        account = account.replace(" ", "+");
        console.log("account is:", account);
        res.redirect('report?action=submit&twitter=' + account);
    } else if (action === 'home') {
        res.redirect('portal');
    } else {
        res.render('submit', {title: 'Submit Twitter Handle'});
    }
});


/**
 * GET report page. get stastical report about a userId(twitter)
 */
router.get('/report', checkSignIn, function (req, res, next) {
    var action = req.query.action;
    var account = req.query.twitter;

    account = account.trim();//remove leading and trailing space.

    if (action === 'submit' && typeof(account) !== 'undefined') {
        account = account.replace(" ", "+");
        const options = {
            method: 'get',
            uri: 'http://35.184.118.200:8080/analysis',
            json: true,
            qs: {
                userId: account
            },
            timeout: 10 * 1000
        }
        console.log(options.uri);

        request(options, function (error, response, body) {
            if (error || response.statusCode != 200) {
                console.log(error);
                res.render('error', {
                    title: 'User Not Found',
                    message: 'User Not Found',
                    info: 'The Twitter handle entered could not be found. Please verify the spelling or search for' +
                    ' the account on the Twitter website using either name or email of the registered account' +
                    ' before proceeding.'
                });
                return ;
            }

            const sql = 'select userId, flagTweetCount, blacklistCount from user where userName = ?';
            const averageSQL = 'select AVG(flagTweetCount) as averageCount, AVG(blacklistCount ) as averageBlack from user';
            conn.query(sql, [account], function (err, result) {
                if (err || result == undefined || result === null || result.length !== 1) {
                    console.log("cannot find users!");
                    res.render('error', {
                        title: 'User Not Found',
                        message: 'User Not Found',
                        info: 'The Twitter handle entered could not be found. Please verify the spelling or search for' +
                        ' the account on the Twitter website using either name or email of the registered account' +
                        ' before proceeding.'
                    });
                    return ;
                }
                req.session.userId = result[0].userId;
                console.log("userId:", result[0].userId);
                var flagTweetCount = result[0]['flagTweetCount'];
                var blacklistCount = result[0]['blacklistCount'];
                conn.query(averageSQL, function (err, result2) {
                    var averageCount = result2[0]['averageCount'];
                    var averageBlacklist = result2[0]['averageBlack'];
                    var reportString1 = 'Number of flagged tweets: ' + flagTweetCount;
                    var reportString2 = 'Percentage of flagged tweets among all tweets: '
                        + toPercentage(flagTweetCount / defaultMaxiumTweetsCount);
                    var reportString3 = 'Average number of flagged tweets among all traveler: ' + averageCount;
                    var reportString4 = 'Average percentage of flagged tweets among all traveler: '
                        + toPercentage(averageCount / defaultMaxiumTweetsCount);
                    var reportString5 = 'Number of blacklisted entities followed: ' + blacklistCount;
                    var reportString6 = 'Average Number of blacklisted entities followed among all traveler: ' + averageBlacklist;
                    data = [
                        {
                            'title': 'Flagged Tweets:', 'content': [
                            {'type': 'paragraph', 'content': reportString1},
                            {'type': 'paragraph', 'content': reportString2},
                            {'type': 'paragraph', 'content': reportString3},
                            {'type': 'paragraph', 'content': reportString4},
                        ]
                        },
                        {
                            'title': 'Blacklisted Entities Following:', 'content': [
                            {'type': 'paragraph', 'content': reportString5},
                            {'type': 'paragraph', 'content': reportString6}
                        ]
                        }];
                    res.render('report', {title: 'Statistic Report', data: data, account: account});
                })
                /*data = [
                 {'title': 'Flagged Tweets:', 'content': [
                 {'type': 'paragraph', 'content': 'num of flagged tweets] ([percentage]). || Average per traveler: [average number of flagged tweets]'},
                 {'type': 'paragraph', 'content': 'Ex). 120 (49%). || Average per traveler: 19'}
                 ]},
                 {'title': 'Blacklisted Entities Following:', 'content': [
                 {'type': 'paragraph', 'content': '[num of blacklisted entities following] ([percentage])'},
                 {'type': 'paragraph', 'content': 'Ex). 30 (12%)'}
                 ]},
                 {'title': 'Other Statistic Report:', 'content': [
                 {'type': 'paragraph', 'content': '......'}
                 ]}];*/
            });
        });
    } else if (action === 'no' && typeof(account) !== 'undefined') {
        res.redirect('anonymized?action=audit&twitter=' + account);
    } else if (action === 'yes' && typeof(account) !== 'undefined') {
        res.redirect('decision?action=submit&twitter=' + account);
    } else if (action === 'home') {
        res.redirect('portal');
    } else {
        res.redirect('submit');
    }
});

/**
 * GET anonymized tweets page. display detail information about his/her anonymized tweets
 */
router.get('/anonymized', checkSignIn, connectToDB, function (req, res, next) {
    var action = req.query.action;
    var account = req.query.twitter;
    var userId = req.session.userId;

    if (action === 'audit' && typeof(userId) !== 'undefined') {
        var dataSQL = "select tweets.tweetText, tweets.anonymizedText, tweets.postTime, flags2tweets.indices, " +
            "flags2tweets.degree, flag.flagContext " +
            "from tweets left join flags2tweets on (tweets.tweetId = flags2tweets.tweetId) " +
            "left join flag on (flags2tweets.flagId = flag.flagId) " +
            "where userId = ?;";
        conn.query(dataSQL, [userId], function (err, result) {
            var data = [];
            for (var index in result) {
                if (index > pageLimit) {
                    break;
                }
                var degreeType;
                var comment;
                //fixed null value for tweetDate
                var tweetDate = null;
                if (result[index]['postTime'] !== null) {
                    tweetDate = result[index]['postTime'].toLocaleDateString();
                } else {
                    tweetDate = "null";
                }
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
                        date: tweetDate,
                        comment: comment,
                        content: content
                    });
                } else {
                    data.push({
                        type: 'success',
                        date: tweetDate,
                        comment: '(not flagged)',
                        content: [{type: "text", content: result[index].anonymizedText}]
                    });
                }
            }
            data.sort(dynamicSortMultiple("type", 'tweetDate'));
            res.render('anonymized', {title: 'Censored Twitter Data', data: data, account: account});
        });
    } else if (action == 'search' && typeof(account) != 'undefined') {
        var keyword = req.query.keyword;
        res.render('error', {
            title: 'This function hasn\'t been implemented',
            message: 'This function hasn\'t been implemented',
            info: 'Search tweets with keyword \'' + keyword + '\'.'
        });
    } else if (action === 'no' && typeof(account) !== 'undefined') {
        var passcode = req.query.passcode;
        res.redirect('original?action=audit&passcode=' + passcode + '&twitter=' + account);
    } else if (action === 'yes' && typeof(account) !== 'undefined') {
        res.redirect('decision?action=submit&twitter=' + account);
    } else if (action === 'home') {
        res.redirect('portal');
    } else {
        res.redirect('submit');
    }
});

/**
 * GET original tweets page. display detail information about his/her original tweets.
 * It can only be accessed by agent with right passcode.
 */
router.get('/original', checkSignIn, connectToDB, function (req, res, next) {

    var action = req.query.action;
    var account = req.query.twitter;
    var passcode = req.query.passcode;
    var userId = req.session.userId;

    if (userId === undefined) {
        res.redirect('submit');
    }

    if (action == 'search' && typeof(account) != 'undefined') {
        var keyword = req.query.keyword;
        res.render('error', {
            title: 'This function hasn\'t been implemented',
            message: 'This function hasn\'t been implemented',
            info: 'Search tweets with keyword \'' + keyword + '\'.'
        });
    }

    const passCodeSQL = "select * from passcode where passcode = ? && valid = 1";
    conn.query(passCodeSQL, [passcode], function (err, result) {
        console.log("original result length:" + result.length);
        if (result !== undefined && result.length === 1) {
            if (action === 'audit' && typeof(account) !== 'undefined') {
                var dataSQL = "select tweets.tweetText, tweets.postTime, flags2tweets.indices, " +
                    "flags2tweets.degree, flag.flagContext " +
                    "from tweets left join flags2tweets on (tweets.tweetId = flags2tweets.tweetId) " +
                    "left join flag on (flags2tweets.flagId = flag.flagId) " +
                    "where userId = ?;";
                conn.query(dataSQL, [userId], function (err, result) {
                    var data = [];
                    for (var index in result) {
                        if (index > pageLimit) {
                            break;
                        }
                        var degreeType;
                        var comment;
                        //fixed null value for tweetDate
                        var tweetDate = null;
                        if (result[index].postTime !== null) {
                            tweetDate = result[index].postTime.toLocaleDateString();
                        } else {
                            tweetDate = "null";
                        }
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
                                date: tweetDate,
                                comment: comment,
                                content: content
                            });
                        } else {
                            data.push({
                                type: 'success',
                                date: tweetDate,
                                comment: '(not flagged)',
                                content: [{type: "text", content: result[index].tweetText}]
                            });
                        }
                    }
                    data.sort(dynamicSortMultiple("type", 'tweetDate'));
                    res.render('original', {title: 'Original Tweets', data: data, account: account});
                });
            } else if (action === 'submit' && typeof(account) !== 'undefined') {
                res.redirect('decision?action=submit&twitter=' + account);
            } else if (action === 'home') {
                res.redirect('portal');
            } else {
                res.redirect('submit');
            }
        } else {
            res.render('error', {
                title: 'Incorrect Passcode',
                message: 'Incorrect Passcode Entry ',
                info: 'The passcode entered is not valid.'
            });
        }
    })
});

/**
 * GET making decision page where agent make their decision about a userId(twitter).
 */
router.get('/decision', checkSignIn, connectToDB, function (req, res, next) {

    var action = req.query.action;
    var account = req.query.twitter;

    var userId = req.session.userId;
    if (userId === undefined) {
        res.redirect('submit');
    }
    var agentId = req.session.agentId;
    if (userId === undefined) {
        res.redirect('login');
    }
    var decisionTime = new Date();
    var expireTime = new Date();
    expireTime.setDate(expireTime.getDate() + defaultExpiringPeriod);

    var sql = "insert into decision(userId,agentId,value,decisionTime,expireTime) values(?,?,?,?,?)";
    if (action === 'submit' && typeof(account) !== 'undefined') {
        data = [];
        res.render('decision', {title: 'Make a Decision', account: account});
    } else if (action === 'yes' && typeof(account) !== 'undefined') {
        var pass = 1;
        conn.query(sql, [userId, agentId, pass, decisionTime, expireTime], function (err, result) {
            if (err) {
                console.log(err);
            }
            console.log("decision pass:" + result);
        })
        res.render('info', {
            title: 'Decision Confirmation',
            message: 'Passenger ' + account + " Pass the Twitter Audit",
            info: 'You have determined that the traveler’s Twitter ' +
            'Account raises no concerns regarding this traveler’s entry ' +
            'into the United States.'
        });
    } else if (action === 'no' && typeof(account) !== 'undefined') {
        var denied = 0;
        conn.query(sql, [userId, agentId, denied, decisionTime, expireTime], function (err, result) {
            if (err) {
                console.log(err);
            }
            console.log("decision denied:" + result);
        })
        res.render('info', {
            title: 'Decision Confirmation',
            message: 'Passenger ' + account + " Fail the Twitter Audit",
            info: 'You have determined that the traveler’s Twitter ' +
            'Account raises concerns regarding this traveler’s ' +
            'entry into the United States.'
        });
    } else if (action === 'home') {
        res.redirect('portal');
    } else {
        res.redirect('submit');
    }
});

/**
 * GET addAccounts page. Surpervisor manage agents' accounts.
 */
router.get('/addAccounts', checkSignIn, connectToDB, function (req, res, next) {
    const action = req.query.action;
    const curAgentlevel = req.session.level;
    const curAgentAccount = req.session.agentName;
    var firstName = req.query.firstName;
    var lastName = req.query.lastName;
    var password = req.query.password;
    const agentRole = req.query.role;
    console.log("Username: " + firstName + "_" + lastName + ", Password: " + password + ", role: " + agentRole);

    // dealing with trailing and leading space
    if (firstName !== undefined && firstName !== null) {
        firstName = firstName.trim();
    }
    if (lastName !== undefined && lastName !== null) {
        lastName = lastName.trim();
    }

    if (curAgentlevel !== SupervisorLevel) {
        res.render('error', {
            title: 'Unauthenticated Acces',
            message: 'Unauthenticated Access to page for superviser ',
            info: 'Only surperviser can access this page'
        });
    }

    if (action === 'delete') {
        const agentName = req.query.agentName;
        const deleteAgentAccountSQL = 'delete from Agent where agentName = ?';
        conn.query(deleteAgentAccountSQL, [agentName], function (err, result) {
            dealwithInternalError(res, err);
            res.redirect('addAccounts');
        });

    } else if (action === 'add') {
        var agentLevel = -1;

        if (agentRole === 'Supervisor') {
            agentLevel = 3;
        } else if (agentRole === 'Agent') {
            agentLevel = 1;
        } else {
            res.render('error', {
                title: 'Invalid role',
                message: 'Invalid role',
                info: 'The role of an Agent must be "supervisor" or "Agent".'
            });
            return;
        }

        const agentName = firstName + ' ' + lastName;
        var agentAccount = agentName;
        agentAccount = agentAccount.replace(' ', '_').toLowerCase();
        var agentPassword = password;
        const addAgentAccountSQL = 'insert into Agent(agentName,level,account,password) values(?,?,?,?)';
        const checkExistSQL = 'select * from Agent where account = ?';

        bcrypt.hash(agentPassword, saltRounds, function (err, hash) {
            conn.query(checkExistSQL, [agentAccount], function (err, result) {
                if(result !== undefined && result.length !== 0){
                    res.render('info', {
                        title: 'Account is already exists',
                        message: 'Account has already exists',
                        info: 'Account has already exists, please check the name again'
                    });
                    return;
                }
                conn.query(addAgentAccountSQL, [agentName, agentLevel, agentAccount, hash], function (err, result) {
                    dealwithInternalError(res, err);
                    // res.redirect('addAccounts');
                    res.render('info', {
                        title: 'Account is created',
                        message: 'Account is created',
                        info: 'Your username is "' + agentAccount + '".'
                    });
                });
            });

        });

    } else if (action === 'home') {
        res.redirect('portal');
    } else {
        const getAgentAccountsSQL = 'select * from Agent where agentName != ?';
        conn.query(getAgentAccountsSQL, [curAgentAccount], function (err, result) {
            dealwithInternalError(res, err);
            var accounts = [];
            for (var index in result) {
                var name = result[index]['agentName'].split(' ');
                var agentLevel = result[index]['level'];
                var agentRole;
                if (agentLevel === 3) {
                    agentRole = 'Supervisor';
                } else if (agentLevel === 1) {
                    agentRole = 'Agent';
                } else {
                    res.render('error', {
                        title: 'Internal error',
                        message: 'Internal error',
                        info: 'An internal error happend! Sorry for this.'
                    });
                }
                accounts.push({
                    'first': name[0],
                    'last': name[1],
                    'role': agentRole
                })
            }
            res.render('addAccounts', {
                title: 'Accounts Management', accounts: accounts
            });
        })
    }
});

/*
 /!* GET addCustomFlag page. *!/
 router.get('/addCustomFlag', checkSignIn, connectToDB, function(req, res, next) {
 // TODO: add custom flag
 });
 */

module.exports = router;
