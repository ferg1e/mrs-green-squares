exports.getYyyyMmDd = (theDate) => {
    return theDate.getFullYear() + '-' +
        ('0' + (theDate.getMonth() + 1)).slice(-2) + '-'  +
        ('0' + theDate.getDate()).slice(-2);
}
