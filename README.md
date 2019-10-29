This projects implements subset of memcache protocol with flask and react.
Evection algorithm used is Last Recently Used.
Every time a set or get is performed on Sqlite Database memcache updates with that record placing
it on the top. On deleting a record in database, it is deleted from memcache(if the record is present).    

Following are the steps to run this project in mac.

## Requirements

- Python3
- Visual Studio
- npm
- Home brew

## Open terminal 
```
$ brew install telnet

$ memcached -l 127.0.0.1 -p 12345 -m 64 -vv
```

## Open another Terminal and browse to this project folder
If Pip is absent: 
```
$ sudo easy_install pip
```

Create and Activate Virtual Environment

```
$ sudo pip install virtualenv

$ virtualenv yourenvname -p python3.7

$ source bin/activate
```


Install dependencies 
```
$ Pip install Flask
$ Pip install Sqlalchemy
$ Pip install flask_sqlalchemy
$ pip install flask_cors
$ pip install simplejson
$ pip install pymemcache
```

Create Database and run python code
```
$ python
  >>from main.py import db
  >>db.create_all()
  >> quit()

  
$ python main.py
```
Server starts running at http://127.0.0.1:5000/

## Open Visual Studio and browse to this folder
```
$npm install
$npm start
```

Opens react in your default web browser at http://localhost:8000/
