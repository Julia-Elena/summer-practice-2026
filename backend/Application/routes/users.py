from Application import app
import configparser
import pymongo # type: ignore
from flask import jsonify
from ..database.models import User

# from backend.Application.routes.auth import token_required

secret = configparser.ConfigParser()
secret.read('Application/scripts/config.ini')
client = pymongo.MongoClient(secret['db']['MONGO_URL'])
mydb = client.energysaving


@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = User.objects().to_json()
        return users, 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500