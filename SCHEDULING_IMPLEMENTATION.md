# Power Scheduling Implementation

This document outlines the power scheduling feature implementation.

## Overview

Power scheduling allows users to set times and dates for devices to turn on and off through the interface. Preferences are saved in a new MongoDB collection called "schedules" and linked with device IDs.

## Database Schema

### Schedule Collection

A new MongoDB collection `schedules` with the following structure:

```python
class Schedule(Document):
    deviceId: ObjectId          # Reference to the Device
    deviceName: String          # Device name for quick access
    startDate: String           # Format: YYYY-MM-DD
    endDate: String             # Format: YYYY-MM-DD (optional)
    powerOnTime: String         # Format: HH:MM
    powerOffTime: String        # Format: HH:MM
    recurrence: String          # One of: 'workdays', 'everyday', 'weekends'
    active: Boolean             # Schedule is active/inactive
    createdAt: DateTime         # Timestamp of creation
    updatedAt: DateTime         # Timestamp of last update
```

## API Endpoints

### 1. Create Schedule

**Endpoint:** `POST /api/schedule`
**Request Body:**

```json
{
	"deviceId": "device_object_id",
	"startDate": "2026-07-21",
	"endDate": "2026-12-31", // optional
	"powerOffTime": "23:00",
	"powerOnTime": "07:00",
	"recurrence": "everyday" // 'workdays', 'everyday', 'weekends'
}
```

**Response:** 201 Created

```json
{
  "message": "Schedule created successfully",
  "scheduleId": "schedule_object_id",
  "schedule": { ...schedule data... }
}
```

### 2. Update Schedule

**Endpoint:** `PUT /api/schedule/<schedule_id>`
**Request Body:** Any schedule field can be updated
**Response:** 200 OK

### 3. Delete Schedule

**Endpoint:** `DELETE /api/schedule/<schedule_id>`
**Response:** 200 OK

### 4. Get Device Schedules

**Endpoint:** `GET /api/schedules/device/<device_id>`
**Response:** 200 OK - Array of schedules for the device

### 5. Get All Schedules

**Endpoint:** `GET /api/schedules`
**Response:** 200 OK - Array of all schedules

### 6. Get Single Schedule

**Endpoint:** `GET /api/schedule/<schedule_id>`
**Response:** 200 OK - Schedule object

## File Changes

### Backend Files

1. **`backend/Application/database/models.py`**
   - Added `datetime` import
   - Added `Schedule` model with all required fields
   - Configured collection name as "schedules"

2. **`backend/Application/routes/scheduler.py`**
   - Implemented all 6 API endpoints
   - Added validation for:
     - Required fields (deviceId, startDate, powerOnTime, powerOffTime, recurrence)
     - Time format (HH:MM)
     - Date format (YYYY-MM-DD)
     - Valid recurrence values
     - Device existence
   - Added helper functions:
     - `_is_valid_time_format()` - Validates HH:MM format
     - `_is_valid_date_format()` - Validates YYYY-MM-DD format
     - `_format_schedule()` - Formats schedule for JSON response

3. **`backend/Application/__init__.py`**
   - Added import for scheduler routes: `from .routes.scheduler import app`

## Frontend Integration

The existing `ScheduleDialog.jsx` component is already set up to use this API:

- Sends POST request to `/api/schedule` with the correct payload structure
- Includes all necessary fields: deviceId, startDate, endDate, powerOnTime, powerOffTime, recurrence

## Recurrence Options

The system supports three recurrence patterns:

1. **'everyday'** - Schedule applies every day
2. **'workdays'** - Schedule applies Monday through Friday
3. **'weekends'** - Schedule applies Saturday and Sunday

## Code Structure

The implementation maintains the same code structure as existing files:

- **Models:** Located in `database/models.py` following MongoEngine patterns
- **Routes:** Located in `routes/scheduler.py` following Flask route patterns
- **Error Handling:** Consistent JSON error responses with appropriate HTTP status codes
- **Validation:** Comprehensive input validation with clear error messages

## Next Steps (Optional Enhancements)

1. **Scheduler Execution:** Integrate with APScheduler to automatically execute schedules based on dates and times
2. **Schedule History:** Track when schedules were executed
3. **Bulk Operations:** Add endpoints to create/update/delete multiple schedules at once
4. **Schedule Conflicts:** Add validation to prevent conflicting schedules
5. **Time Zone Support:** Add timezone handling for international users
