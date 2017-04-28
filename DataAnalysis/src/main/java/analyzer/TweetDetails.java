package analyzer;

import java.util.Date;

public class TweetDetails implements Comparable<TweetDetails>{
      String tweet;
      Date date;
      
      public String toString() {
    	  return "text: " + tweet + "\ndata:" + date.toString(); 
      }

	@Override
	public int compareTo(TweetDetails o) {
		return o.date.compareTo(date);
	}
}
