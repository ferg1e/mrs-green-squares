const { getData } = require('./lib/get-data.js')
const { renderData } = require('./lib/render-data.js')
const config = require('./config')

//
const configs = Array.isArray(config)
    ? config
    : [config]

//
configs.forEach(
    v => getData(v).then(
        data => renderData(data)
    )
)
