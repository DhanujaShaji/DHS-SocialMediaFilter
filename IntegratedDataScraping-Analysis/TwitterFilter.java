package analyzer;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Scanner;

//import org.apache.commons.httpclient.URIException;
//import org.apache.commons.httpclient.util.URIUtil;
//import org.apache.http.client.utils.URLEncodedUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;


public class TwitterFilter {
    private static final String API_KEY = "400b351f05b3242ffc4142f7f86a6372";
    private static final String BASE_URL = "http://api1.webpurify.com/services/rest/";
    private static final String BASE_METHOD = "webpurify.live.";
    private static final String METHOD_GET_FLAGS = BASE_METHOD + "getblacklist";
    private static final String METHOD_ADD_FLAGS = BASE_METHOD + "addtoblacklist";
    private static final String METHOD_REMOVE_FLAGS = BASE_METHOD + "removefromblacklist";
    private static final String METHOD_CHECK = BASE_METHOD + "check";
//    private static final String FLAGGED_WORDS = "./doc/Flagged.txt";
//    private static final String BLACK_LIST = "./doc/DemoBlacklist.txt";

    private List<String> flags;
    private String tID;
    private HashMap<String, String> params;

    public TwitterFilter() {
        params = new HashMap<String, String>();
        params.put("api_key", API_KEY);
        params.put("format", "json");

        flags = new ArrayList<String>();
        readFile(flags);
        // addFlags(flags);
    }

    public String getTID() {
        return tID;
    }

    public void setTID(String tID) {
        this.tID = tID;
    }

    // http://api1.webpurify.com/services/rest/
    // ?api_key=400b351f05b3242ffc4142f7f86a6372&method=webpurify.live.getblacklist&format=json
    public List<String> getFlags() {
        params.put("method", METHOD_GET_FLAGS);
        String s = HttpHelper.get(BASE_URL, params);
        JSONParser jp = new JSONParser();
        JSONArray flagsJA = null;
        try {
            JSONObject jsonObj = (JSONObject) jp.parse(s);
            flagsJA = (JSONArray) ((JSONObject) jsonObj.get("rsp")).get("word");
        } catch (ParseException e) {
            e.printStackTrace();
        }

        List<String> res = new ArrayList<String>(flagsJA);
        return res;
    }

    /**
     * Use this function to add flags that we want to check in Twitters.
     * 
     * @param flags
     *            list of flags
     */
    public void addFlags(List<String> flags) {
        params.put("method", METHOD_ADD_FLAGS);
        for (String flag : flags) {
            params.put("word", flag);
            HttpHelper.get(BASE_URL, params);

        }
        params.remove("word");
    }

    /**
     * clear all flags
     */
    public void clearFlags() {
        List<String> currFlags = getFlags();
        params.put("method", METHOD_REMOVE_FLAGS);
        flags.clear();
        for (String flag : currFlags) {
            params.put("word", flag);
            String s = HttpHelper.get(BASE_URL, params);
            System.out.println(s);
        }
        params.remove("word");
    }

    /**
     * Call this function to check twitters of a given person.
     * 
     * @param twitts
     *            twitters of a given person
     * @return Return a list of all twitters of this person. The first string is
     *         a number \ that shows how many twitters are flagged. Suppose the
     *         number here is N, then the following \ N strings are flagged
     *         twitters. Strings after these N strings are twitters that aren't
     *         flagged.
     */
    @SuppressWarnings("unchecked")
    public JSONObject checkTwitts(List<String> twitts) {
        JSONArray flaged = new JSONArray();
        JSONArray notFlaged = new JSONArray();
        JSONArray flaggedDetail = new JSONArray();

        for (String twitt : twitts) {
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
            } else
                notFlaged.add(twitt);
        }

        JSONObject res = new JSONObject();
        res.put("flaged", flaged);
        res.put("notFlaged", notFlaged);
        res.put("flagedDetail", flaggedDetail);

        System.out.println("twitter check result:");
        System.out.println(res.toString());

        return res;
    }

    private String getFlaggedDetail(String twit, String flag) {
        StringBuilder sb = new StringBuilder();
        int index = 0, nextIndex;

        while (index < twit.length() && index >= 0 && (nextIndex = twit.indexOf(flag, index)) != -1) {
            sb.append(nextIndex).append(",");
            index = nextIndex + 1;
        }
        sb.deleteCharAt(sb.length() - 1);

        return sb.toString();
    }

    private void readFile(List<String> list) {
        InputStream is = TwitterFilter.class.getResourceAsStream("/Flagged.txt");
        Scanner scanner = null;

        try {
            scanner = new Scanner(is, "UTF-8");
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                list.add(line.trim());
            }
        } 
//        catch (FileNotFoundException e) {
//            e.printStackTrace();
//        } 
        catch (NumberFormatException e) {
            e.printStackTrace();
        } finally {
            if (scanner != null)
                scanner.close();
        }
    }

    /**
     * Demo usage of TwitterFilter class.
     * 
     * @param args
     */
    public static void main(String[] args) throws FileNotFoundException, IOException {
        FileWriter fw = new FileWriter("Tweet.txt");
        BufferedWriter bw = new BufferedWriter(fw);
        FileWriter fw2 = new FileWriter("BlacklistedFollowers.txt");
        BufferedWriter bw2 = new BufferedWriter(fw2);

        TwitterFilter tf = new TwitterFilter();

        TwitterScraper tS = new TwitterScraper("realDonaldTrump");
        List<String> twitts = new ArrayList<String>();
        twitts = tS.getTweet();

        JSONObject checkRes = tf.checkTwitts(twitts);
        

        bw.write(checkRes.toJSONString());

        BlackList blacklist = new BlackList();
        List<String> list = new ArrayList<String>();
        list = tS.getFollowers();
        List<String> checkFollowersRes = blacklist.checkFollowers(list);
        for (String s : checkFollowersRes) {
            bw2.write(s);
        }
        bw.close();
        fw2.close();
        bw2.close();
    }
}