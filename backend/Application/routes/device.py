from Application import app
from flask import jsonify, request # type: ignore
from ..database.models import Device
from bson.objectid import ObjectId


@app.route('/devices', methods=['GET'])
def get_devices():
    try:
        devices = Device.objects().to_json()
        return devices, 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/device', methods=['POST'])
def add_device():
    try:
        device_data = request.get_json()
        new_device = Device(**device_data)
        new_device.save()
        return jsonify({'message': 'Device added successfully'}), 201
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400
    

@app.route('/device/<string:device_id>', methods=['DELETE'])
def delete_device(device_id):
    try:
        object_id = ObjectId(device_id)
        device = Device.objects(id=object_id).first()
        if device:
            device.delete()
            return jsonify({'message': 'Device deleted successfully'}), 200
        else:
            return jsonify({'error': 'Device not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/device/<string:device_id>', methods=['PUT'])
def edit_device(device_id):
    try:
        object_id = ObjectId(device_id)
        device = Device.objects(id=object_id).first()
        if device:
            device_data = request.get_json()
            device_data.pop('_id', None)
            device.update(**device_data)
            return jsonify({'message': 'Device updated successfully'}), 200
        else:
            return jsonify({'error': 'Device not found'}), 404
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500