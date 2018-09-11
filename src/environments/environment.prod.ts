export const environment = {
  production: false,
  baseUrl: 'https://cryptocautionapi.herokuapp.com',
  baseApiUrl: 'https://cryptocautionapi.herokuapp.com/api/v1',
  domain: 'https://cryptocautionapi.herokuapp.com',
  api: {
      login: 'api/auth/login',
      validateToken: 'api/auth/validatetoken'
  },
  fbConfig: {
      appId: '186964375335970',
      status: false,
      cookie: false,
      xfbml: false,
      version: 'v2.8'
  },
  auth: {
      token: '',
      cred: '',
      refreshToken: ''
  }
};
