// http://pm2.keymetrics.io/docs/usage/application-declaration/
module.exports = {
  apps: [
    {
      name: 'Canis',
      script: 'server.js',
      node_args: '--harmony',
      env_production: {
        NODE_ENV: 'production'
      }
    }
    // {
    //   name: 'Consul',
    //   script: 'server.js',
    //   // node_args: '--harmony',
    //   env_production: {
    //     NODE_ENV: 'production'
    //   }
    // }
  ]
};
