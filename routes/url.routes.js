const express = require("express")
const pool = require("../db");
const crypto = require('crypto') 
const router = express.Router()

router.post('/shorten', async(req,res)=>{
    const url = req.body.url
    try {
        const short_code = crypto.randomBytes(3).toString('hex')
        const shorten = await pool.query('INSERT INTO url(url,shortcode) VALUES($1,$2) RETURNING *', [url, short_code])
        res.status(201).send(shorten.rows[0])
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/shorten/:shortcode', async(req,res)=>{
    try {
        const url = req.params.shortcode
        const get_url = await pool.query('SELECT * FROM url WHERE shortcode = $1',[url])
        const urlData = get_url.rows[0]
        if(!urlData){return res.status(404).send('Url not found')}
        const increseStat = parseInt(urlData.access_count) + 1
        const update_url = await pool.query('UPDATE url SET access_count = $1 WHERE id = $2 RETURNING *',[increseStat, urlData.id])
        const result = update_url.rows[0]
        delete result.access_count
        res.status(200).send(result)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.put('/shorten/:shortcode', async(req,res)=>{
    try {
        const shortCode = req.params.shortcode
        const url = req.body.url
        const update_url = await pool.query('UPDATE url SET url = $1, updatedat = CURRENT_TIMESTAMP WHERE shortcode = $2 RETURNING *',[url, shortCode])
        const result = update_url.rows[0]
        delete result.access_count
        res.status(200).send(result)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/shorten/:shortcode', async(req,res)=>{
    try {
        const shortCode = req.params.shortcode
        const update_url = await pool.query('DELETE FROM url WHERE shortcode = $1',[ shortCode])
        res.status(204).send("Content Not Found")
    } catch (error) {
        res.status(404).send(error)
    }
})

router.get('/shorten/:shortcode/stats', async(req,res)=>{
    try {
        const url = req.params.shortcode
        const get_url = await pool.query('SELECT * FROM url WHERE shortcode = $1',[url])
        const urlData = get_url.rows[0]
        if(!urlData){return res.status(404).send('Url not found')}
        res.status(200).send(urlData)
    } catch (error) {
        res.status(404).send(error)
    }
})

module.exports= router