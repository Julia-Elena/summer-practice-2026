from Application import app
from flask import jsonify, request # type: ignore
from ..database.models import Device, Schedule
from bson.objectid import ObjectId
import datetime
from mongoengine import Q

KWH_CONSUMPTION=0.3

@app.route("/consumption/weekly", methods=["GET"])
def get_consumption():
    try:
        devices = Device.objects()
        date_today = datetime.datetime.now()
        start_of_week = date_today - datetime.timedelta(days=date_today.weekday())
        end_of_week = start_of_week + datetime.timedelta(days=6)
        
        end_of_week_str = end_of_week.strftime("%Y-%m-%d")
        start_of_week_str = start_of_week.strftime("%Y-%m-%d")

        filtered_schedules = Schedule.objects(
            Q(deviceId__in=[device.id for device in devices]) &
            Q(active=True) &
            (
                Q(startDate__lte=start_of_week_str) | 
                (Q(endDate__exists=True) & Q(endDate__gte=end_of_week_str))
            )
        )

        stats=[]
        

        for i in range(7):
            
            day = start_of_week + datetime.timedelta(days=i)
    
            usage = 0
            saved=0
            for schedule in filtered_schedules:
                
                t_off = datetime.datetime.strptime(schedule.powerOffTime, "%H:%M")
                t_on = datetime.datetime.strptime(schedule.powerOnTime, "%H:%M")
                
                # If a schedule crosses over midnight (e.g., On 22:00, Off 06:00), adjust t_off to the next day
                if t_on > t_off:
                    t_off += datetime.timedelta(days=1)

                if schedule.recurrence == 'everyday':
                    usage += (t_off - t_on).total_seconds() / 3600 * KWH_CONSUMPTION
                    saved += (24 - (t_off - t_on).total_seconds() / 3600) *  KWH_CONSUMPTION
                elif schedule.recurrence == 'workdays' and day.weekday() < 5:
                    usage += (t_off - t_on).total_seconds() / 3600 * KWH_CONSUMPTION
                    saved += (24 - (t_off - t_on).total_seconds() / 3600) * KWH_CONSUMPTION
                    
                elif schedule.recurrence == 'weekends' and day.weekday() >= 5:
                    usage += (t_off - t_on).total_seconds() / 3600 * KWH_CONSUMPTION
                    saved += (24 - (t_off - t_on).total_seconds() / 3600) * KWH_CONSUMPTION

            stats.append({
                "day": day.strftime("%A"),
                "usage": usage,
                "saved": saved
            })
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500