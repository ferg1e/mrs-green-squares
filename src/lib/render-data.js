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
        const numCommits = data.commitCounts[iy]
            ? data.commitCounts[iy]['total']
            : 0

        const percent = numCommits/data.max
        let colorMax = 0
        let colorI = 0

        if(data.commitCounts[iy]) {

            //get the biggest color count
            for(const i in data.commitCounts[iy]) {
                if(i != 'total') {
                    if(data.commitCounts[iy][i] > colorMax) {
                        colorMax = data.commitCounts[iy][i]
                    }
                }
            }

            //select the color with the max count
            //that has the lowest id
            colorI = 999999

            for(const i in data.commitCounts[iy]) {
                if(i != 'total') {
                    const intI = parseInt(i)

                    if(data.commitCounts[iy][i] == colorMax && intI < colorI) {
                        colorI = intI
                    }
                }
            }
        }

        //
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
        const arrayAsString = data.commitCounts[iy]
            ? "['" +
                data.commitCounts[iy].messages
                    .map(e => e.replaceAll("'", "\\'").replaceAll('"', '&quot;'))
                    .join("','") +
                "']"

            : '[]'

        weeksHtml += '<div onmouseup="mouseUp(' +
            arrayAsString + ', \'' + iy +
            '\')" title="' + iy + '" class="day ' +
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

    //sqHtml += '<span id="bookend"></span>'
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
        }

        .pday {
            width: 10px;
            height: 10px;
            display: inline-block;
            border-radius: 2px;
            margin-right: 3px;
        }

        .year {
            margin-bottom: 1em;
            position: relative;
            width: 689px;
        }

        #info {
            position: fixed;
            top: 50px;
            left: 10px;
            width: 300px;
        }

        #commits {
            border: 2px solid gray;
            border-radius: 4px;
            padding: 5px;
            margin-top: 1em;
        }

        #commits > div {
            color: #999999;
            padding: 2em;
        }

        #commits > ul {
            margin: 0;
            padding: .5em;
            list-style-type: none;
        }

        #commits > ul > li {
            margin-bottom: .75em;
        }

        #commits > ul > li:last-child {
            margin-bottom: 0;
        }

        #projects {
            border: 2px solid gray;
            border-radius: 4px;
            padding: 5px;
        }

        #bookend {
            display: inline-block;
            width: 120px;
            height: 10px;
        } `

    //
    for(const i in data.allColors) {
        const jColors = data.allColors[i]
        const sColors = jColors.split(',')

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

    if(data.projects.length > 0) {
        infoHtml += '<div id="projects">'

        for(let i = 0; i < data.projects.length; ++i) {
            const p = data.projects[i]
            let colorsHtml = ''

            if(p.colors.length === 5) {
                for(let j = 4; j >= 1; --j) {
                    colorsHtml += `<span class="pday" style="background:#${p.colors[j]}"></span>`
                }
            }
            else {
                for(let j = 4; j >= 1; --j) {
                    const attrs = 'background: #' + p.colors[0] + '; opacity: ' + (.12 + .22*j) + ';'

                    colorsHtml += `<span class="pday" style="${attrs}"></span>`
                }
            }

            infoHtml += `<div>${colorsHtml}${p.title}</div>`
        }

        infoHtml += '</div>'
    }

    infoHtml += '<div id="commits"><div>Click a square to show commit messages.</div></div>'

    infoHtml += '</div>'

    //
    const js = `<script>
        function mouseUp(messages, dayDate) {
            const commits = document.getElementById('commits')

            if(commits.children.length > 0) {
                commits.removeChild(commits.children[0])
            }

            if(messages.length > 0) {
                const ul = document.createElement('ul')

                for(let i = 0; i < messages.length; ++i) {
                    const li = document.createElement('li')
                    const liText = document.createTextNode(messages[i])
                    li.appendChild(liText)
                    ul.appendChild(li)
                }

                commits.appendChild(ul)
            }
            else {
                const div = document.createElement('div')
                const divText = document.createTextNode('No commits on ' + dayDate + '.')
                div.appendChild(divText)
                commits.appendChild(div)
            }
        }
    </script>`

    //
    fs.writeFile(
        data.outputPath,
        `<!doctype html>
        <html>
            <head>
                ${js}
                ${css}
            </head>
            <body>
                ${sqHtml}
                ${infoHtml}
            </body>
        </html>`,
        err => {})
}
