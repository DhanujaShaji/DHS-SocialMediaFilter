# DHS-SocialMediaFilter

08-605 Engineering Privacy Team Project

## Components

- Frontend (User Interface)
- List of Censored, Blacklisted, and flagged terms
- Backend
- Data Scraping
- Data Analysis
- IntegratedDataScraping+Analysis

## Frontend (User Interface)

The frontend provides the user interface for the DHS agents. It allows DHS agents to submit Twitter accounts and review the data analysis results provided by our tool.

### Censored, Blacklisted and flagged terms 
 - Censored terms came from the sensitive information detailed in the project requirements
  - specfically terms related to sexual orientation, financial information, illness (mostly cancer), various dating-related terms and sexual terms (gotten from various websites)
 - flagged terms came directly from the DHS's watchlisted terms, which was published 
 - blacklists were harder to find, after searching the internet
 - Demo blacklist was a sample for demo-ing purposes, using Donald Trump's twitter and who he was following in order to cause the tool alarm 

### Technology Details

- The frontend views are developed based on the Bootstrap Web Framework with JavaScript. 
- The ICOs are used from Font Awesome Library. 
- The backend who controls the workflow and provides the data is based on the Node.JS Framework. 
- The webpage is wroten in Jade language and rendered to the HTML by backend.

### Features

- Submit Twitter account
- Display Statistic Data Analysis Report
- Provide Anonymized Twitter Data
- Uncover Original Twitter Data
- Make an Audit Decision

## IntegratedDataScraping+Analysis
- Consists of all codes required for data scraping and analysis. 

### File function explaination
- "TwitterFilter.java": The main class and the twitter ID to be examined should be provided as command line argument.
- TwitterScraper.java : The scraping program that calls the Twitter API to get the recent 20 tweets and 20 friends of the given twitter ID.
- BlackList.java : This class is a part of data analysis and can be used to check whether a given user has any friend who is in the blacklist.
- HttpHelper.java : Helper class to send http post & get request
- The lib folder consists of all the external libraries required to run these codes.

## Data Analysis
- Eclipse project for data analysis.
- Already integrated and updated in IntegratedDataScraping-Analysis part.
- Deprecated. Keep it for possible future reference.
