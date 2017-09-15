# Octane
Octane is a simple file upload portal built using the MEAN stack. There are a
couple of steps you'll need to take before you can run it, even in a
development environment. It uses some local versions of npm modules, which
complicates the process a bit. I've outlined how to set that up in a different
document. Before that though, what you'll want to do is run `$ npm install` in
both the top level directory, as well as in the `/public` directory. Notice how
both folders contain a `package.json` file. 

Once you've ran both those commands, follow the instructions on how to set up 
the local modules and come back here. 

At this point you should be able to run `$ npm start` from the top level
directory to get the application going. This triggers the 'start' found in the
`package.json` file. No need to worry about restarting the server manually
either. This should be taken care of by either [*nodemon*] (http://nodemon.io/)
or [*forever*](https://github.com/foreverjs/forever), depending on whether it's in
development or production. 

If you're going to run the application in a production environment, use
`NODE_ENV=production npm start` instead. This will hide some stack traces
from the user. You can change the port number the application runs on in the
 `./bin/www` file.

~~As of right now this application relies on [MongoDB](https://www.mongodb.com/)
as a database. To get the databse up and running what you'll need to do is 
first 
[install MongoDB](https://docs.mongodb.com/getting-started/shell/installation)
(it's as easy as `$ brew install mongodb` on OSX). After you've installed it 
you can start the server with `$ mongod`. From there you can run `$ mongo` 
and start playing with MongoDB within the CLI if you so desire. For instance, 
you can check any users that have been signed up on the site by simply using 
`$ db.users.find().pretty()`.~~

The application is using a Gluu OpenID Connect server I set up to do all the
authentication and authorization. The use of OpenID Connect in the application
complicates things. I have written a seperate document outlining what changes
were caused by the switch to OpenID Connect. 

On top of Bootstrap the app uses a framework called 
[FlatUI](http://designmodo.github.io/Flat-UI/). I'm using it with a CDN at 
the moment, more out of laziness than anything. If the CDN goes down, just 
download a copy from the link above and include that in the project.

#### Useful Notes
I'm keeping this section near the top in hopes that you read it before 
getting bored. In this section I'm going to leave some important things you 
should keep in mind when using/developing for the application. 

* Partially uploaded files are not removed from the `uploads/` folder
* Folders are not accepted into the file drop area
* Users are not kicked if they stay past the session cookie life - any files 
  uploaded during this period do NOT get stored by the back end
* You can change the allowed file types and queue length, more on that below


#### File Uploads
For the front end, a package called 
[*angular-file-upload*](https://github.com/nervgh/angular-file-upload) was 
used. It is with this package that files are put into a queue and 'staged' 
for uploading. When files are uploaded makes a POST request for each file in 
the queue, as opposed to a single request for the whole lot. This makes a 
difference in the back end, but more on that later. 

I'm going to drop a couple code snippits to for the module API as they 
weren't immediately clear to me when reading the documentation. 


##### FileUploader
You can initialize this in your Angular controller in the following way: 

```js
uploader = $scope.uploader = new FileUploader({/*Properties*/});
``

All the properties you can use can be found in the documentation. You can 
invoke the properies in your HTML in the following manner: `uploader.property`.
The one I want to focus on though is the 'url' one. In the PHP example from 
the documentation it is simple set as `url: upload.php`, but this approach 
doesn't work with a Node/Express backend. Instead, what I did is I set 
`url: '/upload'` and created make a route in Express that handled the POST 
requests being sent to `/upload`. The route that handles this is the 
`index.js` route. 


##### Multer
The middleware I have decided to use to handle the file uploads is 
[*Multer*](https://github.com/expressjs/multer). Right now I have Multer 
configured to store the uploaded files in `./uploads/<user email>`. The 
folders for each user are created during the registration process using 
[*fs-extra*](https://github.com/jprichardson/node-fs-extra). Multer is added 
as a middleware in the `/upload` route, as mentioned earlier and as shown 
below. 

```js
router.post('/upload', upload.single('file'), function(req, res){
  res.status(204).end(); 
});
```

Information about the files being uploaded can be accessed through the `req`, 
such as `req.file.size`. 


##### Customizing Settings
There are a couple things you can change in the upload settings. If you want 
to change the types of files that can be uploaded, that can be found in the 
`angularApp.js` file. There, within the file uploader filter (titled 
`fileWhitelist`), you can add/remove the types of files which are allowed to 
be uploaded. While you're there you can also change the number of files which 
can be added to the queue in one go. That's a simple change in the 
`queueLength` filter. 
