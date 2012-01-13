# A shared white board

### About

This is a express.js app with socket.io plugin. 

Currently, the server only acts as a message broadcaster, i.e. it receives a message from the client and sends it out to all other clients.

### Client API
The com.js library provides for an abstraction over the internal messaging API. 

It has one method 'sendDrawMsg' to send data from the client. To receive data you must implement matisse.onDrawEvent.

See the views/index.jade for example written in [http://jade-lang.com/](jade) templating engine.

See index.html in this directory for a vanilla html example.

### How to Run this app?
1) To run this application you need to install [http://nodejs.org](node.js) and 
   also install npm. 

2) Install Redis Server

>
>   a. for windows redis exe https://github.com/dmajkic/redis/downloads
>
>   b. for ubuntu use - sudo apt-get install redis-server
>
>

3) Install all node module dependencies for matisse using -

>
>   $npm install -d
>

3) Change the "localhost" to your local machine ip in public/javascripts/com.js.

>
> var socket = io.connect('http://localhost'); //change it to server ip or local ip for testing from other machines
>

3) Then you can run 

>
> $ node app.js
>

in the root folder.

Now you can open the http://localhost:8000/ to open the matisse home page.

