'use strict';

var _ember = require('ember');

var _ember2 = _interopRequireDefault(_ember);

_ember2.default.assert('this will remain');
_ember2.default.assert('this will remain', true);

_ember2.default.debug('this will remain');

_ember2.default.deprecate('this will remain', false, {
  id: 'test-deprecation',
  until: '3.0.0',
  url: 'http://foo.com'
});

_ember2.default.info('this will remain');

_ember2.default.runInDebug(function () {
  _ember2.default.Component.reopen({
    didInsertElement: function didInsertElement() {
      console.log('this will all remain');
    }
  });
});

_ember2.default.warn('this will remain');

_ember2.default.isEqual('this will remain', 'ok?');
