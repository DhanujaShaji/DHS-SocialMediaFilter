import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.commons.httpclient.URI;
import org.apache.commons.httpclient.URIException;
import org.apache.commons.httpclient.util.URIUtil;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.Map;

public class HttpHelper {
    /**
     * Send Http get request.
     * @param baseURL url to send the request.
     * @param parameters parameter that should be sent.
     * @return response content.
     */
    public static String get(String url, Map<String, String> parameters){
        String para = getParaStr(parameters);
        try {
            para = URIUtil.encodePath(para, "ISO-8859-1");
        } catch (URIException e1) {
            // TODO Auto-generated catch block
            e1.printStackTrace();
        }
        String URL = url + "?" + para;
        return get(URL);
    }

    private static String get(String url){
        HttpClient httpclient = HttpClients.createDefault();      
        HttpGet httpGet = new HttpGet(url);
        HttpResponse response1 = null;
        String res = null;
        try {
            response1 = httpclient.execute(httpGet);            
            HttpEntity entity1 = response1.getEntity();
            res = EntityUtils.toString(entity1, "UTF-8");
            if (response1.getStatusLine().getStatusCode() != 200) {
                Thread.sleep(10000);
                res = get(url);
            }
        }
        catch(java.net.UnknownHostException|org.apache.http.conn.HttpHostConnectException e) {
            try {
                Thread.sleep(5000);
                System.out.println("connect failed. will repeat.");
            } catch (InterruptedException e1) {
                // TODO Auto-generated catch block
                e1.printStackTrace();
            }
            res = get(url);
        }
        catch (ClientProtocolException e) {
            res = get(url);
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } finally {
        }
        
        return res;
    }
    
    /**
     * Http get with storing return content as a file.
     * @param baseURL url to send request
     * @param parameters parameters to send
     */
    public static void getWithFile(String baseURL, Map<String, String> parameters){
        String s = get(baseURL, parameters);
        PrintWriter pw = null;
        try {
            pw = new PrintWriter(new File("log"), "UTF-8");
            pw.write(s);
        } catch (UnsupportedEncodingException | FileNotFoundException e) {
            e.printStackTrace();
        } finally {
            if (pw != null) pw.close();
        }
    }
    
    /**
     * Convert parameter map to String.
     * @param map input map that stores parameters
     * @return parameter string
     */
    private static String getParaStr(Map<String, String> map) {
        StringBuilder sb = new StringBuilder();
        for (String key : map.keySet()) {
            sb.append(key).append("=").append(map.get(key)).append("&");
        }
        sb.deleteCharAt(sb.length() - 1);
        return sb.toString();
    }
    
    public static String post(String baseURL, String para){
      HttpClient httpclient = HttpClients.createDefault();
      
//      String para = getParaStr(parameters);
//      String url = baseURL + "?" + para;
      
      HttpPost httpPost = new HttpPost(baseURL);
//      String entityStr = generateEntityString(parameters);
        
      HttpResponse response1 = null;
      String res = null;
      try {
          StringEntity params = new StringEntity(para);
          httpPost.setEntity(params);
          response1 = httpclient.execute(httpPost);
          
          HttpEntity entity1 = response1.getEntity();
          res = EntityUtils.toString(entity1, "UTF-8");
          if (response1.getStatusLine().getStatusCode() != 200) {
              Thread.sleep(10000);
              res = post(baseURL, para);
          }
          
      } catch(org.apache.http.conn.HttpHostConnectException e) {
          try {
              Thread.sleep(5000);
          } catch (InterruptedException e1) {
              // TODO Auto-generated catch block
              e1.printStackTrace();
          }
          res = post(baseURL, para);
      }
      catch (ClientProtocolException e) {
          res = post(baseURL, para);
      } catch (IOException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
      } catch (InterruptedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
      } finally {
      }
      
      return res;
  }
}