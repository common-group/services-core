#!/usr/bin/env bash

echo "Entering catarse.js folder"
cd catarse.js

echo 'Installing catarse.js dev dependencies'
yarn install --production=false

if [ "$NODE_ENV" = "production" ] || [ "$RAILS_ENV" = "sandbox" ] || [ "$RAILS_ENV" = "production" ]; then
  echo 'Building catarse.js for production/sandbox'
  yarn run build:prod
else
  echo 'Building catarse.js for development/test'
  yarn run build

  echo 'Linking catarse.js folder as local depedency'
  yarn link
  cd ..
  yarn link catarse.js

  echo '#########################################################################################################'
  echo '##                                                                                                     ##'
  echo '##                                                                                                     ##'
  echo '## Now you can go to catarse.js directory and run `yarn start` to rebuild package on every file change ##'
  echo '##                                                                                                     ##'
  echo '##                                                                                                     ##'
  echo '#########################################################################################################'
fi
