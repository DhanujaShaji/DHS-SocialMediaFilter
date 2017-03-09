Yuru liu yurul@andrew.cmu.edu;

This is a course project for CMU course Engineering privacy in software.

This part of code is a mix of Frontend work with backend. So far, what I have finished was to create the database and deploy it in Google Cloud platform. The database scheme was created by using SQL sentence in file Query as shown in picture Database_scheme.png. In order to connect to datase which was locate in remote server, I created the file db.js to deal with the connection problem and the file server as a interface between the backend and the fronend. For deal with the request from frontend, I create file index.js which is still in progress. Because the data anaysis part and the data scraping part are still in progress thus they cannot receive http request send by backend for original tweet or anonymized tweet, index.js cannot be finihsed right now.

After spring break, I will focus on to intregrate each part of the work into a whole system and connect each part together. 
