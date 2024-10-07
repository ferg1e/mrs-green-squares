
//
const { renderData } = require('../lib/render-data.js')

/*
repos data object normally
returned by getData()
*/
const data = {
    commitCounts: {
        '2014-04-20': {
            'p0': ['test commit message'],
            'p1': ['test1', 'test2']
        },
        '2014-04-21': {
            'p1': ['test1', 'test2']
        }
    },
    max: 2,
    firstDay: new Date('2014-04-20'),
    lastDay: new Date('2014-04-21'),
    pageTitle: 'Test Render',
    outputPath: 'test-render.html',
    isProjectTitles: true,
    projects: [
        {
            title: "Repo 1"
        },
        {
            title: "Repo 2"
        }
    ],
    groups: [
        {
            title: "Default",
            id: "default",
            colors: ['00aa00']
        }
    ]
}

//
renderData(data)
