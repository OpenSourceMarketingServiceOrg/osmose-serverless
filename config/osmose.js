module.exports = {
    email: {
        confirm: {
            from: 'noreply@osmose.tools',
            subject: 'You\'ve Been Signed Up For OSMoSE Mail!',
            body: '',
            apiUrl: 'https://zsazrlvshe.execute-api.us-east-1.amazonaws.com/dev1/confirm?confirmUuid='
        }
    },
    database: {
        recipientTable: 'ClientList',
        statusTable: 'SentEmailStatus'
    }
  };