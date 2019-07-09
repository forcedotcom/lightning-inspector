# Using CircleCI to build on github.com

Please note, you cannot use CircleCI to build in git.soma because of access restrictions.

## What is CircleCI

Publicly supported Kubernetes services build management system. Not a Salesforce product. Salesforce standard for off-core products. Feel free to use what suits you though if you prefer Travis or the other build systems out there.

## Setup

Follow these steps

1. [Signup for CircleCI](https://circleci.com/signup/) if you haven't already.
2. Associate your project with CircleCI.
3. Add the .circleci/config.yml file to your project.
4. Configure the config.yml file to do what your looking for.

## Report Build status on Readme.md

Going to your settings page in CircleCI for your project will give you the code to add to the Readme which reports the status of the Build.

For example, I would go to this link for Carbon \
https://circleci.com/gh/forcedotcom/carbon/edit#badges

Copy the code for the Badge, and paste it at the top of your readme.
