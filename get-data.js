const simpleGit = require('simple-git')
const { getYyyyMmDd } = require('./get-yyyy-mm-dd.js')

exports.getData = async (configData) => {

    //
    const commitCounts = {}
    const allColors = []
    let max = 0
    let firstDay, lastDay

    //
    for(let i = 0; i < configData.repos.length; ++i) {

        //
        const r = configData.repos[i]

        const repoPath = r.dir
            ? r.dir
            : r

        let colors = r.colors
            ? r.colors
            : ['eeeeee', 'D6E685', '8CC665', '44A340', '1E6823']

        colors = colors.join()

        let colorI = allColors.indexOf(colors)

        if(colorI == -1) {
            allColors.push(colors)
            colorI = allColors.indexOf(colors)
        }

        const colorIndexStr = colorI.toString()

        //
        const repo = simpleGit({
            baseDir: repoPath,
            binary: 'git',
        })

        const commits = await repo.log()

        commits.all.forEach(e => {
            const authorEmail = e.author_email
            const isCountCommit = !configData.authors ||
                configData.authors.indexOf(authorEmail) != -1

            if(isCountCommit) {
                const d = new Date(e.date)
                const iy = getYyyyMmDd(d)

                if(!commitCounts[iy]) {
                    commitCounts[iy] = {}
                    commitCounts[iy]['total'] = 1
                }
                else {
                    ++commitCounts[iy]['total']
                }

                if(!commitCounts[iy][colorIndexStr]) {
                    commitCounts[iy][colorIndexStr] = 1
                }
                else {
                    ++commitCounts[iy][colorIndexStr]
                }

                //
                if(commitCounts[iy]['total'] > max) {
                    max = commitCounts[iy]['total']
                }

                //
                if(!firstDay || (d < firstDay)) {
                    firstDay = d
                }

                if(!lastDay || (d > lastDay)) {
                    lastDay = d
                }
            }
        })
    }

    //
    return {
        commitCounts,
        allColors,
        max,
        firstDay,
        lastDay,
    }
}