
var potrace = require('potrace'),
    fs = require('fs');

let imagePath = '';

let params = {
    color: '#cccccc',
    threshold: 120,
    flat: true,
    u: 2,
    longCoding: true,
    turdSize: 100,
    optTolerance: .4,
    turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
};

potrace.trace(imagePath, params, function(err, svg) {
    if (err) throw err;
    fs.writeFileSync('./output.svg', svg);
});

(async e => {

})();