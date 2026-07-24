*** Settings ***
Resource  ../resources/keywords.robot
Resource  ../resources/variables.robot

Suite Setup    Load Project and Login

Test Setup    Run Keyword    Go To Page    Devices

*** Test Cases ***
# Add New Device:
#     Add New Device     AirScale BTS 1    TIM Test Lab    09:30    23:00    2    20
#     Check Device Info  AirScale BTS 1    TIM Test Lab    09:30    23:00    2    20

Edit Device:
    Click Device Option    Main Server AC    Edit
    Edit Device    Main Server AC    Main Server AC Edited

Remove Device:
    Remove Device    test