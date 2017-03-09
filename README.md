# DHS-SocialMediaFilter

08-605 Engineering Privacy Team Project

## Components

- Frontend (User Interface)
- Backend
- Data Scraping
- Data Analysis
- IntegratedDataScraping+Analysis

## Frontend (User Interface)

The frontend provides the user interface for the DHS agents. It allows DHS agents to submit Twitter accounts and review the data analysis results provided by our tool.

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

##IntegratedDataScraping+Analysis
- Consists of all codes required for data scraping and analysis. The "TwitterFilter.java" is the main class and the twitter ID to be examined should be provided as command line argument.
- The lib folder consists of all the external libraries required to run these codes.
- TwitterScraper.java : The scraping program that calls the Twitter API to get the recent 20 tweets and 20 friends of the given twitter ID.
  
