
exports.up = function (knex, Promise) {
    return knex.schema.createTable('dados_agendamento', table => {
        table.increments('id').primary()
        table.string('bloco').notNull()
        table.string('apartamento').notNull()
        table.string('nome')
        table.date('dataAgendamento')
        table.integer('userId').references('id')
            .inTable('users').notNull()
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('dados_agendamento')
};
