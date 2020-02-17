[![CircleCI](https://circleci.com/gh/forcedotcom/lightning-inspector.svg?style=svg)](https://circleci.com/gh/forcedotcom/lightning-inspector)
[![codecov](https://codecov.io/gh/forcedotcom/lightning-inspector/branch/master/graph/badge.svg)](https://codecov.io/gh/forcedotcom/lightning-inspector)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents** _generated with [DocToc](https://github.com/thlorenz/doctoc)_

-   [The Lightning Inspector](#the-lightning-inspector)
    -   [What is the Inspector](#what-is-the-inspector)
    -   [Installs and Set-up](#installs-and-set-up)
    -   [Running the Inspector](#running-the-inspector)
    -   [How to Use](#how-to-use)
    -   [PR Requirements and Testing Specifics](#PR-requirements-and-testing-specifics)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# The Lightning Inspector

## What is the Inspector?

The Lightning Inspector allows users to view and navigate the component tree, inspect attributes of components, and investigate the performance of component life cycles.

The Lightning Inspector lives in the aura public open source repo so it must be Aura specific; no Salesforce-specific entries. To allow you to also debug Salesforce-specific features we've added the Sfdc Inspector extension to the Lightning Inspector. It adds panels for Salesforce-specific features such as Aura Data Service (ADS and RLB tabs). You do not need to install the Sfdc Inspector but it's suggested.

## Installs and Set-up

1. Download or clone the Lightning Inspector code from Github and unzip the file.
2. Set up the Environment

```sh
  1. nvm install --lts
  2. npm install yarn -g
```

3. Set up

```sh
  yarn install
```

4. Development

```sh
  yarn watch
```

## Running the Inspector

1. Open up a browser like Google Chrome and type in chrome://extensions/
2. Click the Developer Mode checkbox in the top right
3. Click the "Load unpacked Extensions" button on the left
4. Select the directory for the aura-inspector
5. On a website you wish to use the inspector, right click on page and click on 'inspect' (ctrl/cmd + option + i).
6. From there, navigate on the top bar with tabs to access the Lightning Inspector tool

## How to Use

The google sites page and public documentation are still great resources.

https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/inspector_use.htm

## PR Requirements and Testing Specifics

1. When making changes to the Lightning Inspector code, there are a set of requirements that must pass before sending a PR.
2. First, fork the repository on Github.
3. If you wrote a unit test for the changes, your test and the current unit tests in the code base should all pass. You can do this by running yarn test on the terminal.
4. The inspector should build without any errors. You can do this by running ‘yarn build’ on the terminal.
5. The inspector should also pass with manual testing.
    1. Go to the chrome extension page, chrome://extensions/, and press the reload button for the Lightning Inspector extension.
    2. The inspector should work with a complex application like the Lightning Experience, Lightning Out, and non aura pages should still show a message. Go through all the tabs under the Lightning Inspector, and if you see an error, verify against master. If there is still an error, file an issue to the repo and you may proceed with your PR.
    3. Test the inspection panel on the elements detail section and make sure there are no errors that occur.
6. Lastly, when all the previous steps pass, make sure the code passes with Circle CI when you push to Github. If the build fails, you should debug the error, and push the code again to see if it builds successfully.
7. Code coverage must be increased or stay the same.
8. Please add Kris Gray as the reviewer for the PR
