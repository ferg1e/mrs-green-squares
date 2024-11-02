const simpleGit = require('simple-git')
const { getYyyyMmDd } = require('./get-yyyy-mm-dd.js')

exports.getData = async (configData) => {

    //
    const commitCounts = {}
    const projects = []
    let max = 0
    let firstDay, lastDay
    const dailyTotals = {}
    const finalGroups = typeof configData.groups === 'undefined'
        ? [{
            title: "Default",
            id: "default",
            colors: ['00aa00']
        }]

        : configData.groups

    //
    for(let i = 0; i < configData.projects.length; ++i) {

        //
        const project = configData.projects[i]
        const repos = Array.isArray(project.repos)
            ? project.repos
            : [project.repos]

        //
        for(let j = 0; j < repos.length; ++j) {

            //
            const r = repos[j]

            const repoPath = r.dir
                ? r.dir
                : r

            //
            const repo = simpleGit({
                baseDir: repoPath,
                binary: 'git',
            })

            //
            const branches = []

            //only current branch
            if(typeof r.branch === 'undefined') {
                branches.push(false)
            }

            //all branches
            else if(r.branch === '*') {
                await repo.branchLocal().then(data => {
                    branches.push(...data.all)
                })
            }

            //array of branches
            else if(Array.isArray(r.branch)) {
                branches.push(...r.branch)
            }

            //one branch
            else {
                branches.push(r.branch)
            }

            //
            const commitHashes = []

            for(let k = 0; k < branches.length; ++k) {

                //
                const branch = branches[k]
                const commits = branch !== false
                    ? await repo.log({ [branch]:null, '--reverse':null })
                    : await repo.log({ '--reverse':null })

                commits.all.forEach(e => {

                    //
                    if(commitHashes.indexOf(e.hash) !== -1) {
                        return
                    }

                    commitHashes.push(e.hash)

                    //
                    const gitCommitDate = e.date.substr(0, 10)
                    const d = new Date(gitCommitDate)
                    let isValidDate = false

                    if(typeof r.date_ranges === 'undefined') {
                        isValidDate = true
                    }
                    else {
                        for(let m = 0; m < r.date_ranges.length; ++m) {
                            const dr = r.date_ranges[m]
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

                    //
                    let configAuthors = configData.authors
                    const groupAuthors = getGroupAuthors(project.group, finalGroups)

                    if(typeof r.authors !== 'undefined') {
                        configAuthors = r.authors
                    }
                    else if(typeof project.authors !== 'undefined') {
                        configAuthors = project.authors
                    }
                    else if(typeof groupAuthors !== 'undefined') {
                        configAuthors = groupAuthors
                    }

                    const isValidAuthor = typeof configAuthors === 'undefined' ||
                        configAuthors.length === 0 ||
                        configAuthors.indexOf(authorEmail) !== -1

                    //
                    const isCountCommit = isValidDate && isValidAuthor

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
            }
        }

        //
        projects.push({
            title: project.title,
            groupId: project.group ? project.group : 'default',
        })
    }

    //
    const outputPath = !configData.output_path
        ? 'index.html'
        : configData.output_path

    const pageTitle = configData.page_title
        ? configData.page_title
        : undefined

    const isProjectTitles = typeof configData.is_project_titles === 'undefined'
        ? true
        : configData.is_project_titles

    //
    return {
        commitCounts,
        max,
        firstDay,
        lastDay,
        pageTitle,
        outputPath,
        isProjectTitles,
        projects,
        groups: finalGroups
    }
}

//
function getGroupAuthors(groupId, groups) {

    //
    const finalGroupId = typeof groupId === 'undefined'
        ? 'default'
        : groupId

    //
    for(let i = 0; i < groups.length; ++i) {
        if(groups[i].id === finalGroupId) {
            return groups[i].authors
        }
    }
}
