
const sqip = require('sqip');

process.on('message', (msg) => {
    if (msg.action === 'create') {
        const result = sqip({
            filename: msg.data.filePath,
            numberOfPrimitives: msg.data.numberOfPrimitives,
        });
        process.send({
            type: 'created',
            result,
        });
    }
});
