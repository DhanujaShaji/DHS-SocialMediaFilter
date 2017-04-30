Yuru liu yurul@andrew.cmu.edu;

This is a course project for CMU course Engineering privacy in software.

This part of code is a mix of Frontend work with backend. So far, what I have finished was to create the database and deploy it in Google Cloud platform. The database scheme was created by using SQL sentence in file Query(Backend/Query) as shown in picture Database_scheme.png. In order to connect to datase which was locate in remote server, I created the file db.js(Backend/Db.js) to deal with the connection problem and the file server as a interface between the backend and the fronend. For deal with the request from frontend, I create file index.js(Backend/route/index.js). Currently, the data analysis and scraping part can receive http requests sent by backend for original tweet or anonymized tweet, however there is a limit for the amount of tweets that can be read from the API. 

As of 4/30, most of the backend has been integrated. The statistics page still needs to be done from the analysis end, so placeholders are there for now. The majority of the backend functionality is now integrated with the front end. 
