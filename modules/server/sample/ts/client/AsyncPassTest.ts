import { UnitTest } from '@ephox/bedrock-client'

UnitTest.asynctest('AsyncPass Test', (success, failure) => {

  new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, 1000);
  }).then(success);
});
