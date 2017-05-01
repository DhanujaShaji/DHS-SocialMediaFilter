package analyzer;


import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
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
    private static List<TweetDetails> tweet = new ArrayList<TweetDetails>();
    private static List<String> friends = new ArrayList<String>();
    public List<TweetDetails> getTweet(){
        return tweet;
    }
    public List<String> getFriends(){
        return friends;
    }
    public TwitterScraper(String ID) throws FileNotFoundException {
        ConfigurationBuilder cb = new ConfigurationBuilder();
    cb.setDebugEnabled(true)
      .setOAuthConsumerKey(TWITTER_CONSUMER_KEY)
      .setOAuthConsumerSecret(TWITTER_SECRET_KEY)
      .setOAuthAccessToken(TWITTER_ACCESS_TOKEN)
      .setOAuthAccessTokenSecret(TWITTER_ACCESS_TOKEN_SECRET);
    TwitterFactory tf = new TwitterFactory(cb.build());
    Twitter twitter = tf.getInstance();
    tweet = new ArrayList<TweetDetails>();
    friends = new ArrayList<String>();
    System.out.println("done!");
    try {
            List<Status> tweets = twitter.getUserTimeline(ID);
           
            for (Status t : tweets) {
                TweetDetails tD = new TweetDetails();
                tD.tweet = t.getText();
                tD.date = t.getCreatedAt();
                tweet.add(tD);

            }
            
            List<User> friendsList = twitter.getFriendsList(ID, -1);
            for (int i = 0; i < friendsList.size(); i++){
                User user = friendsList.get(i);
                String name = user.getName();
                long id = user.getId();
                friends.add(name);
            }
    } catch (TwitterException t) {
        t.printStackTrace();
        System.out.println("Failed to search tweets: " + t.getMessage());
    }
   }
    
}
