/* Before using this example, check if the below release tag is the latest.
 * You can find the latest release tag at https://git.soma.salesforce.com/dci/sfci-pipeline-sharedlib/releases
 */

// @Library('sfci-pipeline-sharedlib@v0.14.44') _
@Library('sfci-pipeline-sharedlib@master') _


/* import is required only if you use one of the classes specified here:
 * https://git.soma.salesforce.com/dci/sfci-pipeline-sharedlib#classes
 */
import net.sfdc.dci.BuildUtils
import net.sfdc.dci.NotifyUtils
import groovy.json.JsonSlurper


// Api Docs:
// https://git.soma.salesforce.com/pages/dci/sfci-pipeline-sharedlib/net/sfdc/dci/package-summary.html
// Are all of these api docs from Carbon needed for lighning inspector 
import groovy.json.JsonOutput
import net.sfdc.dci.BuildUtils
import net.sfdc.dci.CodeCoverageUtils
import net.sfdc.dci.GitHubUtils
import net.sfdc.dci.JenkinsUtils
import net.sfdc.dci.LogUtil
import net.sfdc.dci.MavenUtils
import net.sfdc.dci.NotifyUtils

def releaseParameters = {
    parameters([
        booleanParam( defaultValue: false,
                      description: 'Deploy master build to chrome store.',
                      name: 'DEPLOY'),
  
    ])
};

def envDef = [
    buildImage: 'ops0-artifactrepo1-0-prd.data.sfdc.net/dci/sfci-lightning-tools-docker:latest',                
    stopSuccessEmail: true,
    releaseParameters: releaseParameters
]

// Lightning Tooling profile used for staging artifcats to Nexus. 
// def STAGING_PROFILE_ID = 'c599a6860aec7';

env.RELEASE_BRANCHES = ['master']
env.GUS_TEAM_NAME = "Lightning Tooling";

// Code coverage reporting settings.
def coverage_config = [
    // Can also use jacoco
    tool_name              : 'clover',

    // Literally what the name of your team is in Gus.
    gus_team_name          : env.GUS_TEAM_NAME,
    test_suite             : 'unit',
    language_type          : 'javascript',
    aggregate_team_coverage: true,
    dev_gus_upload         : false,
    report_location        : 'logs/jest-coverage/clover.xml'
]

// is there a reason to define vars here? 
def vars;

executePipeline(envDef) {
    stage('Init') {
        /**
         * Log information about the run for debugging purposes later.
         */
        sh "node --version"
        sh "google-chrome --version"    

        buildInit()
        checkout scm
    }

    stage('NPM') {
        stage('Initialize') {
            npmInit()
            sh 'yarn config set proxy http://public0-proxy1-0-prd.data.sfdc.net:8080'
            sh 'yarn config set https-proxy http://public0-proxy1-0-prd.data.sfdc.net:8080'
        }
        stage('NPM Install') {
          sh 'yarn install --frozen-lockfile --ignore-engines'
        }
        stage('NPM Build') {
            sh 'yarn build'
            archiveArtifacts artifacts: 'builds/*'
        }
    }

    stage('Run Tests') {
          // Lets run these commands in Parellel
          parallel([
              failFast: false,
              "Unit Tests": {
                  sh 'yarn run test:ci'
              }
          ])
    }

    stage('JS Code Coverage Reporting') {
        // Publish what Jest outputs
        publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: false,
            keepAll: false,
            reportDir: 'logs/jest-report/',
            reportFiles: 'index.html',
            reportName: 'JEST Results',
            reportTitles: ''
        ])

        publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: false,
            keepAll: false,
            reportDir: 'logs/jest-coverage/',
            reportFiles: 'index.html',
            reportName: 'JEST Coverage',
            reportTitles: ''
        ])

        /**
            * Upload the Clover report from the jest --coverage run
            */
        CodeCoverageUtils.uploadReportForGusDashboard(this, coverage_config)
    }

    stage('Deploy') {
        sh "curl --version"

        if (env.BRANCH_NAME ==~ /deploy/ || (env.DEPLOY && env.DEPLOY.toBoolean() == true)) {
        
            withCredentials([
                string(credentialsId: 'prod_chrome_client_id', variable: 'CLIENT_ID'),
                string(credentialsId: 'prod_chrome_client_secret', variable: 'CLIENT_SECRET'),
                string(credentialsId: 'prod_chrome_refresh_token', variable: 'REFRESH_TOKEN')]) { 
                    
                def clientIdString = "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token"
                def cmd = "curl --tlsv1.2 \"https://accounts.google.com/o/oauth2/token\" -d \"${clientIdString}\" | ./dev/jq-linux64 -r .access_token"
                def ACCESS_TOKEN = sh(script: cmd, returnStdout: true).trim()
                def FILE = "lightning-inspector-latest.zip"
                def APP_ID = "pcpmcffcomlcjgpcheokdfcjipanjdpc";
                
                def upload  = sh(script: "curl --tlsv1.2 -H \"Authorization: Bearer ${ACCESS_TOKEN}\" -H \"x-goog-api-version: 2\" -X PUT -T ${FILE} -v \"https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APP_ID}\"", returnStdout: true).trim()  
                def uploadResult =  sh( script: "echo '${upload}' | ./dev/jq-linux64 -r .uploadState", returnStdout: true).trim()
                if (uploadResult != "SUCCESS") {
                    error("Upload failed with result ${upload}")
                }

                def publish = sh(script: "curl --tlsv1.2 -H \"Authorization: Bearer ${ACCESS_TOKEN}\" -H \"x-goog-api-version: 2\" -H \"Content-Length: 0\" -X POST -v \"https://www.googleapis.com/chromewebstore/v1.1/items/${APP_ID}/publish\"", returnStdout: true).trim()
                def publishResult = sh( script: "echo '${publish}' | ./dev/jq-linux64 -r .status[0]", returnStdout: true).trim()
                if (publishResult != "OK") {
                    error("Publish failed with result ${publish}")
                }

                def version =  sh( script: "cat package.json | ./dev/jq-linux64 -r .version", returnStdout: true).trim()
                sh "git tag -a deployed-${version} -m \"Build\""
                sh "git push origin deployed-${version}"
            } 
        } else {
            echo "Did not deploy because branch name did not contain 'deploy'";
        }
    }
}
