
//
const { renderData } = require('../lib/render-data.js')

/*
repos data object normally
returned by getData()
*/
const data = {
  commitCounts: {
    '2014-04-20': { '0': 1, total: 1 },
    '2014-04-21': { '0': 2, total: 2 },
    '2014-04-22': { '0': 5, total: 5 },
    '2014-04-23': { '0': 7, total: 7 },
    '2014-04-24': { '0': 10, total: 10 },
    '2014-04-25': { '1': 6, total: 6 },
    '2014-04-26': { '0': 1, '1': 2, total: 3 },
  },
  allColors: [ 'ff0000', '00aa00' ],
  max: 10,
  firstDay: new Date('2014-04-20'),
  lastDay: new Date('2014-04-26'),
  outputPath: 'test-render.html',
}

//
renderData(data)
