/* Before using this example, check if the below release tag is the latest.
 * You can find the latest release tag at https://git.soma.salesforce.com/dci/sfci-pipeline-sharedlib/releases
 */
@Library('sfci-pipeline-sharedlib@v0.14.44') _

/* import is required only if you use one of the classes specified here:
 * https://git.soma.salesforce.com/dci/sfci-pipeline-sharedlib#classes
 */
import net.sfdc.dci.BuildUtils
import net.sfdc.dci.NotifyUtils
import groovy.json.JsonSlurper

env.RELEASE_BRANCHES = ['deploy']

def envDef = [
                buildImage: 'ops0-artifactrepo1-0-prd.data.sfdc.net/dci/centos-sfci-nodejs:latest',
                stopSuccessEmail: true
            ]
def vars;
// def runTests(commandName, vars) {
//     try {
//         // jest outputs test results to stderr, redirect this to jest_out.log
//         // which will be processed by tests/github/update-pr.js
//         echo "---- Running ${commandName} ----"
//         sh "yarn ${commandName} 2> tests/logs/jest_out_${commandName}.log"
//         sh "cat tests/logs/jest_out_${commandName}.log"
//     } catch(e) {
//         // a non-0 return from sh will throw exceptions
//         // Only update the PR with a comment if it failed
//         // this will get us access to the GITHUB service account username/password
//         withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: "sfci-git", usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
//             env.GIT_USERNAME = '${GIT_USERNAME}'
//             env.GIT_PASSWORD = '${GIT_PASSWORD}'
//             env.GIT_BRANCH = vars.GIT_BRANCH
//             // shouldn't be needed, but it seems to help
//             env.NODE_EXTRA_CA_CERTS = pwd+'/tests/github/npm-sfdc-certs.pem'
//             try {
//                 sh "node tests/github/update-pr.js"
//             } catch(ee) {
//                 echo "Error updating PR"
//             }
//         }
//     }
//     echo "---- End ${commandName} ----"
//     junit "junit*.xml"
// }

executePipeline(envDef) {
  stage('Init') {
      // this will deplay env, for debug 
      //echo sh(script: 'env|sort', returnStdout: true)

      // checkout scm (seems like sfci already does,
      // to the returned map, for access to things like
      // vars.GIT_BRANCH)
      buildInit()
      vars = checkout scm
  }
  stage("Node: install deps") {
      // this will set up the nexus user for npms
      npmInit()
      sh 'yarn config set proxy http://public0-proxy1-0-prd.data.sfdc.net:8080'
      sh 'yarn config set https-proxy http://public0-proxy1-0-prd.data.sfdc.net:8080'
      sh "yarn"
  }
  stage('Build') {
      // def error = false;
      // try {
      //   sh "mkdir logs"
      //   sh "yarn lint 2> logs/jest_out.log"
      // } catch(e) {
      //   error = true;
      //   // a non-0 return from sh will throw exceptions
      //   // Only update the PR with a comment if it failed
      //   // this will get us access to the GITHUB service account username/password
      //   withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: "sfci-git", usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
      //       env.GIT_USERNAME = '${GIT_USERNAME}'
      //       env.GIT_PASSWORD = '${GIT_PASSWORD}'
      //       env.GIT_BRANCH = vars.GIT_BRANCH
      //       def pwd = sh(script: 'pwd', returnStdout:true).trim();
      //       echo pwd
      //        // shouldn't be needed, but it seems to help
      //       env.NODE_EXTRA_CA_CERTS = pwd+'/build/npm-sfdc-certs.pem'
      //       try {
      //           sh "node build/update-pr.js"
      //       } catch(ee) {
      //           echo "Error updating PR"
      //       }
      //   }
      // }
      // junit "junit*.xml"
      
      sh "yarn build"

      // if (env.BRANCH_NAME ==~ /master/) {
      //   def version =  sh( script: "cat package.json | ./dev/jq-linux64 -r .version", returnStdout: true).trim()
      //   try {
      //     sh "git tag -a ${version} -m \"Build\" 2>&1"
      //     sh "git push origin ${version}"
      //   } catch(e) {
      //     error("Tag ${version} already exists");
      //   }
      // }
      archiveArtifacts artifacts: 'builds/*'
      //archiveArtifacts artifacts: 'logs/*'
  }
//   stage('Run tests') {
//     def pwd = sh(script: 'pwd', returnStdout:true).trim();
//     echo pwd
//     runTests("test:prod", vars);
//     archiveArtifacts artifacts: 'tests/logs/*.log'
//   }
  stage('Deploy') {
    sh "curl --version"
    // if (env.BRANCH_NAME ==~ /deploy/) {
      
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
    // }
  } 
}
