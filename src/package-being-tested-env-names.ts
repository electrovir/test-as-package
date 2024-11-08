/**
 * The name of the env var that, when a shell command is wrapped in `test-as-package`, will be
 * populated a JSON stringified array of all possible bin names for the package under test.
 */
export const packageBeingTestedBinNames = 'TEST-AS-PACKAGE-BIN-NAMES';
/**
 * The name of the env var that, when a shell command is wrapped in `test-as-package`, will be
 * populated with a path to the package under test's bin file's folder.
 */
export const packageBeingTestedInstallationBinDirPath = 'TEST-AS-PACKAGE-INSTALLATION-BIN-DIR-PATH';
