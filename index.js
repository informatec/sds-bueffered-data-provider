const sql = require('mssql');
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 5050});
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
        console.log(message);

    });

    // ws.send('something');
});


var metaQuery = 'SELECT [PARAM_PERIOD],[PARAM_AGGR],[PARAM_MEASURE] FROM [sds].[dbo].[META_BUFFER_DEFINITION]'
query(metaQuery).then(function(result) {
    result.forEach(function(row) {
        const cb = row;
        var innerSql = 'SELECT [UNIXTS],[VALUE] FROM FCT_' + row.PARAM_MEASURE + '_' + row.PARAM_AGGR + '_' + row.PARAM_PERIOD + ' order by 1';
        query(innerSql).then(function(innerResult) {
            const arr = [];
            innerResult.forEach(function(record) {
                arr.push([record.UNIXTS , record.VALUE]);
            })
            bufferData(arr, cb);
        }).catch(function(err) {
            console.log(err);
        });
    })

}).catch(function(err) {
    console.log(err);
});



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


setTimeout(function() {
    console.log(buffer)
}, 5000)