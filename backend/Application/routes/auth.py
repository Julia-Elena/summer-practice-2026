import configparser
from functools import wraps

from bcrypt import hashpw # type: ignore
from Application import app
from flask import jsonify, make_response, request # type: ignore
import jwt # type: ignore

from Application.database.models import User
from datetime import datetime, timedelta
from flask_jwt_extended import JWTManager, create_access_token # type: ignore
import bcrypt # type: ignore
from Application.scripts.utils import insert_user

secret = configparser.ConfigParser()
secret.read('Application/scripts/config.ini') 

app.config['JWT_SECRET_KEY'] = secret['db']['SECRET_KEY']
jwt = JWTManager(app)

# decorator for verifying the JWT

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # jwt is passed in the request header
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        # return 401 if token is not passed
        if not token:
            return jsonify({'message' : 'Token is missing !!'}), 401
  
        try:
            
            # decoding the payload to fetch the stored details
            data = jwt.decode(token, app.config['SECRET_KEY'],algorithms=["HS256", "RS256"], options={"verify_signature": False})
            if 'public_id' in data:
                current_user = User.objects.get(public_id = data['public_id'])
            else:
                current_user = User.objects.get(username = data['unique_name'])
         
        except Exception as e:
            print(e)
            return jsonify({
                'message' : 'Token is invalid !!'
            }), 401
        # returns the current logged in users contex to the routes
        return  f(current_user, *args, **kwargs)
  
    return decorated


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.objects(username=username).first()
    if user and bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
        access_token = create_access_token(identity=str(username))
        return make_response(jsonify({'access_token' : access_token,"message": "Login Successfull","loggedinUser": username, "role": user["role"]}), 200)

    else:
        return jsonify({'message': 'Invalid credentials'}), 401
    

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get("role")
    group = data.get("group")
    site = data.get("site")
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user = {"username": username, "password": hashed_password, "role": role, "group": group, "site": site}
    action = insert_user(user)
    if 'error' not in action:
        return {"message": "User succesfully added"}
    return action