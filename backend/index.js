import express from 'express'

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('express');
})

app.listen(5000, () => {
    console.log('App is running on port 5000');
})