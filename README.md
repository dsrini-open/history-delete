# Delete History Web-extension

[![Build Status](https://travis-ci.org/dsrini-open/history-delete.svg?branch=master)](https://travis-ci.org/dsrini-open/history-delete)
[![codecov](https://codecov.io/gh/dsrini-open/history-delete/branch/master/graph/badge.svg)](https://codecov.io/gh/dsrini-open/history-delete)
[![Depfu](https://badges.depfu.com/badges/f0c225a7204b4fe4716cee19f4817062/overview.svg)](https://depfu.com/github/dsrini-open/history-delete?project_id=10784)
[![Known Vulnerabilities](https://snyk.io/test/github/dsrini-open/history-delete/badge.svg?targetFile=package.json)](https://snyk.io/test/github/dsrini-open/history-delete?targetFile=package.json)
![GitHub](https://img.shields.io/github/license/dsrini-open/history-delete)

Browser extension to remove history based on websites. Web-sites could be configured as black-list or white-list and removed with options.

# Browsers
[Mozilla web-extension] ![Mozilla Add-on](https://img.shields.io/amo/users/delete-history)

Opera web-extension (pending, submitted)

Chrome web-extension (pending, works)

Any other Browser please submit a PR to go through the add-on process.

## Options
* Configure a website to either a black-list or a white-list
* Enable white-listing or black-listing of websites
* Enable removing histories for current website
* Enable black-listed website history to be removed when closing a window.
* Enable white-listed website history to be removed based on an interval
* Configure interval for periodic removal (1-24 hours)

## Verisons
* 1.1 First implementation version
  1. Includes Configuring websites as black-list and white-list
  2. Includes enabling white-list / black-list removal
  3. Includes configurable removal of black-listed website on window close
* 2.0 Second version
  1. Includes removal of white-listed websites based on interval period (1-24 hours)
  2. Updated header on the settings page
  2. Updated dependencies.
* 2.1 Version
  1. Fix to run the initial alarm by alarm interval config.
  2. Fix to clear the entire history when no whitelist item present.

[Mozilla web-extension]: https://addons.mozilla.org/en-US/firefox/addon/delete-history/
