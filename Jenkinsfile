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

// Delete later if this value is never needed or used 
def IS_CARBON = false 


// env.RELEASE_BRANCHES = ['deploy']

// Parameters for your Jenkins run page
// Reference as: params.VARIABLE_NAME

def buildParameters = {
    parameters([
        // booleanParam( defaultValue: false,
        //               description: 'Question for the user.',
        //               name: 'VARIABLE_NAME'),
        booleanParam( defaultValue: false,
                      description: 'Publish a new NPM version to Nexus?',
                      name: 'NPM_PUBLISH'),
    ])
}

def envDef = [
                buildImage: 'ops0-artifactrepo1-0-prd.data.sfdc.net/dci/sfci-lightning-tools-docker:latest',                
                stopSuccessEmail: true
            ]

// Lightning Tooling profile used for staging artifcats to Nexus. 
def STAGING_PROFILE_ID = 'c599a6860aec7';

// define any release branches here
env.RELEASE_BRANCHES = ['master']

// Set our shared library version to quiet down a warning
env.SHARE_LIB_VERSION = 'v1'

// Minimum percent of code coverage we can have with any particular run.
// Via SFCI Doc: Once a threshold code coverage is set, any code coverage 
// that is below the threshold results in a build failure
env.CODE_COVERAGE_THRESHOLD =  53

// Component Library was doing this. Not exactly sure
// why though. So putting her for now.
env.DEFAULT_MAVEN_ARGS = '--batch-mode --lax-checksums --fail-at-end --update-snapshots -Dmaven.repo.local=.m2/repository -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn'

// Used currently for reporting the submission of Jars to Precheckin.
// Specify as the name of your Slack Channel
env.SLACK_CHANNEL = "lightning-tools-team";

// We use this latest commit to check for tags to enable certain stages.
latestCommitMessage = null

// Our GitHub Status reporter
commitStatusReporter = null

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

      // this will deplay env, for debug 
      //echo sh(script: 'env|sort', returnStdout: true)

      // checkout scm (seems like sfci already does,
      // to the returned map, for access to things like
      // vars.GIT_BRANCH)
      buildInit()
      checkout scm
      commitStatusReporter = new GitHubCommitStatusReporter(this)

  }

  stage('NPM') {
        stage('Initialize') {
            // withEnv(["npm_config_registry=https://nexus-proxy-prd.soma.salesforce.com/nexus/content/groups/npm-all/"]) {
                npmInit(null)
            // })
        }
        stage('Set Proxy'){
            sh 'yarn config set proxy http://public0-proxy1-0-prd.data.sfdc.net:8080'
            sh 'yarn config set https-proxy http://public0-proxy1-0-prd.data.sfdc.net:8080'
        }
        stage('NPM Install') {
          sh 'yarn install --frozen-lockfile --ignore-engines'
        }
        stage('NPM Build') {
            commitStatusReporter.report('NPM Build') {
                sh 'yarn build'
            }
            archiveArtifacts artifacts: 'builds/*'
        }
        stage('Validations') {
          // Lets run these commands in Parellel
          parallel([
              failFast: false,
              "Code Conformance": {
                  commitStatusReporter.report('Code Conformance') {
                      // sh 'yarn run lint'
                  }
              },

              "Unit Tests": {
                  commitStatusReporter.report('Unit Tests') {
                      sh 'yarn run test'
                  }
              },

              "WDIO Tests": {
                  withEnv(["npm_config_registry=https://nexus-proxy-prd.soma.salesforce.com/nexus/content/groups/npm-all/"]) {
                      commitStatusReporter.report('WDIO Tests') {
                          //  sh 'yarn run test:wdio'
                      }
                  }
              }
          ])} 
      

        stage('AutoIntegration') {
            // Generate PRs for commits to patch branches to their parent branches
            // See .auto-integrate.yaml
            autoIntegration();
        }
        if (BuildUtils.isReleaseBuild(env)) {
            latestCommitMessage = GitHubUtils.getLatestCommitMessage(this)
            if (latestCommitMessage.contains('@npm-publish@') || params.NPM_PUBLISH) {
                stage('Release NPMs') {
                    publishNPMs()
                }
            }
        }
    }
    
  stage('Run tests') {
      commitStatusReporter.report('Unit Tests') {
                        sh 'yarn run test:ci'
       }
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
    if (env.BRANCH_NAME ==~ /deploy/) {
      
      withCredentials([
        string(credentialsId: 'prod_chrome_client_id', variable: 'CLIENT_ID'),
        string(credentialsId: 'prod_chrome_client_secret', variable: 'CLIENT_SECRET'),
        string(credentialsId: 'prod_chrome_refresh_token', variable: 'REFRESH_TOKEN')]) { 
            
        // def CLIENT_ID = ""
        // def CLIENT_SECRET = ""
        // def REFRESH_TOKEN = ""

        def clientIdString = "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token"
        def cmd = "curl --tlsv1.2 \"https://accounts.google.com/o/oauth2/token\" -d \"${clientIdString}\" | ./dev/jq-linux64 -r .access_token"
        def ACCESS_TOKEN = sh(script: cmd, returnStdout: true).trim()
        def FILE = "builds/lightning-inspector-latest.zip"
        def APP_ID = "pejdccfkffdknpcamoboeiadblmbofjd"
        
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
    }
  }
}

/**
 *  A utility that facilitates reporting the progress and outcome of build steps to a git commit.
 */
class GitHubCommitStatusReporter {

    // The SHA of the commit to which we will report status.
    private String commitSha;

    // The execution context.
    private executionContext;

    // The GitHub Status API URI to which we report status.
    private String commitStatusUri;

    // The authentication information (in header form) to use for all GitHub API requests.
    private requestHeaders;


    /**
     * Initializes a new GitHubCommitStatusReporter.
     * 
     * @param executionContext
     *  The execution context in which the instance is run.
     *
     * @param [commitSha]
     *  The optional SHA of the commit to which the instance will report status.
     *  If omitted, it defaults to the SHA of the latest commit in the execution context.
     */
    public GitHubCommitStatusReporter(executionContext, String commitSha = null) {

        this.executionContext = executionContext;
        this.commitSha = commitSha;
    }

    /**
     * Sets the status of the configured commit.
     *
     * @param status
     *  A set of GitHub Status API parameters that specify the status of the commit, as supported by https://developer.github.com/v3/repos/statuses/#create-a-status.
     */
    public void setCommitStatus(status) {

        // Ensure we're ready-to-go.
        GitHubCommitStatusReporter.ensureInitialized(this);

        // POST the status to GitHub
        BuildUtils.doPost(this.executionContext, this.commitStatusUri, status, this.requestHeaders, null, null);
    }

    /**
    *  Reports the progress and outcome of one or more steps to GitHub as the status of a GitHub Status API context.
    *  The specified GitHub Status API context will be marked as "pending" before the steps are executed.
    *  If the steps throw an error, the context will be marked as "failure"; otherwise, it will be marked as "success".
    *
    *  @param  gitHubStatusApiContextName
    *      The name of the GitHub Status API context to which the progress of the steps are reported.
    *
    *  @param  steps
    *      The build steps to execute.
    **/
    public void report(String gitHubStatusApiContextName, Closure steps) {

        this.setCommitStatus([state: 'pending', context: gitHubStatusApiContextName, target_url: this.executionContext.env.BUILD_URL]);
        try {
            steps();
            this.setCommitStatus([state: 'success', context: gitHubStatusApiContextName, target_url: this.executionContext.env.BUILD_URL]);
        }
        catch (e) {

            // Attempt to report the status to GitHub.
            try {
                this.setCommitStatus([state: 'failure', context: gitHubStatusApiContextName, target_url: this.executionContext.env.BUILD_URL]);
            }
            catch (reportingError) {

                // If we can't report to GitHub, log a warning to the console.
                LogUtil.printLogs(this.executionContext, LogUtil.LogLevel.WARN, reportingError, "Unable to report GitHub status for '${gitHubStatusApiContextName}' due to an error");
            }

            // Log the error, which will re-throw the original exception.
            LogUtil.error(this.executionContext, e, "An error occurred executing the steps for '${gitHubStatusApiContextName}'");
        }
    }

    /**
     * Ensures a GitHubCommitStatusReporter instance is initialized and ready to call the GitHub Status API.
     *
     * @param reporter
     *  A GitHubCommitStatusReporter instance.
     *  
     */
    private static void ensureInitialized(GitHubCommitStatusReporter reporter) {

        // If we haven't initialized things, do so now.
        if (reporter.commitStatusUri == null) {

            // Default the commit SHA to that of the latest commit if one wasn't provided.
            reporter.commitSha = reporter.commitSha ?: BuildUtils.getLatestCommitSha(reporter.executionContext);

            def gitHubParams = GitHubUtils.getDefaultGithubParams(reporter.executionContext);

            // Use the utility to form up our base URI to GitHub.
            String repositoryBaseUri = GitHubUtils.apiV3Repos(gitHubParams.host, gitHubParams.org, gitHubParams.repo);

            // Use the GitHub Status API endpoint for this specific commit.
            reporter.commitStatusUri = "${repositoryBaseUri}/statuses/${reporter.commitSha}";

            reporter.requestHeaders = GitHubUtils.previewCustomHeaders(reporter.executionContext, gitHubParams.credentialsId);
        }
    }
}


/**
* Borrowed from git.soma.salesforce.com/communities/talon
*
* Publishes the talon NPMs to the internal registry.
* It will bump the NPM version based on the current branch.
* If the currentBranch == latestBranch it will bump the minor number of the release version
* If it's not it will bump the patch number and makes the assumption that if the current branch
* is not the latestBranch, it's a patch branch.
*
* Will default to bumping patch unless @minor-release@ specified
*/
void publishNPMs() {
    def currentBranch = BuildUtils.getCurrentBranch(this)
    if (currentBranch != 'master') {
        echo 'not on master branch, skipping npm publishing'
        return;
    }

    echo 'executing NPM publishing flow...'

    // semantic release numbers are defined as x.y.z corresponding to major, minor, patch.
    // if @minor-release@ found in last commit, bump minor version
    // default to bumping patch release

    def bump = 'patch'

    if (BuildUtils.existsOnChangelogSets(this, '@minor-release@')) {
        echo '@minor-release@ found, bumping minor release'
        bump = 'minor'
    }

    // lerna will commit the package.json files if they get updated so we need to checkout the branch.
    sh "git checkout --track origin/${currentBranch}"

    // lerna checks the tags in order to determine if the modules have changed or not, tags are not fetched by the
    // checkout scm step so we may need to do it here.
    sh 'git fetch --tags --quiet'

    // lerna will commit package.json files, we tell our CI to skip all checks and just commit it.
    def commitMessage = 'chore(npm-release): %s @skip-ci@'
    npmPublish(NPM_REGISTRY, bump, commitMessage)
}

/**
* Sets the npm auth token and executes 'lerna publish ${bump} --registry=https:${registry} --message=${commitMessage}'
* which will release any package where changes have been introduced.
*
* the package.json files of the packages where changes have been introduced will be updated and committed to the current branch
* and the npms will be published to the specified registry.
*
* This method assumes that the current branch is checked out and that the tags of the branch has been fetched.
*/
void lernaPublish(def registry, def bump, def commitMessage) {
    /*
     * Get the npm token for the service user and add this to the users .npmrc:
     * //nexus-proxy-prd.soma.salesforce.com/nexus/content/repositories/npmjs-internal/:_authToken=[NPM_TOKEN]
     * in order to allow publishing to the internal NPM registry.
     */
    withCredentials([usernamePassword(credentialsId: 'sfci-nexus', usernameVariable: 'NEXUS_USERNAME', passwordVariable: 'NEXUS_PASSWORD')]) {
        def authToken = sh([script: "echo -n ${NEXUS_USERNAME}:${NEXUS_PASSWORD} | base64", returnStdout: true]).trim()
        sh "npm config set '${registry}:_authToken' '${authToken}'"
    }

    sh "npx lerna publish ${bump} --registry=https:${registry} --message='${commitMessage}' -y"
}


/**
* Sets the npm auth token and executes 'lerna publish ${bump} --registry=https:${registry} --message=${commitMessage}'
* which will release any package where changes have been introduced.
*
* the package.json files of the packages where changes have been introduced will be updated and committed to the current branch
* and the npms will be published to the specified registry.
*
* This method assumes that the current branch is checked out and that the tags of the branch has been fetched.
*/
void npmPublish(def registry, def bump, def commitMessage) {
    /*
     * Get the npm token for the service user and add this to the users .npmrc:
     * //nexus-proxy-prd.soma.salesforce.com/nexus/content/repositories/npmjs-internal/:_authToken=[NPM_TOKEN]
     * in order to allow publishing to the internal NPM registry.
     */
    withCredentials([usernamePassword(credentialsId: 'sfci-nexus', usernameVariable: 'NEXUS_USERNAME', passwordVariable: 'NEXUS_PASSWORD')]) {
        def authToken = sh([script: "echo -n ${NEXUS_USERNAME}:${NEXUS_PASSWORD} | base64", returnStdout: true]).trim()
        sh "npm config set '${registry}:_authToken' '${authToken}'"
    }

    // This doesn't seem accurate. I don't want to require lerna, so I'll have to verify what the solutino is shortly.
    // sh "yarn publish ${bump} --registry=https:${registry} --message='${commitMessage}' -y"
}
