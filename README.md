# Smart Energy Saving

Welcome to Nokia Summer Practice 2026. This is the project starting point, from which you will start your work.

## Tech Stack

### Backend

- Python 3 ([download](https://www.python.org/downloads/)) ([docs](https://docs.python.org/3/))
- Flask ([docs](https://flask.palletsprojects.com/en/stable/))
- Mongo DB ([download](https://www.mongodb.com/try/download/community))

### Frontend

- Node.js - Javascript runtime ([download](https://nodejs.org/en/download))
- React - web framework ([learn](https://react.dev/learn)) ([docs](https://react.dev/reference/react))
- Vite - bundler and build system ([guide](https://vite.dev/guide/))
- Material UI - UI/UX framework ([docs](https://mui.com/material-ui/getting-started/))

### Tests

- Robot Framework ([docs](https://docs.robotframework.org/))
- RF Browser Library ([docs](https://robotframework-browser.org/))

## Get Started

### The Environment

You're encouraged to use the following tools:

- Visual Studio Code ([download](https://code.visualstudio.com/download))
- Robot Code extension ([for VS Code](https://marketplace.visualstudio.com/items?itemName=d-biehl.robotcode))
([for Jetbrains IDEs](https://plugins.jetbrains.com/plugin/26216-robotcode--robot-framework-support)) - this helps with running and debugging tests
- Thunder Client extension for VS Code ([link](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)) - this helps you to test backend endpoints easier
- Bash or other UNIX type shell (for Windows it's included in the Git package)

These are not mandatory, you can use other tools that you prefer.

### Prerequisites

First, ensure the following are installed on your computer. You only need to do this once.

- Install Git ([download for Windows](https://git-scm.com/install/windows)) <br/>
If you're on Linux, Git is most likely already installed. For Mac OS, install Xcode Command Line Tools to provide Git as well as other developer tools.
- Install Python 3.10 or newer ([download](https://www.python.org/downloads/))
- Install Node.js v22 or newer ([download](https://nodejs.org/en/download))
- Install Mongo DB Community server ([download](https://www.mongodb.com/try/download/community))

### Fork and clone the repo

First, create a fork of this repository into your GitHub account, by either clicking the `Fork` button at the top right corner of the page, or by using the following link:

[Create a fork](https://github.com/RaduTek/summer-practice-2026/fork)

Then, clone this repository using Git into your workspace folder of choice:

```sh
$ git clone https://github.com/[your username here]/summer-practice-2026
```

### Backend

Install backend dependencies (you only need to do this once):

```sh
$ cd backend
$ python -m venv venv
$ source venv/bin/activate # if on Windows: venv/Scripts/activate
$ pip install -r requirements.txt
```

If you're using PowerShell (the default on Windows), run this:

```ps
PS C:\summer-practice-2026\backend> .\venv\Scripts\activate.ps1
```

Start the backend:

```sh
$ flask run --debug

Default development user 'admin' created.
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
```

### Frontend

Install dependencies (you only need to do this once):

```sh
$ npm install
```

Start the frontend:

```sh
$ npm run dev

> frontend@0.0.0 dev
> vite


  VITE v5.2.7  ready in 484 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Tests

Install Robot Framework and Browser Library:

```sh
$ pip install robotframework robotframework-browser
$ rfbrowser init
```

This may take a while, as `rfbrowser init` installs a web browser version dedicated to automated testing. You need Node.js installed for this to work.

### Results

- The backend has started a server on [http://localhost:5000](http://localhost:5000).
- The frontend has started a server on [http://localhost:5173](http://localhost:5173). **Open this in your browser.**
- On application startup, **only if running in development mode** a test user `admin:testuser` will be created. Log in with username `admin` and password `testuser`. If the user already exists, it will not be overwritten.
