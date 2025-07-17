from mongoengine.errors import NotUniqueError # type: ignore
from Application.database.models import User

def insert_user(body):
    try:
        return User(**body).save()
    except NotUniqueError as e:
        print(e, "insert_user", body)
        return {'message': "User Already Exists"}
    except Exception as e:
        print(e, "insert_user", body)
        return {'error': True, 'message': "Exception when trying to insert user"}