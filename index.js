const sql = require('mssql');
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 5051});
const connection = sql.connect({
    user: 'sa',
    password: 'test1234',
    server: 'ITECNP-PAG', // You can use 'localhost\\instance' to connect to named instance
    database: 'SDS',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
});
const buffer = {};

const sqlCon = new Promise(function (resolve, reject) {
    connection.then(function (con) {
        resolve(con);
    }).catch(function (err) {
        reject(err);
    });

});


wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        var params = JSON.parse(message)
        if ( buffer[params.period] === undefined || buffer[params.period][params.aggrLvl] == undefined || buffer[params.period][params.aggrLvl][params.measure] == undefined ) {
            fillBuffer({PARAM_MEASURE: params.measure ,PARAM_AGGR: params.aggrLvl, PARAM_PERIOD: params.period})
                .then(function() {
                    ws.send(JSON.stringify({
                        id: params.id,
                        data: buffer[params.period][params.aggrLvl][params.measure]
                    }));
                });
        } else {
            ws.send(JSON.stringify({
                id: params.id,
                data: buffer[params.period][params.aggrLvl][params.measure]
            }));
        }
    });

    // ws.send('something');
});

var progrress = 0;
var totalProgress = 0;

var metaQuery = 'SELECT [PARAM_PERIOD],[PARAM_AGGR],[PARAM_MEASURE] FROM [sds].[dbo].[META_BUFFER_DEFINITION]'
query(metaQuery).then(function(result) {
    console.log(new Date(), 'Start Buffering!');
    console.log(new Date(), 'Progress 0.0% of 100%');

    totalProgress = result.length;
    result.forEach(function(row) {
        fillBuffer(row);
    })

}).catch(function(err) {
    console.log(err);
});

function fillBuffer(record) {
    return new Promise(function(resolve, reject) {
        var innerSql = 'SELECT [UNIXTS],[VALUE] FROM FCT_' + record.PARAM_MEASURE + '_' + record.PARAM_AGGR + '_' + record.PARAM_PERIOD + ' order by 1';
        query(innerSql).then(function(innerResult) {
            const arr = [];
            innerResult.forEach(function(record) {
                arr.push([+record.UNIXTS , record.VALUE]);
            });
            bufferData(arr, record);
            progrress++;
            console.log(new Date(), 'Progress '+ ((progrress / totalProgress) * 100).toFixed(1) + '% of 100%');

            resolve(true);
        }).catch(function(err) {
            console.log(err);
        });
    });
}

function query(qu) {
    return new Promise(function(resolve, reject) {
        sqlCon.then(function (con) {
            con.request().query(qu).then(function (result) {
                resolve(result.recordset);
            }).catch(function (err) {
                reject(err);
            });
        })
    })
}

function bufferData(data, def) {
    if(buffer[def.PARAM_PERIOD] === undefined) {
        buffer[def.PARAM_PERIOD] = {}
    }

    if(buffer[def.PARAM_PERIOD][def.PARAM_AGGR] === undefined) {
        buffer[def.PARAM_PERIOD][def.PARAM_AGGR] = {}
    }

    buffer[def.PARAM_PERIOD][def.PARAM_AGGR][def.PARAM_MEASURE] = data;
}


process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Prevent node exiting...");
});