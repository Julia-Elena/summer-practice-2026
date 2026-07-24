*** Settings ***
Library  Browser    enable_presenter_mode=True

Resource  ./variables.robot


*** Keywords ***

Load Project
    [Documentation]
    ...    Open a new Robot Framework Browser window and navigate to the project
    New Browser    headless=False     timeout=60s
    New Context    viewport={'width': 1280, 'height': 800}
    New Page       ${FRONTEND_URL}

Attempt Login
    [Documentation]
    ...    Attempt to login with given credentials
    [Arguments]
    ...    ${username}=${TEST_USER}    
    ...    ${password}=${TEST_PASSWORD}    
    ...    ${url}=${FRONTEND_URL}
    
    Go To    ${url}

    Wait For Elements State    span:has-text("Login")

    Type Text    input#username    ${username}
    Type Secret  input#password    $password

    Click    button:has-text("Login")
    
    Check Logged In

Check Logged In
    [Documentation]
    ...    Check that the user is logged in (sidebar menu options are visible)
    Wait For Elements State    span:has-text("Home")
    Wait For Elements State    span:has-text("Dashboard")
    Wait For Elements State    span:has-text("Devices")

Load Project and Login
    [Documentation]
    ...    Start a browser session and login with the default user ${TEST_USER}
    Load Project
    Attempt Login

Go To Page
    [Documentation]
    ...    Navigate to a page available in the sidebar
    [Arguments]
    ...    ${page}
    
    Click    span:has-text("${page}")

Add New Device
    [Documentation]
    ...    Add a new device (must already be on the Devices page)
    [Arguments]
    ...    ${name}
    ...    ${serial_number}
    ...    ${device_type}
    ...    ${hardware_type}
    ...    ${site}
    ...    ${group}
    ...    ${owner}
    ...    ${ip_address}
    ...    ${port}
    ...    ${connectivity_type}
    
    Wait For Elements State    "Add New Device"

    Fill Text    ((//form)[1]//input)[1]    ${name}
    Fill Text    ((//form)[1]//input)[2]    ${serial_number}
    Fill Text    ((//form)[1]//input)[3]    ${device_type}
    Fill Text    ((//form)[1]//input)[4]    ${hardware_type}
    Fill Text    ((//form)[1]//input)[5]    ${site}
    Fill Text    ((//form)[1]//input)[6]    ${group}
    Fill Text    ((//form)[1]//input)[7]    ${owner}
    Fill Text    ((//form)[1]//input)[8]    ${ip_address}
    Fill Text    ((//form)[1]//input)[9]    ${port}
    Fill Text    ((//form)[1]//input)[10]   ${connectivity_type}

    Click    button:has-text("Submit")

    Wait For Elements State    "Device added successfully!"

Check Device Info
    [Documentation]
    ...    Check device information for given name in the devices table
    [Arguments]
    ...    ${name}
    ...    ${serial_number}
    ...    ${device_type}
    ...    ${hardware_type}
    ...    ${site}
    ...    ${group}
    ...    ${owner}
    ...    ${ip_address}
    ...    ${port}
    ...    ${connectivity_type}
    
    @{expected_values}    Create List    ${name}    ${serial_number}    ${device_type}    ${hardware_type}    ${site}    ${group}    ${owner}    ${ip_address}    ${port}    ${connectivity_type}

    ${rows}=    Get Elements    css=table.MuiTable-root tbody > tr

    ${row_found}=    Set Variable    ${False}

    FOR    ${row}    IN    @{rows}
        ${columns}=    Get Elements    ${row} >> css=td
        ${col_name}=   Get Text        ${columns}[0]

        Log    ${col_name}

        IF    '${col_name}' == '${name}'
            ${row_found}=    Set Variable    ${True}
            FOR    ${i}    IN RANGE    0    5
                ${table_index}=    Evaluate                    ${i} + 1
                ${text}=           Get Text                    ${columns}[${table_index}]
                Should Be Equal    ${expected_values}[${i}]    ${text}
            END
        END
    END

    IF    not ${row_found}
        Fail    Row with name '${name}' not found
    END

Remove All Devices
    [Documentation]
    ...    Removes all devices

    ${rows}=  Get Element Count    css=table.MuiTable-root tbody > tr

    WHILE    ${rows} > 0
        ${rows}=       Evaluate        ${rows} - 1
        
        # Click the button in the last column
        ${button}=    Get Element    css=table.MuiTable-root tbody > tr:last-child >> td:last-child >> button
        Click         ${button}
        Click         li:has-text("Remove")
    END

Click Device Option
    [Documentation]
    ...    Clicks the action button on the row where the device name matches.
    [Arguments]
    ...    ${name}
    ...    ${option}

    ${rows}=    Get Elements    css=table.MuiTable-root tbody > tr
    ${row_found}=    Set Variable    ${False}

    FOR    ${row}    IN    @{rows}
        ${columns}=    Get Elements    ${row} >> css=td
        ${col_name}=   Get Text        ${columns}[0]

        IF    '${col_name}' == '${name}'
            # Click the button in the last column
            ${button}=     Get Element    ${columns}[-1] >> css=button
            Click          ${button}
            Click          "${option}"
            ${row_found}=  Set Variable   ${True}
            Exit For Loop
        END
    END

    IF    not ${row_found}
        Fail    Row with name '${name}' not found
    END

Click Device Option by Index
    [Documentation]
    ...    Clicks the action button on the row where the device name matches.
    [Arguments]
    ...    ${index}
    ...    ${option}

    ${row}=     Get Element    css=table.MuiTable-root tbody > tr:nth-child(${index})
    ${button}=  Get Element    ${row} >> css=td:last-child > button
    Click       ${button}
    Click       li:has-text("${option}")


Edit Device
    [Documentation]
    ...    Edit a given device details
    [Arguments]
    ...    ${name}
    ...    ${newName}=${EMPTY}
    
    Click Device Option    ${name}    Edit

    IF    "${newName}" != "${EMPTY}"
        Fill Text    xpath=//div[contains(@class, 'MuiFormControl-root')][.//*[text()='Device Name']]//input    ${newName}
    ELSE
        Click    button:has-text("Cancel")
    END

    Click    button:has-text("Submit")

Remove Device
    [Documentation]
    ...    Remove a given device from the devices table
    [Arguments]
    ...    ${name}

    Click Device Option    ${name}    Remove

    Wait For Elements State    text=Confirm Device Removal
    Click    button:has-text("Remove")