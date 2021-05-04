# Meteor 4PI viewer

This application is build using the **Meteor** framework. To install this framework, follow the installation instructions on [meteor.com](https://www.meteor.com/developers/install)

After installation, `git clone` this repository and follow the instructions below

## Configuration

Take the following steps to configure the application for your specific Azure DevOps instance:

- Copy `settings-example.json` to `settings.json`
  - Fill in your own ADS-Token, ADS-Project and ADS-Url
  - Set `useTestData` to `true`, to run using test-data (without connecting to an Azure DevOps server)

- Do ***NOT*** put this file in version control !

  Note that some additional ADS instance specific settings are located in `imports\api\constants.js`

- Run `meteor npm install` to install the dependencies from `package.json`

## Development

- `meteor run --settings settings.json`
- The development server listens on `http://localhost:3000/`

## Production (Docker)

- The dockerized application takes its configuration from the `METEOR_SETTINGS` environment variable (as defined in `docker-compose.yml`).
  - On Linux/MacOS:
    - Use the `setenv.sh` script to set the environment variable with the contents of `settings.json`
      - `source startup.sh`
  - On Windows:
    - Remove all line-breaks and whitespace from `settings.json`
    - Use the `setenv.cmd` script to set the environment variable with the contents of `settings.json`
      - `setenv.cmd`

- Just build and run using docker-compose
  - `docker-compose build`
    - The build step is memory intensive: increase the max memory for docker to 4GB
  - `docker-compose up`
- The docker image listens on `http://localhost/`
