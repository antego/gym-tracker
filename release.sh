#!/bin/bash

npm run-script clean
npm run-script build
heroku container:push --app=gym-stats web
heroku container:release --app gym-stats web