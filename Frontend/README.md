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
