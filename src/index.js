const { getData } = require('./lib/get-data.js')
const { renderData } = require('./lib/render-data.js')
const config = require('./my-settings')

getData(config).then(data => {
    renderData(data)
})
