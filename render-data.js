const fs = require('fs')
const { getYyyyMmDd } = require('./get-yyyy-mm-dd.js')
const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

exports.renderData = (data) => {

    //
    const currentDayToDraw = data.firstDay
    currentDayToDraw.setDate(currentDayToDraw.getDate() - 3)

    const lastDayToDraw = data.lastDay
    lastDayToDraw.setDate(lastDayToDraw.getDate() + 3)

    let sqHtml = '<div class="sqs">'
    let divOpen = false
    let weeksDays, weeksHtml

    //
    while(currentDayToDraw <= lastDayToDraw) {
        if(!divOpen) {
            sqHtml += '<div>'
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
        weeksHtml += '<div class="' + cssClass + '"></div>'

        if(currentDayToDraw.getDay() == 6) {

            //
            if(weeksDays.indexOf(8) != -1) {
                const monthLabel = (weeksDays.length == 7)
                    ? '<label class="month">' +
                        monthLabels[currentDayToDraw.getMonth()] +
                        '</label>'

                    : ''

                //
                const yearLabel = (currentDayToDraw.getMonth() == 6)
                    ? '<label class="year">' + currentDayToDraw.getFullYear() + '</label>'
                    : ''

                weeksHtml = yearLabel + monthLabel + weeksHtml
            }

            sqHtml += weeksHtml + '</div>'
            divOpen = false
        }

        //
        currentDayToDraw.setDate(currentDayToDraw.getDate() + 1)
    }

    //
    if(divOpen) {
        sqHtml += weeksHtml + '</div>'
    }

    sqHtml += '<span id="bookend"></span>'
    sqHtml += '</div>'

    //
    let css = `<style>
        body {
            margin-left: 120px;
            margin-top: 240px;
        }

        .sqs {
            position: relative;
            white-space: nowrap;
            margin-top: 52px;
        }

        .sqs > div {
            display: inline-block;
            position: relative;
        }

        .sqs > div:last-of-type {
            position: absolute;
            top: 0;
        }

        .sqs > div > label.month {
            font-size: 12px;
            color: #acacac;
            position: absolute;
            top: -15px;
            margin-left: 1px;
        }

        .sqs > div > label.year {
            font-size: 16px;
            color: #777777;
            position: absolute;
            top: -42px;
            left: -50%;
        }

        .sqs > div > div {
            width: 10px;
            height: 10px;
            margin: 0 0 1px 1px;
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
    fs.writeFile(
        'index.html',
        `<!doctype html>
        <html>
            <head>${css}</head>
            <body>
                ${sqHtml}
            </body>
        </html>`,
        err => {})
}
