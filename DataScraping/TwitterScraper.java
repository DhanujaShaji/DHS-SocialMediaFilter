

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import twitter4j.Status;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.conf.ConfigurationBuilder;
import twitter4j.User;

/**
 *
 * @author dhanu
 */
public class TwitterScraper {
    private static final String TWITTER_CONSUMER_KEY = "XFmTKLYLVlS5jAGpovhIxy39P";
    private static final String TWITTER_SECRET_KEY = "bvVJELAlTZUfsyaXNPJIab5v4vHTHNGFNRFypU61Xb3ZysrQy1";
    private static final String TWITTER_ACCESS_TOKEN = "827249757194219522-uNPQOx58STRq9smSURrnAFORlIdZJwf";
    private static final String TWITTER_ACCESS_TOKEN_SECRET = "D6xFEz6cC4Ykmepzd5Wpafo384hJQwdH03tdXgxXED1OK";

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) throws FileNotFoundException {
    ConfigurationBuilder cb = new ConfigurationBuilder();
    cb.setDebugEnabled(true)
      .setOAuthConsumerKey(TWITTER_CONSUMER_KEY)
      .setOAuthConsumerSecret(TWITTER_SECRET_KEY)
      .setOAuthAccessToken(TWITTER_ACCESS_TOKEN)
      .setOAuthAccessTokenSecret(TWITTER_ACCESS_TOKEN_SECRET);
    TwitterFactory tf = new TwitterFactory(cb.build());
    Twitter twitter = tf.getInstance();
    PrintWriter pw = new PrintWriter(new File("tweet.csv"));
    PrintWriter fw = new PrintWriter(new File("follower.csv"));
    StringBuilder sb = new StringBuilder();
    pw.write("Created_at , Tweet\n");
    fw.write("Twitter ID , Name\n");
    System.out.println("done!");
    try {
            List<Status> tweets = twitter.getUserTimeline(args[0]);
            for (Status tweet : tweets) {
                StringBuilder sb1 = new StringBuilder();
                sb1.append(tweet.getCreatedAt());
                sb1.append(',');
                sb1.append(tweet.getText().replaceAll("\\s+"," "));
                sb1.append('\n');
                pw.write(sb1.toString());
            }
            pw.close();
            ArrayList<String> list=new ArrayList<String>();
            List<User> followersList = twitter.getFollowersList(args[0], -1);
            for (int i = 0; i < followersList.size(); i++){
                User user = followersList.get(i);
                String name = user.getName();
                long id = user.getId();
                list.add(name);
                StringBuilder sb2 = new StringBuilder();
                sb2.append(user.getScreenName());
                sb2.append(',');
                sb2.append(user.getName());
                sb2.append('\n');
                fw.write(sb2.toString());
            }
            fw.close();
    } catch (TwitterException t) {
        t.printStackTrace();
        System.out.println("Failed to search tweets: " + t.getMessage());
    }
   }
    
}
