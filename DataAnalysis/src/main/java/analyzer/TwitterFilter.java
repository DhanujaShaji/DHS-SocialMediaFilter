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
import java.util.Calendar;

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
    public JSONObject checkTweets(List<String> tweets) {
        JSONArray flaged = new JSONArray();
        JSONArray flaggedDetail = new JSONArray();
        
//        System.out.println(tweets.toString());
        for (String twitt : tweets) {
            boolean flagged = false;
            JSONObject detail = new JSONObject();

            for (String flag : flags) {
                if (twitt.indexOf(flag) != -1) {
                    flagged = true;
                    detail.put(flag, getFlaggedDetail(twitt, flag));
                }
            }

            if (flagged) {
                flaged.add(twitt);
                flaggedDetail.add(detail);
            }
        }
        JSONObject res = new JSONObject();
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

    private List<String> censorTweets(List<String> tweets) {
        List<String> res = new ArrayList<>();
        for (int i = 0; i < tweets.size(); i++) {
            String twitt = tweets.get(i);
            String censoredTwitt = new String(twitt);

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
        List<String> tweets = new ArrayList<>();
        tweets = tS.getTweet();
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
           StringBuilder resTweet= new StringBuilder();
           StringBuilder resFriends= new StringBuilder();
           statement.executeUpdate("INSERT INTO user(userName) " + "VALUES (" +  "\"" + name + "\"" + ")");
           ResultSet rs = statement.executeQuery("SELECT userId  FROM user WHERE userName = "+ "\'" + name + "\'");
           while (rs.next()) {
              userId = rs.getInt("userId");
          }
//           System.out.println(tweets);
//           System.out.println(censorRes);
           for(int i=0; i< censorRes.size(); i++){
                resTweet = new StringBuilder();
                resTweet.append("\"");
                resTweet.append(userId);
                resTweet.append("\"");
                resTweet.append(",");
                resTweet.append("\"");
                resTweet.append(tweets.get(i)); 
                resTweet.append("\"");
                resTweet.append(",");
                resTweet.append("\"");
                resTweet.append(censorRes.get(i));
                resTweet.append("\"");        
                statement.executeUpdate("INSERT INTO tweets(userId, tweetText, anonymizedText) " + "VALUES (" +  resTweet + ")");
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
          JSONArray a = (JSONArray)flagRes.get("flagedDetail");
          JSONArray b = (JSONArray)flagRes.get("flaged");
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
               resFlagDetail.append("\"");
                resFlagDetail.append(tweetId);
                resFlagDetail.append("\"");
                resFlagDetail.append(",");
                resFlagDetail.append("\"");
                resFlagDetail.append(flagId);
                resFlagDetail.append("\"");
                resFlagDetail.append(",");
                resFlagDetail.append("\"");
               for (Object obj : r.keySet()) {
                	//this is the word
                	String key = (String) obj;
                	System.out.println(key);
                	//this is array of positions.
                	JSONArray values = (JSONArray)r.get(key);
                	for (Object posObj : values) {
                		//this is one position.
                		int pos = (Integer)posObj;
                        resFlagDetail.append(pos);
                        resFlagDetail.append("\"");
                        statement.executeUpdate("INSERT INTO flags2tweets(tweetId, flagId, indices) " + "VALUES (" +  resFlagDetail + ")");
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
