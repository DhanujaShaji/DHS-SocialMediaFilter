package analyzer;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Scanner;
import org.apache.commons.httpclient.URIException;
import org.apache.commons.httpclient.util.URIUtil;
import org.apache.http.client.utils.URLEncodedUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;

public class TwitterFilter {
    private static final String FLAGGED_WORDS = "Flagged.txt";
    private static final String BLACK_LIST = "DemoBlacklist.txt";
    private List<String> flags;
    private String tID;
    private HashMap<String, String> params;
    private List<String> censorWords;

    public TwitterFilter() {
        flags = new ArrayList<String>();
        censorWords = new ArrayList<String>();
        readFile(flags, "Flagged.txt");
        readFile(censorWords, "Censored.txt");
    }

    public String getTID() {
        return tID;
    }

    public void setTID(String tID) {
        this.tID = tID;
    }

    /**
     * Call this function to check tweets of a given person.
     * 
     * @param tweets
     *            Tweets of a given person
     * @return Return a JSONObject. This JSONObject contains two fields,
     *         "flaged" and "flagedDetail" Both of them are JSONArray and has
     *         the same length. "flaged" stores all twitters that are flaged
     *         "flagedDetail" stores the position of flags flagedDetail[0]
     *         contains details of flaged[0] eg: { "flaged": ["twitter1",
     *         "twitter2"], "flagedDetail": ["detail of twitter1", "detail of
     *         twitter2"] }
     * 
     */
    @SuppressWarnings("unchecked")
    public JSONObject checkTweets(List<TweetDetails> tweets) {
        JSONArray flaged = new JSONArray();
        JSONArray flaggedDetail = new JSONArray();
        
        for (TweetDetails twitt : tweets) {
            boolean flagged = false;
            JSONObject detail = new JSONObject();

            for (String flag : flags) {
                if (twitt.tweet.indexOf(flag) != -1) {
                    flagged = true;
                    detail.put(flag, getFlaggedDetail(twitt.tweet, flag));
                }
            }

            if (flagged) {
//                flaged.add(twitt);
                detail.put("twitter", twitt);
                flaggedDetail.add(detail);
            }
        }
        JSONObject res = new JSONObject();
        Collections.sort(flaggedDetail, new Comparator<Object>() {
            @Override
            public int compare(Object o1, Object o2) {
                JSONObject obj1 = (JSONObject)o1;
                JSONObject obj2 = (JSONObject)o2;
                TweetDetails twitter1 = (TweetDetails)obj1.get("twitter");
                TweetDetails twitter2 = (TweetDetails)obj2.get("twitter");
                int num1 = 0;
                int num2 = 0;
                for (Object key : obj1.keySet()) {
                    System.out.println(key.toString());
                    if(key.equals("twitter")) continue;
                    JSONArray arr = (JSONArray)obj1.get((String)key);
                    num1 += arr.size();
                }
                for (Object key : obj2.keySet()) {
                    System.out.println(key.toString());
                    if(key.equals("twitter")) continue;
                    JSONArray arr = (JSONArray)obj2.get((String)key);
                    num2 += arr.size();
                }
                if (num2 != num1)
                	return num2 - num1;
                else 
                	return twitter2.date.compareTo(twitter1.date);
            }
        });
        
        for (Object obj : flaggedDetail) {
            JSONObject jo = (JSONObject)obj;
            TweetDetails twitt = (TweetDetails)jo.get("twitter");
            flaged.add(twitt.tweet);
            jo.remove("twitter");
        }
        
        res.put("flaged", flaged);
        res.put("flagedDetail", flaggedDetail);

        return res;
    }

    /**
     * If one flag exists in a twitter, then call this method to get detail
     * positions that this flag appears in the twitter.
     * 
     * @param tweet
     *            Twitter to check
     * @param flag
     *            Flag to check
     * @return return a JSONArray that contains all positions the given flag appears. 
     */
    @SuppressWarnings("unchecked")
    private JSONArray getFlaggedDetail(String tweet, String flag) {
        JSONArray arr = new JSONArray();
        int index = 0, nextIndex;

        while (index < tweet.length() && index >= 0 && (nextIndex = tweet.indexOf(flag, index)) != -1) {
            arr.add(nextIndex);
            index = nextIndex + flag.length();
        }

        return arr;
    }

    /**
     * Use this function to read flags and censor words.
     * 
     * @param list
     *            List to store words.
     * @param filename
     *            Name of file.
     */
    private void readFile(List<String> list, String filename) {
        Scanner scanner = null;
        try {
            scanner = new Scanner(new File(filename), "UTF-8");
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                list.add(line.trim());
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (NumberFormatException e) {
            e.printStackTrace();
        } finally {
            if (scanner != null)
                scanner.close();
        }
    }

    private List<String> censorTweets(List<TweetDetails> tweets) {
        List<String> res = new ArrayList<>();
        for (int i = 0; i < tweets.size(); i++) {
        	TweetDetails twitt = tweets.get(i);
            String censoredTwitt = new String(twitt.tweet);

            for (String censorStr : censorWords) {
                if (censoredTwitt.indexOf(censorStr) != -1) {
                    censoredTwitt = censorTweet(censoredTwitt, censorStr);
                }
            }

            res.add(censoredTwitt);
        }
        return res;
    }

    /**
     * If one twitter contains sensitive words, use this function to change
     * sensitive words to "***"
     * 
     * @param twitt
     *            Twitter to censor
     * @param censorStr
     *            sensitive word
     * @return return a String that changes all sensitive words from given
     *         twitter to "*"
     */
    private String censorTweet(String tweet, String censorStr) {
        String res = new String(tweet);
        int index = 0, nextIndex;

        String mark = "";
        for (int num = 0; num < censorStr.length(); num++)
            mark = mark + "*";
        int len = censorStr.length();

        while (index < res.length() && index >= 0 && (nextIndex = res.indexOf(censorStr, index)) != -1) {
            res = res.substring(0, nextIndex) + mark + res.substring(nextIndex + len);
            index = nextIndex + len;
        }

        return res;
    }

    @SuppressWarnings("unchecked")
    public String checkPerson(String name) {
    	
        TwitterFilter tf = new TwitterFilter();
        TwitterScraper tS = null;
        try {
            tS = new TwitterScraper(name);
        } catch (FileNotFoundException e1) {
            e1.printStackTrace();
        }
        List<TweetDetails> tweets = new ArrayList<>();
        tweets = tS.getTweet();
        Collections.sort(tweets);
        System.out.println(tweets.toString());
        // ***All tweets after censor (change sensitive words to ***)
        List<String> censorRes = tf.censorTweets(tweets);
        // ***All twitts that contains flags, and detail about positions of
        // flags
        JSONObject flagRes = tf.checkTweets(tweets);

        BlackList blacklist = new BlackList(BLACK_LIST);
        List<String> list = new ArrayList<>();
        list = tS.getFriends();
        
        // ***Friends in blacklist
        List<String> checkFriendsRes = blacklist.checkFriends(list);
        JSONObject jo = new JSONObject();
        jo.put("checkFriendsRes", checkFriendsRes.toString());
        jo.put("censorRes", censorRes.toString());
        jo.put("flagRes", flagRes);
        System.out.println(checkFriendsRes.toString());
        JSONArray detail = (JSONArray)flagRes.get("flagedDetail");
        for (int i = 0; i < detail.size(); i++) {
            JSONObject obj = (JSONObject) detail.get(i);
//            System.out.println(obj.keySet().toString());
        }
        
        int userId = 0;
        Connection conn = null;
        try
        {
           String url = "jdbc:mysql://104.197.6.255:3306/EPS";
           Class.forName("com.mysql.jdbc.Driver");
           conn = DriverManager.getConnection (url,"peuser","peuser");
           System.out.println ("Database connection established");
           Statement statement = conn.createStatement();
           
           ResultSet rs = statement.executeQuery("SELECT userId  FROM user WHERE userName = "+ "\'" + name + "\'");
             if(rs.next()) {
            String str1 ="USER EXISTS";
           	System.out.println(str1);
           	return str1;
           }
           int blacklistCount = checkFriendsRes.size();
           JSONArray a = (JSONArray)flagRes.get("flagedDetail");
           JSONArray b = (JSONArray)flagRes.get("flaged");

           StringBuilder resTweet= new StringBuilder();
           StringBuilder resFriends= new StringBuilder();
           StringBuilder resUser = new StringBuilder();
           resUser.append("\"");
           resUser.append(name);
           resUser.append("\"");
           resUser.append(",");
           resUser.append("\"");
           resUser.append(a.size()); 
           resUser.append("\"");
           resUser.append(",");
           resUser.append("\"");
           resUser.append(blacklistCount);
           resUser.append("\""); 

           statement.executeUpdate("INSERT INTO user(userName, flagTweetCount, blacklistCount) " + "VALUES (" + resUser +  ")");
           rs = statement.executeQuery("SELECT userId  FROM user WHERE userName = "+ "\'" + name + "\'");
           
           while (rs.next()) {
              userId = rs.getInt("userId");
          }
          
           for(int i=0; i< censorRes.size(); i++){
                resTweet = new StringBuilder();
                resTweet.append("\"");
                resTweet.append(userId);
                resTweet.append("\"");
                resTweet.append(",");
                resTweet.append("\"");
                resTweet.append(tweets.get(i).tweet); 
                resTweet.append("\"");
                resTweet.append(",");
                resTweet.append("\"");
                resTweet.append(censorRes.get(i));
                resTweet.append("\""); 
                resTweet.append(",");
                resTweet.append("\"");
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
                String date = sdf.format(tweets.get(i).date);
                resTweet.append(date);
                resTweet.append("\""); 
                int count = 0;
                if(b.contains(tweets.get(i).tweet)){
                    int k = b.indexOf(tweets.get(i).tweet);
                    JSONObject obj = (JSONObject)a.get(k);
                    count =  obj.size();
                }
                resTweet.append(",");
                resTweet.append("\"");
                resTweet.append(count);
                resTweet.append("\"");
                statement.executeUpdate("INSERT INTO tweets(userId, tweetText, anonymizedText, postTime, flagsCount) " + "VALUES (" +  resTweet + ")");
                
           }
           for(int i=0; i< checkFriendsRes.size() ;i++){
               resFriends = new StringBuilder();
               resFriends.append("\"");
               resFriends.append(userId);
               resFriends.append("\"");
               resFriends.append(",");
               resFriends.append("\"");
               resFriends.append(checkFriendsRes.get(i));
               resFriends.append("\"");
               statement.executeUpdate("INSERT INTO follow(userId, followerName) " + "VALUES (" +  resFriends + ")");
           }
          
          StringBuilder resFlagDetail = new StringBuilder();
          StringBuilder  resFlags = new StringBuilder();
           for(int i=0; i< a.size(); i++){  
                JSONObject r = (JSONObject)a.get(i);
                String s = (String)b.get(i);
                resFlags = new StringBuilder();
                resFlagDetail = new StringBuilder();
                resFlags.append("\"");
                resFlags.append(r.keySet().toString());
                resFlags.append("\"");  
                statement.executeUpdate("INSERT INTO flag(flagContext) " + "VALUES (" +  resFlags + ")");
                int tweetId = 0;
                int flagId = 0;
                ResultSet rs1 = statement.executeQuery("SELECT flagId  FROM flag WHERE flagContext = "+ "\'" + r.keySet().toString() + "\'");
                while (rs1.next()) {
                   flagId = rs1.getInt("flagId");
                }
                ResultSet rs2 = statement.executeQuery("SELECT tweetId  FROM tweets WHERE tweetText = "+ "\'" + s + "\'");
                while (rs2.next()) {
                   tweetId = rs2.getInt("tweetId");
                }
               
               for (Object obj : r.keySet()) {
                	//this is the word
                	String key = (String) obj;
                	System.out.println(key);
                	//this is array of positions.
                	JSONArray values = (JSONArray)r.get(key);
                	for (Object posObj : values) {
                		//this is one position.
                		int pos = (Integer)posObj;
                		int k =1;
                		resFlagDetail.append("\"");
                		resFlagDetail.append(tweetId);
                		resFlagDetail.append("\"");
                		resFlagDetail.append(",");
                		resFlagDetail.append("\"");
                		resFlagDetail.append(flagId);
                		resFlagDetail.append("\"");
                		resFlagDetail.append(",");
                		resFlagDetail.append("\"");
                        resFlagDetail.append(pos);
                        resFlagDetail.append("\"");
                        resFlagDetail.append(",");
                		resFlagDetail.append("\"");
                        resFlagDetail.append(k);
                        resFlagDetail.append("\"");

                        statement.executeUpdate("INSERT INTO flags2tweets(tweetId, flagId, indices, degree) " + "VALUES (" +  resFlagDetail + ")");
                		System.out.println(pos);
                	}
                	
                }
                
               
           }
           conn.close();
           
       }
       catch (Exception e)
       {
           e.printStackTrace();

       }
        return jo.toJSONString();
    }
}
