## IntegratedDataScraping+Analysis
Consists of all codes required for data scraping and analysis. 

### File function explaination
- "TwitterFilter.java": The main class and the twitter ID to be examined should be provided as command line argument.
- TwitterScraper.java : The scraping program that calls the Twitter API to get the recent 20 tweets and 20 friends of the given twitter ID.
- BlackList.java : This class is a part of data analysis and can be used to check whether a given user has any friend who is in the blacklist.
- HttpHelper.java : Helper class to send http post & get request
- The lib folder consists of all the external libraries required to run these codes.
