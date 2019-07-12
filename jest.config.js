module.exports = {
  // For usage in reports
  displayName: 'Unit Tests',

  // Defaults for testing LWC with Jest
  preset: '@lwc/jest-preset',

  // Support writing your tests in Typescript
  // transform: {
  //     '^.+\\.tsx?$': 'ts-jest'
  // },

  // References in your module files will need to know where the source
  // is for those accompanied module files.
  moduleNameMapper: {
      '^namespace/(.+)$': '<rootDir>/src/modules/namespace/$1/$1'
  },

  // Which files to run as Jest Tests
  // -- @lwc/jest-preset already provides this, so no need to specify it again here.
  // testMatch: [
  //     // Any Tests in the __tests__ folder for modules
  //     '**/__tests__/**/?(*.)(spec|test).(js|ts)'
  // ],

  // For import statements, which extensions should we reference.
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Do not run any tests in these directories.
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '__wdio__/'],

  // Assume any files in these directories have been already compiled
  // for usage.
  transformIgnorePatterns: ['.*node_modules/(?!@talon|@salesforce/lwc-jest).*'],

  // Location of the dependencies.
  // This is the default value, so commented out as to not overwrite.
  // moduleDirectories: ["node_modules"],

  // We override this via --coverage in the yarn test script.
  // This is the default value, so commented out as to not overwrite.
  // collectCoverage: false,

  // Different output formats for the coverage report.
  // You want the HTML version for pushing to SFCI runs.
  // This is the default value, so commented out as to not overwrite.
  // coverageReporters: ["json", "html", "text", "clover"],

  // Which files to include in the Code Coverage Report.
  collectCoverageFrom: [
      'src/**/*.ts',
      'src/**/*.js',
      'modules/**/*.js',

      // Don't get coverage for wdio tests yet.
      '!**/__wdio__/**/*.js'
  ],

  // External libraries we don't want to match
  // This is the default value, so commented out as to not overwrite.
  // coveragePathIgnorePatterns: ["node_modules"],

  // Where to output the Code Coverage report to.
  coverageDirectory: 'logs/jest-coverage',

  // Which types of processors are we going to use for the coverage.
  // We use jest-junit for processing of the results for pushing to SFCI runs.
  // Allows us to consolidate our test results and coverage numbers between Java and JavaScript
  reporters: [
      'default',
      [
          'jest-junit',
          {
              suiteName: 'Unit Tests',
              output: './logs/reports/junit/jest-results.xml'
          }
      ],
      [
          './node_modules/jest-html-reporter',
          {
              pageTitle: 'Carbon Jest Test Report',
              outputPath: './logs/jest-report/index.html',
              includeFailureMsg: true,
              includeConsoleLog: true,

              // Theme options: defaultTheme, lightTheme, darkTheme
              theme: 'darkTheme'
          }
      ]
  ]
};
