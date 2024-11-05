module.exports = app => {
    app.get('/teste', (req, res) => res.json({ ok: 'Api Ativa - 2025' }))
    app.post('/signup', app.api.user.save)
    app.post('/signin', app.api.auth.signin)

    app.route('/agendamento')
        .all(app.config.passport.authenticate())
        .get(app.api.dadosAgendamento.getAgendamento)
        .post(app.api.dadosAgendamento.savePostgreEParse)

    app.route('/agendamento/:id')
        .all(app.config.passport.authenticate())
        .delete(app.api.dadosAgendamento.removePostgresEParse)

    app.route('/agendamento/getAgendamentoParse')
        .all(app.config.passport.authenticate())
        .post(app.api.dadosAgendamento.getAgendamentoParse)

    app.route('/agendamento/getAllAgendamentos')
        .all(app.config.passport.authenticate())
        .get(app.api.dadosAgendamento.getAllAgendamentos)

        app.route('/hoje')
        .all(app.config.passport.authenticate())
        .get(app.api.dadosAgendamento.hoje)

    app.route('/amanha')
        .all(app.config.passport.authenticate())
        .get(app.api.dadosAgendamento.amanha)

    app.route('/semana')
        .all(app.config.passport.authenticate())
        .get(app.api.dadosAgendamento.semana)

    app.route('/mes')
        .all(app.config.passport.authenticate())
        .get(app.api.dadosAgendamento.mes)

}