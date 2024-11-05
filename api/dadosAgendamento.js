const axios = require('axios');
const moment = require('moment')

module.exports = app => {

    const getAllAgendamentos = (req, res) => {
        app.db('dados_agendamento')
            .where({ userId: req.user.id })
            .then(agendamentos => res.json(agendamentos))
            .catch(err => res.status(400).json(err))
    }
    const getAgendamento = (req, res) => {

        const date = req.query.date ? req.query.date
            : moment().endOf('day').toDate()

        app.db('dados_agendamento')
            .where({ userId: req.user.id })
            .where('dataAgendamento', '<=', date)
            .orderBy('dataAgendamento')
            .then(agendamento => {
                return res.json(agendamento)
            })
            .catch(err => res.status(400).json(err))
    }

    const save = (req, res) => {
        const { bloco, apartamento } = req.body;

        // Verifica se o bloco é fornecido e se não está vazio
        if (!bloco || typeof bloco !== 'string' || !bloco.trim()) {
            return res.status(400).send('Bloco é um campo obrigatório');
        }

        // Verifica se o apartamento é fornecido e se não está vazio
        if (!apartamento || typeof apartamento !== 'string' || !apartamento.trim()) {
            return res.status(400).send('Apartamento é um campo obrigatório');
        }

        req.body.userId = req.user.id;

        // Formatando a data para armazenar apenas o dia
        if (req.body.dataAgendamento) {
            req.body.dataAgendamento = moment(req.body.dataAgendamento).format('YYYY-MM-DD');
        }

        app.db('dados_agendamento')
            .insert(req.body)
            .then(_ => res.status(204).send())
            .catch(err => res.status(400).json(err));
    };
    const remove = (req, res) => {
        app.db('dados_agendamento')
            .where({ id: req.params.id, userId: req.user.id })
            .del()
            .then(rowsDeleted => {
                if (rowsDeleted > 0) {
                    res.status(204).send()
                } else {
                    const msg = `Não foi encontrado agendamento com id ${req.params.id}.`
                    res.status(400).send(msg)
                }
            })
            .catch(err => res.status(400).json(err))
    }

    const cadastrarNoParseServer = async (req, res, idPostgre) => { // Recebendo idPostgre

        const { bloco, apartamento, dataAgendamento } = req.body;

        try {
            const response = await axios.post(`${app.parseapi.url}criar-agendamento`, {
                bloco,
                apartamento,
                dataAgendamento: moment(dataAgendamento).toISOString(),
                idPostgre  // Enviando o idPostgre para o Parse Server
            }, { headers: app.parseapi.headers });

            return response.data;  // Retorna os dados da resposta
        } catch (error) {
            throw new Error(error.response.data.error || 'Erro ao cadastrar agendamento no Parse Server');
        }
    };

    const savePostgreEParse = async (req, res) => {
        const { bloco, apartamento, dataAgendamento } = req.body;

        // Validação dos campos obrigatórios
        if (!bloco || typeof bloco !== 'string' || !bloco.trim()) {
            return res.status(400).send('Bloco é um campo obrigatório');
        }

        if (!apartamento || typeof apartamento !== 'string' || !apartamento.trim()) {
            return res.status(400).send('Apartamento é um campo obrigatório');
        }

        req.body.userId = req.user.id;

        // Formatando a data para o formato YYYY-MM-DD
        const dataFormatada = moment(dataAgendamento).format('YYYY-MM-DD');

        try {
            // Verificar se já existe um agendamento na mesma data para o usuário
            const agendamentoExistente = await app.db('dados_agendamento')
                .where({ userId: req.body.userId })
                .andWhereRaw('DATE("dataAgendamento") = ?', [dataFormatada])
                .first();

            if (agendamentoExistente) {
                return res.status(400).json('Essa data está indisponível');
            }
            // Inserir o agendamento no banco de dados PostgreSQL
            const [idAgendamento] = await app.db('dados_agendamento')
                .insert({ ...req.body, dataAgendamento: dataFormatada })
                .returning('id');

            // Cadastro no Parse Server
            await cadastrarNoParseServer(req, res, idAgendamento);

            return res.status(204).send();  // Sucesso
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };

    const getAgendamentoParse = async (req, res) => {
        const { data } = req.body;

        try {
            const response = await axios.post(`${app.parseapi.url}listar-agendamentos-por-data`, JSON.stringify(data), { headers: app.parseapi.headers });

            return res.status(200).json(response.data);
        } catch (error) {
            return res.status(400).json({ error: error.response.data });
        }
    };

    const deletarAgendamento = async (idPostgre) => {
        try {
            const response = await axios.post(`${app.parseapi.url}deletar-agendamento`, { idPostgre }, { headers: app.parseapi.headers });
            return response.data;  // Retorna somente os dados sem `res`
        } catch (error) {
            throw error.response.data;  // Repassa o erro para a função `removePostgresEParse`
        }
    };

    const removePostgresEParse = async (req, res) => {
        const idPostgre = parseInt(req.params.id); // Converte para número

        try {
            const rowsDeleted = await app.db('dados_agendamento')
                .where({ id: idPostgre, userId: req.user.id })
                .del();

            if (rowsDeleted > 0) {
                const parseResponse = await deletarAgendamento(idPostgre);  // Chama a função para deletar do Parse

                return res.status(204).send();
            } else {
                const msg = `Não foi encontrada task com id ${idPostgre}.`;
                return res.status(400).send(msg);
            }
        } catch (err) {
            return res.status(400).json(err);
        }
    };


    const hoje = (req, res) => {
        const startOfDay = moment().startOf('day').format('YYYY-MM-DD');
        app.db('dados_agendamento')
            .where({ userId: req.user.id })
            .where('dataAgendamento', '=', startOfDay)
            .orderBy('dataAgendamento')
            .then(agendamentos => res.json(agendamentos))
            .catch(err => res.status(400).json(err));
    };

    const amanha = (req, res) => {
        const tomorrow = moment().add(1, 'day').startOf('day').format('YYYY-MM-DD');
        app.db('dados_agendamento')
            .where({ userId: req.user.id })
            .where('dataAgendamento', '=', tomorrow)
            .orderBy('dataAgendamento')
            .then(agendamentos => res.json(agendamentos))
            .catch(err => res.status(400).json(err));
    };

    const semana = (req, res) => {
        const startOfDay = moment().startOf('day').format('YYYY-MM-DD');
        const endOfWeek = moment().add(7, 'days').endOf('day').format('YYYY-MM-DD');
        app.db('dados_agendamento')
            .where({ userId: req.user.id })
            .whereBetween('dataAgendamento', [startOfDay, endOfWeek])
            .orderBy('dataAgendamento')
            .then(agendamentos => res.json(agendamentos))
            .catch(err => res.status(400).json(err));
    };

    const mes = (req, res) => {
        console.log('Chegou aqui!!!!');
        const startOfDay = moment().startOf('day').format('YYYY-MM-DD');
        const endOfMonth = moment().add(30, 'days').endOf('day').format('YYYY-MM-DD');
        app.db('dados_agendamento')
            .where({ userId: req.user.id })
            .whereBetween('dataAgendamento', [startOfDay, endOfMonth])
            .orderBy('dataAgendamento')
            .then(agendamentos => res.json(agendamentos))
            .catch(err => res.status(400).json(err));
    };

    return { getAgendamento, save, remove, cadastrarNoParseServer, getAgendamentoParse, deletarAgendamento, savePostgreEParse, removePostgresEParse, getAllAgendamentos, hoje, amanha, semana, mes };
}