# DHS-SocialMediaFilter

08-605 Engineering Privacy Team Project

## Current Status: 

Currently, the tool is able to login as well as successfully create a login identity which includes a user name and a password as well as an authority level of either agent or supervisor - this is located in "Manage Accounts". A supervisor may also deactivate a user. Additionally, the process for generating a passcode in order to view unfiltered data is complete, as well as the ability to modify past decisions - including increasing retention time, changing the decision from pass to fail and vice versa, and pulling up the flagged tweets from that decision. 

The process for screening a traveler is complete, and the agent can input a Twitter handle, see a statistical analysis of the person's tweets, and choose to proceed with the process, or make a decision. If they do proceed, they can see a list of tweets, with flagged tweets at the top and sensitive information contained within the tweets will not be visible. In order to see unfiltered tweets, the agent must input a password. Once they do, they can see all the tweets with no filters. Finally, the agent can make a decision, which will be stored, along with the person's flagged tweets and Twitter handle. 

Current bugs: 
- The tool struggles to pull the tweets for many handles - server issues? 
- The tool cannot handle emojis within tweets 
- API limitation - currently set at 20 tweets for demo purposes
- The flagged tweets are still being filtered 
- Navigation in the Administration panel is a bit unintuitive

## Components

- Frontend (User Interface)
- List of Censored, Blacklisted, and flagged terms
- Backend
- Data Scraping
- Data Analysis
- IntegratedDataScraping+Analysis

## Frontend (User Interface)

The frontend folder contains the user interface for the DHS agents. It allows DHS agents to submit Twitter accounts and review the data analysis results provided by our tool.

### Technology Details

- The frontend views are developed based on the Bootstrap Web Framework with JavaScript. 
- The ICOs are used from the Font Awesome Library. 
- The backend that controls the workflow and provides the data is based on the Node.JS Framework. 
- The webpage is written in the Jade language and is rendered to the HTML by the backend.

### Features

- Submit Twitter account
- Display Statistic-based Data Analysis Report
- Provide Censored Twitter Data
- Uncover Original Twitter Data
- Make an Audit Decision

## Backend

### Major Work

- Component Integration
 - Render frontend page
 - Manage database
 - Control the work of IntegratedDataScraping+Analysis component 

- Database
 - Create a database that supplies the structure and communications between parts.
 - Manage the database to support of other components,like DataScraping+Analysis component.
 - Deploy it in Google Cloud platform so everyone can access it.

- Server frontend pages:
 - Retrieve data from database and then render the frontend pages requested by user using the data retrieved(14 pages in total).
 - Get input data from user and store the data into database (14 pages in total).
 - Send and receive http request to DataScraping+Analysis component to control the work of that component.
 - User login and access control. Store salted passwords and use session instead of cookie to store the state of a user.
 - Passcode management. generate passcode and delete passcode which has expired.
 - Scheduling job to automatically delete data in database which has expired.
 - Passes and processes information to and from the frontend successfully.

- Major third module used in backend
 - express, mysqljs, express-session, request, bcrypt, node-schedule, async.

### File structure

 - routes/index.js, nearly all of the works mentioned are finished within this file.
 - app.js, setting the environment and global variables of this application
 - db.js, interface used to connect to database.
 - Query, sql statement used to create tables of database.
 - Database_scheme.png, the database scheme.
 - package.json, meta data and dependencies of this application.

## Censored, Blacklisted and flagged terms 
 - Censored terms came from the sensitive information detailed in the project requirements - Censored.txt
  - Specfically terms related to sexual orientation, financial information, illness (mostly cancer), various dating-related terms and sexual terms (terms pulled from various websites)
 - Flagged terms came directly from the DHS's watchlisted terms, which was published - Flagged.txt
 - Blacklists were harder to find, searched the internet for Twitter ID's of known terrorist groups - Blacklist.txt
 - Demo blacklist was a sample for demo-ing purposes, using Donald Trump's twitter and who he was following in order to cause the tool alarm - DemoBlacklistNames.txt

## IntegratedDataScraping+Analysis
- Consists of all codes required for data scraping and analysis. 

### File function explanation
- "TwitterFilter.java": The main class and the twitter ID to be examined should be provided as command line argument.
- TwitterScraper.java : The scraping program that calls the Twitter API to get the recent 20 tweets and 20 friends of the given twitter ID.
- BlackList.java : This class is a part of data analysis and can be used to check whether a given user has any friend who is in the blacklist.
- HttpHelper.java : Helper class to send http post & get request
- The lib folder consists of all the external libraries required to run these codes.

## Data Analysis
- Eclipse project for data analysis.
- Already integrated and updated in IntegratedDataScraping-Analysis part.
- Deprecated. Keep it for possible future reference.
