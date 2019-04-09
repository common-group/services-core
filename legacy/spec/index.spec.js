global.window = Object.assign(require('mithril/test-utils/domMock.js')(), require('mithril/test-utils/pushStateMock')())
global.TIMEOUT_IN_MS = 100;
const testsContext = require.context('.', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);
