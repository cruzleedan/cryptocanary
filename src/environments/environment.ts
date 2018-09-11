// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'http://localhost:3000',
  baseApiUrl: 'http://localhost:3000/api/v1',
  domain: 'localhost',
  api: {
      login: 'api/auth/login',
      validateToken: 'api/auth/validatetoken'
  },
  fbConfig: {
      appId: '186964375335970',
      status: false,  // the SDK will attempt to get info about the current user immediately after init
      cookie: false,  // enable cookies to allow the server to access
      // the session
      xfbml: false,   // With xfbml set to true, the SDK will parse your page's DOM to find and
      // initialize any social plugins that have been added using XFBML
      version: 'v2.8' // use graph api version 2.5
  },
  auth: {
      token: '',
      cred: '',
      refreshToken: ''
  }
};

/*
* In development mode, to ignore zone related error stack frames such as
* `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
* import the following file, but please comment it out in production mode
* because it will have performance impact when throw error
*/
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
