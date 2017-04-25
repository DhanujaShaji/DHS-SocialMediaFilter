package analyzer;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Scanner;
import java.util.Set;

import org.apache.commons.httpclient.URIException;
import org.apache.commons.httpclient.util.URIUtil;
import org.apache.http.client.utils.URLEncodedUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import java.sql.*;
import java.util.Calendar;
import java.util.Collections;

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
     * @param tweets Tweets of a given person
     * @return Return a list of all tweets of this person. The first string is a number \
     * that shows how many tweets are flagged. Suppose the number here is N, then the following \
     * N strings are flagged tweets. Strings after these N strings are tweets that aren't flagged. 
     */
    @SuppressWarnings("unchecked")
    public JSONObject checkTwitts(List<String> twitts) {
        JSONArray flaged = new JSONArray();
//        JSONArray notFlaged = new JSONArray();
        JSONArray flaggedDetail = new JSONArray();

        for (String twitt : twitts) {
            boolean flagged = false;
            JSONObject detail = new JSONObject();
            
            Set<String> set = new HashSet<String>();
            for (String s : twitt.split(" "))
                set.add(s);
            for (String flag : flags) {
                if (set.contains(flag)) {
                    flagged = true;
                    detail.put(flag, getFlaggedDetail(twitt, " " + flag + " "));
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

//        System.out.println("twitter check result:");
//        System.out.println(res.toString());

        return res;
    }

    private String getFlaggedDetail(String twit, String flag) {
        StringBuilder sb = new StringBuilder();
        int index = 0, nextIndex;

        while (index < twit.length() && index >= 0 && (nextIndex = twit.indexOf(flag, index)) != -1) {
            nextIndex++;
            sb.append(nextIndex).append(",");
            index = nextIndex + flag.length();
        }
        sb.deleteCharAt(sb.length() - 1);

        return sb.toString();
    }
    
    private void readFile(List<String> list, String filename) {
        Scanner scanner = null;
        try {
            scanner = new Scanner(new File(filename), "UTF-8");
            System.out.println(filename + ":" + scanner.nextLine());
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                System.out.println(filename + ":" + line);
                list.add(line.trim());
            }
        } catch(FileNotFoundException e) {
            e.printStackTrace();
        } catch(NumberFormatException e) {
            e.printStackTrace();
        } finally {
            if (scanner != null) scanner.close();
        }
    }
    
    private List<String> censorTwitts(List<String> twitts) {
        List<String> res = new ArrayList<>();
        for (int i = 0; i < twitts.size(); i++) {
            String twitt = twitts.get(i);
            String censoredTwitt = twitt;
            
            Set<String> set = new HashSet<String>();
            for (String s : twitt.split("[^a-zA-Z0-9]"))
                set.add(s);
            for (String censorStr : censorWords) {
                if (set.contains(censorStr)) {
                    censoredTwitt = censorTwitt(twitt, i, censorStr);
                }
            }
            
            res.add(censoredTwitt);
        }
        return res;
    }

    private String censorTwitt(String twitt, int i, String censorStr) {
        String res = new String(twitt);
        int index = 0, nextIndex;

        String mark = "";
        for (int num = 0; num < censorStr.length(); num++)
            mark = mark + "*";
        int len = censorStr.length();

        while (index < res.length() && index >= 0 && (nextIndex = res.indexOf(censorStr, index)) != -1) {
            if (nextIndex != 0 && res.substring(nextIndex - 1, nextIndex).matches("[a-zA-Z0-9]"))
                continue;
            if (nextIndex + len != twitt.length() && res.substring(nextIndex + len, nextIndex + len + 1).matches("[a-zA-Z0-9]"))
                continue;
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
        //***all twitts after censor (change sensitive words to ***)
        System.out.println(censorWords.toString());
        List<String> censorRes = tf.censorTwitts(tweets);
        //***all twitts that contains flags, and detail about positions of flags
        JSONObject flagRes = tf.checkTwitts(tweets);
        BlackList blacklist = new BlackList(BLACK_LIST);
        List<String> list = new ArrayList<>();
        list = tS.getFriends();
        //***friends in blacklist
        List<String> checkFriendsRes = blacklist.checkFriends(list);
        JSONObject jo = new JSONObject();
        jo.put("checkFriendsRes", checkFriendsRes.toString());
        jo.put("censorRes", censorRes.toString());
        jo.put("flagRes", flagRes.toJSONString());
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
           System.out.println(tweets);
           System.out.println(censorRes);
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
           conn.close();
           
       }
         catch (Exception e)
         {
             e.printStackTrace();

         }
        return jo.toJSONString();
    }
}

//
//import java.io.BufferedWriter;
//import java.io.File;
//import java.io.FileNotFoundException;
//import java.io.FileWriter;
//import java.io.IOException;
//import java.io.InputStream;
//import java.util.ArrayList;
//import java.util.Arrays;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Scanner;
//
////import org.apache.commons.httpclient.URIException;
////import org.apache.commons.httpclient.util.URIUtil;
////import org.apache.http.client.utils.URLEncodedUtils;
//import org.json.simple.JSONArray;
//import org.json.simple.JSONObject;
//import org.json.simple.parser.JSONParser;
//import org.json.simple.parser.ParseException;
//
//
//public class TwitterFilter {
//    private static final String API_KEY = "400b351f05b3242ffc4142f7f86a6372";
//    private static final String BASE_URL = "http://api1.webpurify.com/services/rest/";
//    private static final String BASE_METHOD = "webpurify.live.";
//    private static final String METHOD_GET_FLAGS = BASE_METHOD + "getblacklist";
//    private static final String METHOD_ADD_FLAGS = BASE_METHOD + "addtoblacklist";
//    private static final String METHOD_REMOVE_FLAGS = BASE_METHOD + "removefromblacklist";
//    private static final String METHOD_CHECK = BASE_METHOD + "check";
////    private static final String FLAGGED_WORDS = "./doc/Flagged.txt";
////    private static final String BLACK_LIST = "./doc/DemoBlacklist.txt";
//
//    private List<String> flags;
//    private List<String> censorWords;
//    private String tID;
////    private HashMap<String, String> params;
//
//    public TwitterFilter() {
//        flags = new ArrayList<String>();
//        censorWords = new ArrayList<String>();
//        readFile(flags, "Flagged.txt");
//        readFile(censorWords, "Censored.txt");
//    }
//
//    public String getTID() {
//        return tID;
//    }
//
//    public void setTID(String tID) {
//        this.tID = tID;
//    }
//
//    public List<String> getFlags() {
//        return flags;
//    }
//
//    /**
//     * Use this function to add flags that we want to check in Twitters.
//     * 
//     * @param flags
//     *            list of flags
//     */
//    public void addFlags(List<String> list) {
//        for (String s : list)
//            flags.add(s);
//    }
//    
//    public List<String> censorTwitts(List<String> twitts) {
//        for (int i = 0; i < twitts.size(); i++) {
//            String twitt = twitts.get(i);
//            for (String censorStr : censorWords) {
//                if (twitt.indexOf(censorStr) != -1) {
//                    censorTwitt(twitts, i, censorStr);
//                }
//            }
//        }
//        return twitts;
//    }
//    
//    private void censorTwitt(List<String> twitts, int i, String censorStr) {
//        String twit = twitts.get(i);
//        
//        int index = 0, nextIndex;
//        
//        String mark = "";
//        for (int num = 0; num < censorStr.length(); num++)
//            mark = mark + "*";
//        int len = censorStr.length();
//        
//        while (index < twit.length() && index >= 0 && (nextIndex = twit.indexOf(censorStr, index)) != -1) {
//            twit = twit.substring(0, nextIndex) + mark + twit.substring(nextIndex + len);
//            index = nextIndex + 1;
//        }
//        
//        twitts.set(i, twit);
//    }
//
//    /**
//     * Call this function to check twitters of a given person.
//     * 
//     * @param twitts
//     *            twitters of a given person
//     * @return Return a list of all twitters of this person. The first string is
//     *         a number \ that shows how many twitters are flagged. Suppose the
//     *         number here is N, then the following \ N strings are flagged
//     *         twitters. Strings after these N strings are twitters that aren't
//     *         flagged.
//     */
//    @SuppressWarnings("unchecked")
//    public JSONObject checkTwitts(List<String> twitts) {
//        JSONArray flaged = new JSONArray();
//        JSONArray notFlaged = new JSONArray();
//        JSONArray flaggedDetail = new JSONArray();
//
//        for (String twitt : twitts) {
//            boolean flagged = false;
//            JSONObject detail = new JSONObject();
//
//            for (String flag : flags) {
//                if (twitt.indexOf(flag) != -1) {
//                    flagged = true;
//                    detail.put(flag, getFlaggedDetail(twitt, flag));
//                }
//            }
//
//            if (flagged) {
//                flaged.add(twitt);
//                flaggedDetail.add(detail);
//            } else
//                notFlaged.add(twitt);
//        }
//
//        JSONObject res = new JSONObject();
//        res.put("flaged", flaged);
//        res.put("notFlaged", notFlaged);
//        res.put("flagedDetail", flaggedDetail);
//
//        System.out.println("twitter check result:");
//        System.out.println(res.toString());
//
//        return res;
//    }
//
//    private String getFlaggedDetail(String twit, String flag) {
//        StringBuilder sb = new StringBuilder();
//        int index = 0, nextIndex;
//
//        while (index < twit.length() && index >= 0 && (nextIndex = twit.indexOf(flag, index)) != -1) {
//            sb.append(nextIndex).append(",");
//            index = nextIndex + 1;
//        }
//        sb.deleteCharAt(sb.length() - 1);
//
//        return sb.toString();
//    }
//
//    private void readFile(List<String> list, String file) {
////        /Flagged.txt
//        InputStream is = TwitterFilter.class.getResourceAsStream("/" + file);
//        Scanner scanner = null;
//
//        try {
//            scanner = new Scanner(is, "UTF-8");
//            while (scanner.hasNextLine()) {
//                String line = scanner.nextLine();
//                list.add(line.trim());
//            }
//        } 
////        catch (FileNotFoundException e) {
////            e.printStackTrace();
////        } 
//        catch (NumberFormatException e) {
//            e.printStackTrace();
//        } finally {
//            if (scanner != null)
//                scanner.close();
//        }
//    }
//
//    /**
//     * Demo usage of TwitterFilter class.
//     * 
//     * @param args
//     */
//    public static void main(String[] args) throws FileNotFoundException, IOException {
////        FileWriter fw = new FileWriter("Tweet.txt");
////        BufferedWriter bw = new BufferedWriter(fw);
////        FileWriter fw2 = new FileWriter("BlacklistedFollowers.txt");
////        BufferedWriter bw2 = new BufferedWriter(fw2);
////
////        TwitterFilter tf = new TwitterFilter();
////
////        TwitterScraper tS = new TwitterScraper("realDonaldTrump");
////        
////        List<String> twitts = new ArrayList<String>();
////        twitts = tS.getTweet();
////        twitts = tf.censorTwitts(twitts);
////        System.out.println("after censor:");
////        System.out.println(twitts);
////        JSONObject checkRes = tf.checkTwitts(twitts);
////        
////
////        bw.write(checkRes.toJSONString());
////
////        BlackList blacklist = new BlackList();
////        List<String> list = new ArrayList<String>();
////        list = tS.getFollowers();
////        List<String> checkFollowersRes = blacklist.checkFollowers(list);
////        for (String s : checkFollowersRes) {
////            bw2.write(s);
////        }
////        bw.close();
////        fw2.close();
////        bw2.close();
//        
//        String tmp = "aa|aa";
//        System.out.println(Arrays.toString(tmp.split("\\|")));
//    }
//}
//public List<String> getFlags() {
////params.put("method", METHOD_GET_FLAGS);
////String s = HttpHelper.get(BASE_URL, params);
//JSONParser jp = new JSONParser();
//JSONArray flagsJA = null;
//try {
//JSONObject jsonObj = (JSONObject)jp.parse(s);
//flagsJA = (JSONArray)((JSONObject) jsonObj.get("rsp")).get("word");
//} catch (ParseException e) {
//e.printStackTrace();
//}   
//List<String> res = new ArrayList<>(flagsJA);
//return res;
//}

/**
* Use this function to add flags that we want to check in Tweets.
* @param flags list of flags
*/
//public void addFlags(List<String> flags) {
//params.put("method", METHOD_ADD_FLAGS);
//for (String flag : flags) {
//params.put("word", flag);
//HttpHelper.get(BASE_URL, params);       
//}
//params.remove("word");
//}

/**
* Function to clear all flags
*/
//public void clearFlags() {
//List<String> currFlags = getFlags();
//params.put("method", METHOD_REMOVE_FLAGS);
//flags.clear();
//for (String flag : currFlags) {
//params.put("word", flag);
//String s = HttpHelper.get(BASE_URL, params);
////System.out.println(s);
//}
//params.remove("word");
//}