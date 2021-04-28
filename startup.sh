#!/bin/bash
#
# this script sets the METEOR_SETTINGS environment variable in the docker production environment
export METEOR_SETTINGS=$(cat settings.json)