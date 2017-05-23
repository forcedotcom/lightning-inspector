<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [The Lightning Inspector](#the-lightning-inspector)
  - [Key Differences from the Aura Inspector](#key-differences-from-the-aura-inspector)
  - [Updating the Lightning Inspector for the next version](#updating-the-lightning-inspector-for-the-next-version)
    - [Update Repository](#update-repository)
    - [Update Google Chrome Dev Extension](#update-google-chrome-dev-extension)

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


## Contribute
Clone source code from this repo.

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