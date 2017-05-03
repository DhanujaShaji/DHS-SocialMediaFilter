# Frontend

## Overview

The frontend provides the user interface for the DHS agents. It allows DHS agents to submit Twitter accounts and review the data analysis results provided by our tool.

## Technology Details

- The frontend views are developed based on the Bootstrap Web Framework with JavaScript. 
- The ICOs are used from Font Awesome Library. 
- The backend who controls the workflow and provides the data is based on the Node.JS Framework. 
- The webpage is wroten in Jade language and rendered to the HTML by backend.

## Features

- Submit Twitter account
- Display Statistic Data Analysis Report
- Provide Anonymized Twitter Data
- Uncover Original Twitter Data
- Make an Audit Decision

## Repository Architecture

- public: Resource folder that provides to the public, which includes the fronts, images, javascripts and css stylesheets.
- routes: The backend router code which controls the workflow of our tool and provides data to the frontend.
- views: The frontend which include the web views written in Jade. They will be rendered to HTML web pages by backend.
- app.js: The main entry of this web application.

# Backend

## Major Work

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

## File structure

 - routes/index.js, nearly all of the works mentioned are finished within this file.
 - app.js, setting the environment and global variables of this application
 - db.js, interface used to connect to database.
 - Query, sql statement used to create tables of database.
 - Database_scheme.png, the database scheme.
 - package.json, meta data and dependencies of this application.
