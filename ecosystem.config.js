module.exports = {
	apps: [
		{
			name: 'Crowned Discord Bot',
			script: './src/index.js',
			instances: 1,
			max_restarts: 10,
			min_uptime: 300000,
			restart_delay: 5000,
		},
	],
};
