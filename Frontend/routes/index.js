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
router.get('/', function(req, res, next) {
    res.render('login', { title: 'Login Agent Account' });
});

/* GET portal page. */
router.post('/login', function (req, res, next) {
    var email = req.body.emailAddress;
    var psd = req.body.psd;
    data = {"name": email};
    res.render('portal', { title: 'Welcome ' + email, data: data});
});

/* GET page*/
router.get('/portal', function (req, res, next) {
    var decision = req.query.action;
    if (decision === "audit") {
        res.render('submit', { title: 'Submit Twitter Account' });
    } else if (decision === "review") {
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

/* GET report page. */
router.get('/submit', function(req, res, next) {
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
});

/* GET anonymized/decision page. */
router.get('/report', function(req, res, next) {
    var decision = req.query.action;
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
    } else {
        res.render('decision', { title: 'Make a Decision' });
    }
});

/* GET original page. */
router.get('/anonymized', function(req, res, next) {
    var decision = req.query.action;
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
    } else {
        res.render('decision', { title: 'Make a Decision' });
    }
});

/* GET decision page. */
router.get('/original', function(req, res, next) {
    res.render('decision', { title: 'Make a Decision' });
});

/* GET decision page. */
router.get('/decision', function(req, res, next) {
    var decision = req.query.action;
    if (decision === "yes") {

    } else {

    }
    res.render('submit', { title: 'Submit Twitter Account' });
});

module.exports = router;
