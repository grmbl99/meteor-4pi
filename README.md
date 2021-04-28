# settings.json

- copy the `settings-example.json` to `settings.json`
- fill in your own ADSToken (do ***NOT*** put this file in version control)
- set `useTestData` to `true`, to run using test-data (without connecting to an Azure Devops server)

## development

- meteor run --settings settings.json

## docker production

- the `startup.sh` script uses the content of `settings.json` to set the `METEOR_SETTINGS` environment variable in the docker image
- just build and run using docker-compose
  - docker-compose build
  - docker-compose up
