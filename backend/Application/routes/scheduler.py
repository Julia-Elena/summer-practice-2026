from Application import app
from flask import jsonify, request
from ..database.models import Schedule, Device
from bson.objectid import ObjectId
from datetime import datetime


@app.route('/schedule', methods=['POST'])
def create_schedule():
    """Create or update a power schedule for a device"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['deviceId', 'startDate', 'powerOnTime', 'powerOffTime', 'recurrence']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate deviceId exists
        device_id = ObjectId(data['deviceId'])
        device = Device.objects(id=device_id).first()
        if not device:
            return jsonify({'error': 'Device not found'}), 404
        
        # Check if schedule already exists for this device
        existing_schedule = Schedule.objects(deviceId=device_id).first()
        if existing_schedule:
            # Update existing schedule
            existing_schedule.startDate = data['startDate']
            existing_schedule.endDate = data.get('endDate')
            existing_schedule.powerOnTime = data['powerOnTime']
            existing_schedule.powerOffTime = data['powerOffTime']
            existing_schedule.recurrence = data['recurrence']
            existing_schedule.updatedAt = datetime.now()
            existing_schedule.save()
            
            return jsonify({
                'message': 'Schedule updated successfully',
                'scheduleId': str(existing_schedule.id),
                'schedule': _format_schedule(existing_schedule)
            }), 200
        
        # Validate recurrence
        valid_recurrences = ['workdays', 'everyday', 'weekends']
        if data['recurrence'] not in valid_recurrences:
            return jsonify({'error': f'Invalid recurrence. Must be one of: {", ".join(valid_recurrences)}'}), 400
        
        # Validate time format (HH:MM)
        for time_field in ['powerOnTime', 'powerOffTime']:
            if not _is_valid_time_format(data[time_field]):
                return jsonify({'error': f'Invalid time format for {time_field}. Use HH:MM format'}), 400
        
        # Validate date format (YYYY-MM-DD)
        if not _is_valid_date_format(data['startDate']):
            return jsonify({'error': 'Invalid startDate format. Use YYYY-MM-DD format'}), 400
        
        if data.get('endDate') and not _is_valid_date_format(data['endDate']):
            return jsonify({'error': 'Invalid endDate format. Use YYYY-MM-DD format'}), 400
        
        # Create new schedule
        schedule = Schedule(
            deviceId=device_id,
            deviceName=device.deviceName,
            startDate=data['startDate'],
            endDate=data.get('endDate'),
            powerOnTime=data['powerOnTime'],
            powerOffTime=data['powerOffTime'],
            recurrence=data['recurrence'],
            active=True,
            updatedAt=datetime.now()
        )
        schedule.save()
        
        return jsonify({
            'message': 'Schedule created successfully',
            'scheduleId': str(schedule.id),
            'schedule': _format_schedule(schedule)
        }), 201
        
    except Exception as e:
        print(f"Error creating schedule: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/schedule/<string:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    """Update an existing schedule"""
    try:
        schedule = Schedule.objects(id=ObjectId(schedule_id)).first()
        if not schedule:
            return jsonify({'error': 'Schedule not found'}), 404
        
        data = request.get_json()
        
        # Validate and update fields
        if 'powerOnTime' in data:
            if not _is_valid_time_format(data['powerOnTime']):
                return jsonify({'error': 'Invalid powerOnTime format'}), 400
            schedule.powerOnTime = data['powerOnTime']
        
        if 'powerOffTime' in data:
            if not _is_valid_time_format(data['powerOffTime']):
                return jsonify({'error': 'Invalid powerOffTime format'}), 400
            schedule.powerOffTime = data['powerOffTime']
        
        if 'startDate' in data:
            if not _is_valid_date_format(data['startDate']):
                return jsonify({'error': 'Invalid startDate format'}), 400
            schedule.startDate = data['startDate']
        
        if 'endDate' in data:
            if data['endDate'] and not _is_valid_date_format(data['endDate']):
                return jsonify({'error': 'Invalid endDate format'}), 400
            schedule.endDate = data.get('endDate')
        
        if 'recurrence' in data:
            valid_recurrences = ['workdays', 'everyday', 'weekends']
            if data['recurrence'] not in valid_recurrences:
                return jsonify({'error': f'Invalid recurrence value'}), 400
            schedule.recurrence = data['recurrence']
        
        if 'active' in data:
            schedule.active = data['active']
        
        schedule.updatedAt = datetime.now()
        schedule.save()
        
        return jsonify({
            'message': 'Schedule updated successfully',
            'schedule': _format_schedule(schedule)
        }), 200
        
    except Exception as e:
        print(f"Error updating schedule: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/schedule/<string:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    """Delete a schedule"""
    try:
        schedule = Schedule.objects(id=ObjectId(schedule_id)).first()
        if not schedule:
            return jsonify({'error': 'Schedule not found'}), 404
        
        schedule.delete()
        return jsonify({'message': 'Schedule deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting schedule: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/schedules/device/<string:device_id>', methods=['GET'])
def get_device_schedules(device_id):
    """Get all schedules for a specific device"""
    try:
        device_obj_id = ObjectId(device_id)
        schedules = Schedule.objects(deviceId=device_obj_id).to_json()
        return schedules, 200
        
    except Exception as e:
        print(f"Error fetching schedules: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/schedules', methods=['GET'])
def get_all_schedules():
    """Get all schedules"""
    try:
        schedules = Schedule.objects().to_json()
        return schedules, 200
        
    except Exception as e:
        print(f"Error fetching all schedules: {str(e)}")
        return jsonify({'error': str(e)}), 500


def _is_valid_time_format(time_str):
    """Validate time format HH:MM"""
    try:
        datetime.strptime(time_str, '%H:%M')
        return True
    except ValueError:
        return False


def _is_valid_date_format(date_str):
    """Validate date format YYYY-MM-DD"""
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False


def _format_schedule(schedule):
    """Format schedule document for JSON response"""
    return {
        'id': str(schedule.id),
        'deviceId': str(schedule.deviceId),
        'deviceName': schedule.deviceName,
        'startDate': schedule.startDate,
        'endDate': schedule.endDate,
        'powerOnTime': schedule.powerOnTime,
        'powerOffTime': schedule.powerOffTime,
        'recurrence': schedule.recurrence,
        'active': schedule.active,
        'createdAt': schedule.createdAt.isoformat() if schedule.createdAt else None,
        'updatedAt': schedule.updatedAt.isoformat() if schedule.updatedAt else None
    }
