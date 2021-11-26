module.exports = {
	apps: [
		{
			name: 'Crowned Discord Bot',
			script: './src/index.js',
			max_restarts: 10,
			min_uptime: 300000,
			restart_delay: 5000,
		},
	],
};
