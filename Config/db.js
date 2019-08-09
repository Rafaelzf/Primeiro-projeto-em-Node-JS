if (process.env.NODE_EV == 'production') {
    console.log('desenvolvimento')
    module.exports = { mongoURI: 'mongodb+srv://rafaelzf:nega123@blogapp-dfbej.mongodb.net/test?retryWrites=true&w=majority' };
} else {
    console.log('produção')
    module.exports = { mongoURI: 'mongodb://localhost/blogapp' };

};