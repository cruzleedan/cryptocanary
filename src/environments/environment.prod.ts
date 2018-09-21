export const environment = {
  production: false,
  baseUrl: 'https://cryptocanary-api.herokuapp.com',
  baseApiUrl: 'https://cryptocanary-api.herokuapp.com/api/v1',
  domain: 'https://cryptocanary-api.herokuapp.com',
  api: {
      login: 'api/auth/login',
      validateToken: 'api/auth/validatetoken'
  },
  tinyMce: {
    apiKey: 'p3c7sdbs7ut72lnvt86hupurdlo7mmk4pko0ec476qsvs5px'
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
