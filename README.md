[![CircleCI](https://circleci.com/gh/forcedotcom/lightning-inspector.svg?style=svg)](https://circleci.com/gh/forcedotcom/lightning-inspector)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [The Lightning Inspector](#the-lightning-inspector)
  - [How to run from Source](#how-to-run-from-source)
    - [Steps](#steps)
    - [Environment](#environment)
    - [Setup](#setup)
    - [Development](#development)
    - [Distribution](#distribution)
  - [How to Use](#how-to-use)
  - [Contribute](#contribute)
  - [Backlog](#backlog)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# The Lightning Inspector

## How to run from Source

The previous builds of the Lightning Inspector are pushed in the builds directory. To use a specific version, simply follow the steps below and when asked for the directory, point it at the version in the builds directory that you wish to use. 

**You can also use "latest" to always be on the latest built and pushed version of the inspector.**

### Steps ###
* Navigate to the page chrome://extensions
* Toggle the Developer mode in the top right corner
* Click Load Unpacked Extension...
* Select the [Lightning Inspector Directory]/builds/[version||latest]


### Environment
```sh
nvm install 5.0.0       # >= 5.0.0 is ok (don't install anything with sudo)
npm install yarn -g     # install yarn package manager
```

### Setup
```sh
yarn install            # install project dependencies (and submodules)
```
### Development
```sh
yarn watch              # watches for changes in submodules
```

- **Plugin**: Open load the unpacked extension and changes should be reflected once `yarn watch` is issued

### Distribution
```sh
yarn build              # should output crx, xpi, zip files
```

## How to Use ##
The google sites page and public documentation are still great resources.
https://sites.google.com/a/salesforce.com/user-interface/aura/aura-dev-tools



## Contribute
Fork the repo and send the pull request. 

Please add Kris Gray as the reviewer.


## Backlog

* Fix Slds being included in its entirety.
 - Pull in just the bits that we need.
* Convert the Component Tree to a React Component
 - I wanted to rewrite the tree anyway. 
 - This allows the UIPerf tool to leverage the Component Tree when they want.
* Convert more of the plugin to use Slds 
 - Fixes bugs in my css
 - Unifies styles across the app.


