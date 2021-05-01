# Meteor 4PI viewer

## Configuration

Take the following steps to configure the application for your specific instance:

- Copy `settings-example.json` to `settings.json`
  - Fill in your own ADS-Token, ADS-Project and ADS-Url
  - Set `useTestData` to `true`, to run using test-data (without connecting to an Azure Devops server)
- Copy `private\*-example.json` to `private\*.json`

- Do ***NOT*** put these files in version control !

  Note that some additional ADS instance specific settings are located in `imports\api\constants.js`

- Run `meteor npm install` to install the dependencies from `package.json`
- Create a `public` directory with a symlink to `node_modules/font-awesome/fonts`
  - `mkdir public`
  - `cd public`
  - `ln -s ../node_modules/font-awesome/fonts .`

  On Windows you cannot create symlinks, so just copy the `fonts` directory

## Development

- `meteor run --settings settings.json`
- The development server listens on `http://localhost:3000/`

## Production (docker)

- The `startup.sh` script uses the content of `settings.json` to set the `METEOR_SETTINGS` environment variable in the docker image
- Just build and run using docker-compose
  - `docker-compose build`
    - The build step is memory intensive: increase the max memory for docker to 4GB
  - `docker-compose up`
- The docker image listens on `http://localhost/`
