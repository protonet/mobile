#!/usr/bin/env node

var worker = require('./../tasks/fs_worker'),
    Step   = require('./../modules/step');

Step(
  function() { worker.list({parent: ''}, this); },
  function() { worker.list({parent: 'users'}, this); },
  function() { worker.list({parent: 'users/1'}, this); },

  function() { worker.copy({from: ['users/1/clock.pdf'], to: 'users/1/test.pdf'}, this); },
  function() { worker.move({from: ['users/1/test.pdf'], to: 'users/1/testing.pdf'}, this); },
  function() { worker.copy({from: ['users/1/clock.pdf', 'users/1/testing.pdf'], to: 'channels/1'}, this); },
  function() { worker.copy({from: ['channels/1/testing.pdf'], to: 'channels/1/test.pdf'}, this); },
  function() { worker.move({from: ['channels/1/test.pdf'], to: 'channels/1/it works.pdf'}, this); },
  function() { worker.move({from: ['channels/1/it works.pdf'], to: 'users/1'}, this); },
  function() { worker.move({from: ['channels/1/clock.pdf'], to: 'channels/1/clock2.pdf'}, this); },
  function() { worker.copy({from: ['channels/1/clock2.pdf'], to: 'users/1'}, this); },

  function() { worker.mkdir({parent: 'channels/1', name: 'asdf'}, this); },
  function() { worker.mkdir({path: 'channels/1/jkl;'}, this); },

  function() { worker.copy({from: ['users/1/clock.pdf', 'users/1/clock2.pdf', 'users/1/it works.pdf'], to: 'channels/1/asdf'}, this); },
  function() { worker.move({from: ['channels/1/asdf/it works.pdf'], to: 'channels/1/jkl;'}, this); },

  function() { worker.delete({paths: ['channels/1/jkl;/it works.pdf']}, this); },
  function() { worker.delete({paths: ['channels/1/asdf']}, this); },
  function() { worker.delete({paths: ['channels/1/jkl;']}, this); },

  function() { console.log('All tests completed'); this(); }
);
