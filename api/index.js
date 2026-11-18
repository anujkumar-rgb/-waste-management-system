module.exports = (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify({
    status: 'online',
    version: '2.0.0',
    system: 'Smart Waste Management Municipal Server',
    endpoints: ['/api/health']
  }));
};
