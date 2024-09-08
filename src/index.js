const { getData } = require('./lib/get-data.js')
const { renderData } = require('./lib/render-data.js')
const config = require('./config')

getData(config).then(data => {
    renderData(data)
})
