# how to run

- Copy `settings-example.json` to `settings.json`
- Fill in your own ADSToken
- Set `useTestData` to `true`, to run using test-data (without connecting to an Azure Devops server)
- Copy `private\*-example.json` to `private\*.json`
- Do ***NOT*** put these files in version control !

## development

- `meteor run --settings settings.json`
- The development server listens on `http://localhost:3000/`

## production (docker)

- The `startup.sh` script uses the content of `settings.json` to set the `METEOR_SETTINGS` environment variable in the docker image
- Just build and run using docker-compose
  - `docker-compose build`
    - The build step is memory intensive: increase the max memory for docker to 4GB
  - `docker-compose up`
- The docker image listens on `http://localhost/`
