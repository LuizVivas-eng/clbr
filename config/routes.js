module.exports = app => {
    app.get('/teste', (req, res) => res.json({ ok: 'tudo funcionano 2027' }))
    app.post('/signup', app.api.user.save)
    app.post('/signin', app.api.auth.signin)

    app.route('/agendamento')
        .all(app.config.passport.authenticate())
        .get(app.api.dadosAgendamento.getAgendamento)
        .post(app.api.dadosAgendamento.savePostgreEParse)

    app.route('/hojeOuAmanha')
        .all(app.config.passport.authenticate())
        .get(app.api.dadosAgendamento.hojeOuAmanha)

    app.route('/agendamento/:id')
        .all(app.config.passport.authenticate())
        .delete(app.api.dadosAgendamento.removePostgresEParse)

    app.route('/agendamento/getAgendamentoParse')
        .all(app.config.passport.authenticate())
        .post(app.api.dadosAgendamento.getAgendamentoParse)

    app.route('/agendamento/getAllAgendamentos')
        .all(app.config.passport.authenticate())
        .get(app.api.dadosAgendamento.getAllAgendamentos)

}