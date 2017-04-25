package server;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;

import analyzer.BlackList;
import analyzer.TwitterFilter;
import analyzer.TwitterScraper;

public class DataAnalysisServlet extends HttpServlet {

    /**
     * Function to handle HTTP GET request.
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doGet(final HttpServletRequest request, final HttpServletResponse response)
        throws ServletException, IOException {

        String userId = request.getParameter("userId");
        System.out.println(userId);
//        FileWriter fw = new FileWriter("Tweet.txt");
//        BufferedWriter bw = new BufferedWriter(fw);
//        FileWriter fw2 = new FileWriter("BlacklistedFollowers.txt");
//        BufferedWriter bw2 = new BufferedWriter(fw);
//
//        TwitterFilter tf = new TwitterFilter();
//
//        TwitterScraper tS = new TwitterScraper(userId);//new TwitterScraper("SenWarren");
//        List<String> twitts = new ArrayList<String>();
//        twitts = tS.getTweet();
//        // twitts.add("Today’s debate on the Fair Pay & Safe Workplaces order is
//        // about who Congress works for. I’m here to fight for workers – & I’ll
//        // be voting no");
//        JSONObject checkRes = tf.checkTwitts(twitts);
//        bw.write("success");
//        BlackList blacklist = new BlackList(BLACK_LIST);
//
//        List<String> list = new ArrayList<String>();
//        list = tS.getFollowers();
//        List<String> checkFollowersRes = blacklist.checkFollowers(list);
//        for (String s : checkFollowersRes) {
//            bw2.write(s);
//        }
//        bw.close();
//        fw2.close();
//        bw2.close();
//
        TwitterFilter tf = new TwitterFilter();
        PrintWriter writer = response.getWriter();
        writer.write(tf.checkPerson(userId));
        writer.close();
    }

    /**
     * Function to handle HTTP POST request.
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doPost(final HttpServletRequest request, final HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }
}
