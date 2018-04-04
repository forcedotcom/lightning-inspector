#!/bin/bash

export MAVEN_OPTS="-Xmx1024m -Xms512m -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=1044"
mvn -pl aura-inspector-tests org.eclipse.jetty:jetty-maven-plugin:run "$@"
