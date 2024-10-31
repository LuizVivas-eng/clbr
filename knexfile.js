
// Para homologação
/* module.exports = {
	client: 'postgresql',
	connection: {
		database: 'controleLavanderia',
		user: 'postgres',
		password: '123456'
	},
	pool: {
		min: 2,
		max: 10
	},
	migrations: {
		tableName: 'knex_migrations'
	}
};
 */


module.exports = {
	client: 'postgresql',
	connection: {
        host: process.env.PGHOST,
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.PGPASSWORD || '123456',
        database: process.env.POSTGRES_DB || 'controleLavanderia',
		port: process.env.PGPORT
    },
	pool: {
		min: 2,
		max: 10
	},
	migrations: {
		tableName: 'knex_migrations'
	}
};