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
     'default'
   ]
};  