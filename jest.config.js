module.exports = {
    // For usage in reports
    displayName: 'Unit Tests',

    // References in your module files will need to know where the source
    // is for those accompanied module files.
    moduleNameMapper: {
        '^namespace/(.+)$': '<rootDir>/src/modules/namespace/$1/$1'
    },

    // For import statements, which extensions should we reference.
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    // Do not run any tests in these directories.
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '__wdio__/'],

    // Assume any files in these directories have been already compiled
    // for usage.
    transformIgnorePatterns: ['.*node_modules/(?!@talon|@salesforce/lwc-jest|lodash-es).*'],

    reporters: [
        'default',
        [
            './node_modules/jest-html-reporter',
            {
                pageTitle: 'Lightning Inspector Test Report',
                outputPath: './logs/jest-report/index.html',
                includeFailureMsg: true,
                includeConsoleLog: true,

                // Theme options: defaultTheme, lightTheme, darkTheme
                theme: 'darkTheme'
            }
        ]
    ],

    // Where to output the Code Coverage report to.
    coverageDirectory: 'logs/jest-coverage'
};
