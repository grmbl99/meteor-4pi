#!/bin/bash
#
# this script sets the METEOR_SETTINGS environment variable with the content of settings.json
export METEOR_SETTINGS=$(<settings.json)