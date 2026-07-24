*** Settings ***
Resource  ../resources/keywords.robot
Resource  ../resources/variables.robot

Test Setup    Load Project

*** Test Cases ***
Login with no credentials
    Attempt Invalid Login    ${EMPTY}    ${EMPTY}

Login with valid credentials
    Attempt Login

Login with invalid credentials
    Attempt Invalid Login    INVALID    INVALID

Login with valid user and invalid password
    Attempt Invalid Login    ${TEST_USER}    INVALID

Login with invalid user and valid password
    Attempt Invalid Login    INVALID    ${TEST_PASSWORD}


*** Keywords ***
Attempt Invalid Login 
    [Documentation]
    ...    Attempt to login with bad credentials, and expect error
    [Arguments]
    ...    ${username}
    ...    ${password}
    
    Run Keyword And Expect Error    *
    ...    Attempt Login    ${username}    ${password}
    
    Wait For Elements State    "Invalid credentials"