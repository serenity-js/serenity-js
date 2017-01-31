module.exports.listOf = function(commaSeparatedValues ) {
    return commaSeparatedValues.split(',').map(i => i.trim());
}
