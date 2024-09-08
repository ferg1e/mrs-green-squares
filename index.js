const { getData } = require('./get-data.js')
const { renderData } = require('./render-data.js')
const config = require('./my-settings')

getData(config).then(data => {
    renderData(data)
})
