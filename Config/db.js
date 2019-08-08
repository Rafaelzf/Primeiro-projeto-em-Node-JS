if (process.env.NODE_EV == 'production') {
    module.exports = { mongoURI: 'mongodb+srv://rafaelzf:nega123@blogapp-dfbej.mongodb.net/test?retryWrites=true&w=majority' };
} else {
    module.exports = { mongoURI: 'mongodb://localhost/blogapp' };

};