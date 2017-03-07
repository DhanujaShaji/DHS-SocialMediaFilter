import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
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

public class TwitterFilter {
    private static final String API_KEY = "400b351f05b3242ffc4142f7f86a6372";
    private static final String BASE_URL = "http://api1.webpurify.com/services/rest/";
    private static final String BASE_METHOD = "webpurify.live.";
    private static final String METHOD_GET_FLAGS = BASE_METHOD + "getblacklist";
    private static final String METHOD_ADD_FLAGS = BASE_METHOD + "addtoblacklist";
    private static final String METHOD_CHECK = BASE_METHOD + "check";
    private static final String FLAGGED_WORDS = "./doc/Flagged.txt";
    private static final String BLACK_LIST = "./doc/DemoBlacklist.txt";
    
    private String tID;
    private HashMap<String, String> params;
    
    public TwitterFilter() {
        params = new HashMap<>();
        params.put("api_key", API_KEY);
        params.put("format", "json");
    }

    public String getTID() {
        return tID;
    }

    public void setTID(String tID) {
        this.tID = tID;
    }
//    http://api1.webpurify.com/services/rest/
//    ?api_key=400b351f05b3242ffc4142f7f86a6372&method=webpurify.live.getblacklist&format=json
    public List<String> getFlags() {
        params.put("method", METHOD_GET_FLAGS);
        String s = HttpHelper.get(BASE_URL, params);
        JSONParser jp = new JSONParser();
        JSONArray flagsJA = null;
        try {
            JSONObject jsonObj = (JSONObject)jp.parse(s);
            flagsJA = (JSONArray)((JSONObject) jsonObj.get("rsp")).get("word");
        } catch (ParseException e) {
            e.printStackTrace();
        }
        
        List<String> res = new ArrayList<>(flagsJA);
        return res;
    }
    
    /**
     * Use this function to add flags that we want to check in Twitters.
     * @param flags list of flags
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
     * Call this function to check twitters of a given person.
     * @param twitts twitters of a given person
     * @return Return a list of all twitters of this person. The first string is a number \
     * that shows how many twitters are flagged. Suppose the number here is N, then the following \
     * N strings are flagged twitters. Strings after these N strings are twitters that aren't flagged. 
     */
    public List<String> checkTwitts(List<String> twitts) {
        List<String> flaged = new ArrayList<>();
        List<String> notFlaged = new ArrayList<>();
//        List<String> flagedDetail = new ArrayList<String>();
        
        params.put("method", METHOD_CHECK);
        for (String twitt : twitts) {
            params.put("text", twitt);
            String response = HttpHelper.get(BASE_URL, params);
            JSONParser jp = new JSONParser();
            try {
                JSONObject jsonObj = (JSONObject)jp.parse(response);
                int found = Integer.parseInt((String)((JSONObject) jsonObj.get("rsp")).get("found"));
                if (found == 0)
                    notFlaged.add(twitt);
                else {
                    flaged.add(twitt);
                }
            } catch (ParseException e) {
                e.printStackTrace();
            }
        }
        List<String> res = new ArrayList<>();
        res.add(Integer.toString(flaged.size()));
        res.addAll(flaged);
        res.addAll(notFlaged);
        return res;
    }
    
    private void readFile(List<String> list, String filename) {
        Scanner scanner = null;
        
        try {
            scanner = new Scanner(new File(filename), "UTF-8");
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
//                if (Integer.parseInt(line.split("\\s++")[0]) > 100000) {
                    list.add(line.trim());
//                }
            }
        } catch(FileNotFoundException e) {
            e.printStackTrace();
        } catch(NumberFormatException e) {
            e.printStackTrace();
        } finally {
            if (scanner != null) scanner.close();
        }
    }
    /**
     * Demo usage of TwitterFilter class.
     * @param args
     */
    public static void main (String[] args) throws FileNotFoundException, IOException{
      FileWriter fw = new FileWriter("Tweet.txt");
      BufferedWriter bw = new BufferedWriter(fw);
      FileWriter fw2 = new FileWriter("BlacklistedFollowers.txt");
      BufferedWriter bw2 = new BufferedWriter(fw);
      TwitterFilter tf = new TwitterFilter();
      
      List<String> flags = new ArrayList<>();
      tf.readFile(flags, FLAGGED_WORDS);
      tf.addFlags(flags);
      
      TwitterScraper tS =new TwitterScraper(args[0]);
      List<String> twitts = new ArrayList<>();
      twitts = tS.getTweet();
      List<String> checkRes = tf.checkTwitts(twitts);
      System.out.println(checkRes.toString());
      for(String s: checkRes){
          bw.write(s);
      }
      BlackList blacklist = new BlackList(BLACK_LIST);
      //System.out.println(blacklist.showBlacklist());
      List<String> list = new ArrayList<>();
      list = tS.getFollowers();
      System.out.println(blacklist.checkFollowers(list).toString());
      for(String s: blacklist.checkFollowers(list)){
          bw2.write(s);
      }
  }
}