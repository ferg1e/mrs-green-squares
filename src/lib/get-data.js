const simpleGit = require('simple-git')
const { getYyyyMmDd } = require('./get-yyyy-mm-dd.js')

exports.getData = async (configData) => {

    //
    const commitCounts = {}
    const projects = []
    let max = 0
    let firstDay, lastDay
    const dailyTotals = {}

    //
    for(let i = 0; i < configData.repos.length; ++i) {

        //
        const r = configData.repos[i]

        const repoPath = r.dir
            ? r.dir
            : r

        //
        const repo = simpleGit({
            baseDir: repoPath,
            binary: 'git',
        })

        const commits = await repo.log()

        commits.all.forEach(e => {

            //
            const gitCommitDate = e.date.substr(0, 10)
            const d = new Date(gitCommitDate)
            let isValidDate = false

            if(typeof r.date_ranges === 'undefined') {
                isValidDate = true
            }
            else {
                for(let j = 0; j < r.date_ranges.length; ++j) {
                    const dr = r.date_ranges[j]
                    const minDate = typeof dr.min === 'undefined'
                        ? undefined
                        : new Date(dr.min)

                    const maxDate = typeof dr.max === 'undefined'
                        ? undefined
                        : new Date(dr.max)

                    const isInRange = (typeof minDate === 'undefined' || d >= minDate) &&
                        (typeof maxDate === 'undefined' || d <= maxDate)

                    if(isInRange) {
                        isValidDate = true
                        break
                    }
                }
            }

            //
            const authorEmail = e.author_email
            const isCountCommit = isValidDate && (!configData.authors ||
                configData.authors.indexOf(authorEmail) != -1)

            if(isCountCommit) {
                const iy = getYyyyMmDd(d)

                if(!commitCounts[iy]) {
                    commitCounts[iy] = {}
                }

                if(!commitCounts[iy][`p${i}`]) {
                    commitCounts[iy][`p${i}`] = [e.message]
                }
                else {
                    commitCounts[iy][`p${i}`].push(e.message)
                }

                //
                if(!dailyTotals[iy]) {
                    dailyTotals[iy] = 1
                }
                else {
                    ++dailyTotals[iy]
                }

                if(dailyTotals[iy] > max) {
                    max = dailyTotals[iy]
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

        //
        projects.push({
            title: r.title,
            groupId: r.group ? r.group : 'default',
        })
    }

    //
    const outputPath = !configData.output_path
        ? 'index.html'
        : configData.output_path

    //
    return {
        commitCounts,
        max,
        firstDay,
        lastDay,
        outputPath,
        projects,
        groups: typeof configData.groups !== 'undefined'
            ? configData.groups
            : [{
                title: "Default",
                id: "default",
                colors: ['00aa00']
            }]
    }
}
