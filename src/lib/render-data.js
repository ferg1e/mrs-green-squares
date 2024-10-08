const fs = require('fs')
const { getYyyyMmDd } = require('./get-yyyy-mm-dd.js')
const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

exports.renderData = (data) => {

    //
    const currentDayToDraw = new Date(data.firstDay.getFullYear() + '-01-01')
    const lastDayToDraw = new Date(data.lastDay.getFullYear() + '-12-31')

    let sqHtml = '<div class="sqs">'
    let divOpen = false
    let divOpenYear = false
    let weeksDays, weeksHtml
    let isFirstYear = true

    //
    while(currentDayToDraw <= lastDayToDraw) {

        //
        if(!divOpenYear) {
            sqHtml += '<div class="year">' +
                '<label class="lyear">' +
                currentDayToDraw.getFullYear() +
                '</label>'

            divOpenYear = true
        }

        //
        if(!divOpen) {
            sqHtml += '<div class="week">'
            divOpen = true

            //
            weeksDays = []
            weeksHtml = ''
        }

        //
        weeksDays.push(currentDayToDraw.getDate())

        const iy = getYyyyMmDd(currentDayToDraw)

        let numCommits = 0

        if(data.commitCounts[iy]) {
            for(const i in data.commitCounts[iy]) {
                numCommits += data.commitCounts[iy][i].length
            }
        }

        const percent = numCommits/data.max

        let colorI = 0
        let commitsI = ''
        let commitsMax = 0

        if(data.commitCounts[iy]) {
            //get key with most commits
            for(const i in data.commitCounts[iy]) {
                if(data.commitCounts[iy][i].length > commitsMax) {
                    commitsMax = data.commitCounts[iy][i].length
                    commitsI = i
                }
            }

            //get the project index out of the key
            const projectI = parseInt(commitsI.substring(1))
            //get the group index using the project group id
            const p = data.projects[projectI]
            const groupId = typeof p.groupId === 'undefined'
                ? 'default'
                : p.groupId

            for(let i = 0; i < data.groups.length; ++i) {
                const g = data.groups[i]

                if(groupId === g.id) {
                    colorI = i
                    break
                }
            }
        }

        let cssClass = 'c' + colorI.toString()

        //
        if(percent <= 0) {
            cssClass += '-0'
        }
        else if(percent > 0 && percent <= .25) {
            cssClass += '-1'
        }
        else if(percent > .25 && percent <= .5) {
            cssClass += '-2'
        }
        else if(percent > .5 && percent <= .75) {
            cssClass += '-3'
        }
        else if(percent > .75) {
            cssClass += '-4'
        }

        //
        let arrayAsString = '[]'

        if(data.commitCounts[iy]) {
            arrayAsString = '['
            const objStrings = []

            for(const i in data.commitCounts[iy]) {
                const projectI = parseInt(i.substring(1))
                const projectTitle = typeof data.projects[projectI].title === 'undefined'
                    ? ''
                    : data.projects[projectI].title

                objStrings.push("{title: '" +
                    projectTitle.replaceAll("'", "\\'").replaceAll('"', '&quot;') +
                    "', messages: ['" +
                    data.commitCounts[iy][i]
                        .map(e => e.replaceAll("'", "\\'").replaceAll('"', '&quot;'))
                        .join("','") +
                    "']}")
            }

            arrayAsString += objStrings.join()
            arrayAsString += ']'
        }

        const commitPhrase = numCommits === 1
            ? '1 commit'
            : `${numCommits} commits`

        const titleAttrValue = `${commitPhrase} on ${iy}`

        weeksHtml += '<div onmouseup="mouseUp(' +
            arrayAsString + ', \'' + iy +
            '\', ' + data.isProjectTitles + ')" title="' +
            titleAttrValue + '" class="day ' +
            cssClass + '"></div>'

        if(currentDayToDraw.getDay() == 6) {

            //
            if(weeksDays.indexOf(8) != -1) {
                const monthLabel = (weeksDays.length == 7 && isFirstYear)
                    ? '<label class="lmonth">' +
                        monthLabels[currentDayToDraw.getMonth()] +
                        '</label>'

                    : ''

                weeksHtml = monthLabel + weeksHtml
            }

            sqHtml += weeksHtml + '</div>'
            divOpen = false
        }

        //
        const isDec31 = currentDayToDraw.getMonth() == 11 && currentDayToDraw.getDate() == 31

        if(isDec31) {
            if(divOpen) {
                sqHtml += weeksHtml + '</div>'
                divOpen = false
            }

            sqHtml += '</div>'
            divOpenYear = false
            isFirstYear = false
        }

        //
        currentDayToDraw.setDate(currentDayToDraw.getDate() + 1)
    }

    //
    if(divOpen) {
        sqHtml += weeksHtml + '</div>'
    }

    if(divOpenYear) {
        sqHtml += '</div>'
    }

    sqHtml += '</div>'

    //
    let css = `<style>
        .sqs {
            position: relative;
            white-space: nowrap;
            margin: 60px 0 0 330px;
        }

        .week {
            display: inline-block;
            position: relative;
        }

        .sqs > div > div:last-of-type {
            position: absolute;
            top: 0;
        }

        .lmonth {
            font-size: 12px;
            color: #333333;
            position: absolute;
            top: -18px;
            margin-left: 1px;
        }

        .lyear {
            font-size: 16px;
            color: #333333;
            position: absolute;
            top: 40%;
            right: -68px;
        }

        .day {
            width: 10px;
            height: 10px;
            border-radius: 2px;
            margin: 0 3px 3px 0;
            cursor: pointer;
        }

        .pday {
            width: 10px;
            height: 10px;
            display: inline-block;
            border-radius: 2px;
            margin-right: 3px;
        }

        .year {
            margin-bottom: 1rem;
            position: relative;
            width: 689px;
        }

        #info {
            position: fixed;
            top: 50px;
            left: 10px;
            width: 300px;
        }

        #info > h1 {
            margin: 0 0 1rem 0;
            padding: 0;
            font-size: 1.5rem;
            font-weight: normal;
        }

        #commits {
            border: 2px solid gray;
            border-radius: 4px;
            padding: 5px;
            max-height: 400px;
            overflow: auto;
        }

        #commits .simple-message {
            color: #999999;
            padding: 2rem;
        }

        #commits .commits-message {
            padding: .5rem;
        }

        #commits h2 {
            padding: 0;
            margin: 0 0 .5rem 0;
            font-size: 1.125rem;
            font-weight: normal;
            color: #555555;
        }

        #commits h3 {
            padding: 0;
            margin: .75rem 0 .5rem 0;
            font-size: 1.25rem;
        }

        #commits h3:first-of-type {
            margin-top: 0;
        }

        #commits ul > li {
            margin-bottom: .75rem;
        }

        #commits ul > li:last-child {
            margin-bottom: 0;
        }

        #groups {
            border: 2px solid gray;
            border-radius: 4px;
            padding: 5px;
            margin-bottom: 1rem;
        }

        #bookend {
            display: inline-block;
            width: 120px;
            height: 10px;
        }

        #width-err {
            display: none;
        }
        
        @media screen and (max-width: 1200px) {
            .sqs, #info {
                display: none;
            }

            #width-err {
                display: block;
            }
        }`

    if(data.isProjectTitles) {
        css += `
            #commits ul {
                margin: 0;
                padding: 0;
                list-style-type: none;
            }`
    }
    else {
        css += `
            #commits ul {
                margin: 0 0 .75rem 0;
                padding: 0;
                list-style-type: none;
            }
                
            #commits ul:last-of-type {
                margin: 0 0 0 0;
            }`
    }


    //
    for(const i in data.groups) {
        const sColors = data.groups[i].colors

        if(sColors.length == 5) {
            for(const j in sColors) {
                css += '.c' + i + '-' + j +
                    ' { background: #' +
                    sColors[j] +
                    ';} '
            }
        }
        else {
            const controlColor = (sColors.length > 0)
                ? sColors[0]
                : '1E6823'

            for(let j = 0; j < 5; ++j) {

                const attrs = (j == 0)
                    ? 'background: #eeeeee;'
                    : 'background: #' + controlColor + '; opacity: ' + (.12 + .22*j) + ';'

                css += '.c' + i + '-' + j +
                    ' { ' +
                    attrs +
                    ' } '
            }
        }
    }

    //
    css += '</style>'

    //
    let infoHtml = '<div id="info">'

    if(data.pageTitle) {
        infoHtml += `<h1>${data.pageTitle}</h1>`
    }

    if(data.groups.length > 1) {
        infoHtml += '<div id="groups">'

        for(let i = 0; i < data.groups.length; ++i) {
            const g = data.groups[i]
            let colorsHtml = ''

            if(g.colors.length === 5) {
                for(let j = 4; j >= 1; --j) {
                    colorsHtml += `<span class="pday" style="background:#${g.colors[j]}"></span>`
                }
            }
            else {
                for(let j = 4; j >= 1; --j) {
                    const attrs = 'background: #' + g.colors[0] + '; opacity: ' + (.12 + .22*j) + ';'

                    colorsHtml += `<span class="pday" style="${attrs}"></span>`
                }
            }

            infoHtml += `<div>${colorsHtml}${g.title}</div>`
        }

        infoHtml += '</div>'
    }

    infoHtml += '<div id="commits"><div class="simple-message">Click a square to show commit messages.</div></div>'

    infoHtml += '</div>'

    //
    const js = `<script>
        function mouseUp(messages, dayDate, isProjectTitles) {
            const commits = document.getElementById('commits')

            if(commits.children.length > 0) {
                commits.removeChild(commits.children[0])
            }

            if(messages.length > 0) {
                const rootDiv = document.createElement('div')
                rootDiv.className = 'commits-message'

                const h2 = document.createElement('h2')
                const h2Text = document.createTextNode(dayDate)

                h2.appendChild(h2Text)
                rootDiv.appendChild(h2)

                for(let i = 0; i < messages.length; ++i) {
                    const m = messages[i]

                    if(isProjectTitles) {
                        const h3 = document.createElement('h3')
                        const h3Text = document.createTextNode(m.title)

                        h3.appendChild(h3Text)
                        rootDiv.appendChild(h3)
                    }

                    const ul = document.createElement('ul')

                    for(let j = 0; j < m.messages.length; ++j) {
                        const li = document.createElement('li')
                        const liText = document.createTextNode(m.messages[j])
                        li.appendChild(liText)
                        ul.appendChild(li)
                    }

                    rootDiv.appendChild(ul)
                }

                commits.appendChild(rootDiv)
            }
            else {
                const div = document.createElement('div')
                const divText = document.createTextNode('No commits on ' + dayDate + '.')

                div.className = 'simple-message'
                div.appendChild(divText)
                commits.appendChild(div)
            }
        }
    </script>`

    //
    const mobileBlurb = `<div id="width-err">Browser needs to be at least 1,200 pixels wide in order to view this app.</div>`

    //
    fs.writeFile(
        data.outputPath,
        `<!doctype html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width,initial-scale=1">
                ${js}
                ${css}
            </head>
            <body>
                ${sqHtml}
                ${infoHtml}
                ${mobileBlurb}
            </body>
        </html>`,
        err => {})
}
