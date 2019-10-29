from flask import Flask, jsonify, request
from sqlalchemy.exc import IntegrityError
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
import simplejson as json
import time
import os
from pymemcache.client.base import Client
from telnetlib import Telnet


#initialise flask application
app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app)

#adding sqlite database
project_dir = os.path.dirname(os.path.abspath(__file__))
#print("path:",project_dir)
database_file = "sqlite:///{}".format(os.path.join(project_dir, "tenantbase.db"))
app.config["SQLALCHEMY_DATABASE_URI"] = database_file
app.config['SECRET_KEY'] = 'Thisissupposedtobesecret!'

#initialise connection to database
db = SQLAlchemy(app)

c = Client(('localhost',11211))

#Creating model keyvalue_Storage that holds key and value.
class keyvalue_Storage(db.Model):
    __tablename__ = 'keyvalue_Storage'
    key = db.Column(db.String(80), unique=True, nullable=False, primary_key=True)
    value = db.Column(db.String(200))


@app.route('/set', methods=["GET"])
@cross_origin(origin='*')
def set():
    try:
        keyvalue = request.args.to_dict()

        # Inserting data into memcache
        c.set(keyvalue['key'], keyvalue['value'])
        #value = c.get(keyvalue['key'])

        # Inserting Data into Database
        record = keyvalue_Storage(key=keyvalue['key'], value=keyvalue['value'])

        db.session.add(record)
        db.session.commit()

    except Exception as e:
        print("exception",e)
        #return e

    return 'Data Inserted';

#Shows all the existing records
@app.route('/show', methods=["POST"])
def show():
    record = keyvalue_Storage.query.all()
    #print("record")
    all={}
    for ele in record:
        all[ele.key]=ele.value
    return all


#Deletes records
@app.route("/delete", methods=["POST"])
def delete():
    #print("in delete")
    _key = request.args.to_dict()
    # Check for the value in memcache
    obj = c.get(_key['key'])

    # If the value is in memcache, remove 
    try:
        if obj != None:
            c.delete(_key['key'])
    except Exception as e:
        return 'Status Code: 204. No Content'

    # By default, check the value in database, if present, delete the value
    try:
        record = keyvalue_Storage.query.filter_by(key=_key['key']).first()
        db.session.delete(record)
        db.session.commit()
    except Exception as e:
        return 'Status Code: 204. No Content'

    return 'Status Code: 200. OK'


#memcache
@app.route("/mem", methods=["GET"])
def getMemCache():
    host = "localhost"
    port = 11211

    #establish telnet connection
    try:
        t = Telnet(host, str(port))
    except Exception as e:
        print("Connection cannot be established", e)
        traceback.print_exc()
    #print("You are connected")

    t.write("stats cachedump 1 0\n".encode("ascii"))
    time.sleep(0.2)
    stats = t.read_very_eager()
    stats = stats.split("\r\n".encode("ascii"))
    #print(stats)

    # remove "" from the end so we can process without a special case
    del stats[-1]
    # remove "END" from the end so we can process without a special case
    del stats[-1]

    new_stats = {}
    count=0;
    for stat in stats:
        s = stat.split()
        new_stats[s[1]]=count
        count=count+1
    #print(new_stats)
    return new_stats


#Clear memcache
@app.route("/mem/flush", methods=["POST"])
def flush_memcache():
    host = "localhost"
    port = 11211
    #establish telnet connection
    try:
        t = Telnet(host, str(port))
    except Exception as e:
        print("Connection cannot be established", e)
        traceback.print_exc()

    #print("You are connected")
    t.write("flush_all\n".encode("ascii"))
    time.sleep(0.2)
    return 'Data Wiped in MemCache'


#Get the value
@app.route("/get", methods=["GET"])
def get():
    #print("get entered")
    valueInMemcache=""
    keyvalue = request.args.to_dict();

    #Check the key in memcache
    obj = c.get(keyvalue['key'])
    #print("found obj?",obj)

    # Get the data from the db and set in memcache
    if obj == None:
        obj = keyvalue_Storage.query.filter_by(key=keyvalue['key']).first()
        #print("obj",obj)
        c.set(obj.key, obj.value)

    #Check the value in memcache and return
    valueInMemcache = c.get(keyvalue['key'])

    return valueInMemcache;

if __name__ == "__main__":
    app.run(debug=True)
