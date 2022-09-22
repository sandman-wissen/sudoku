const express = require('express');
const router = express.Router();

router.get ('/', (req, res) => {
    res.render('index')
})

router.get ('/scoreboard', (req, res) => {
    res.render('scoreboard')
})


module.exports = router;