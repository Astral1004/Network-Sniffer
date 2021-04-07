const Pacets = require('../models/sortedNetworkCollection');
const moment = require('moment');
const mongoose = require('mongoose');

module.exports = async function (io) {
  io.on('connection', async (socket) => {
    socket.on('disconnect', function () {});
    socket.on('podkl_statistics', async () => {

      let countPackets = await Pacets.find().countDocuments()
        .catch((err) => {
          console.log();
        });

      //    async function del(){
      //      await Pacets.deleteMany({});
      //       countPackets=0;
      //    }

      //  setInterval(async ()=>{
      //      del();
      //  },6000000)

      setInterval(async () => {

        let countPacketsNew = await Pacets.find()
          .countDocuments()
          .catch((err) => {
            console.log();
          });
        socket.emit('countDIV', countPacketsNew);

        if (countPacketsNew == countPackets) {
          socket.emit('countZero');
        }

        if (countPacketsNew > countPackets) {
          countPackets = countPacketsNew;

          try {
            await Pacets.aggregate(
              [{
                  $match: {
                    'array.protocol': {
                      $in: ['tcp', 'UDP,', 'ICMP'],
                    },
                  },
                },
                {
                  $match: {
                    date: {
                      $gte: ((new Date().getTime() / 1000) | 0) - 4,
                    },
                  },
                },
                {
                  $group: {
                    _id: {
                      protocol: '$array.protocol'
                    },
                    total: {
                      $sum: '$size'
                    },
                    count: {
                      $sum: '$count'
                    },
                    date: {
                      $last: "$date"
                    }
                  }
                },
                {
                  $project: {
                    array: '$_id',
                    _id: {
                      $arrayElemAt: ['$dups', 0]
                    },
                    count: {
                      $sum: '$count'
                    },
                    size: '$total',
                    date: '$date',
                  },
                },
                {
                  $sort: {
                    _id: 1
                  }
                },
              ],
              (err, results) => {
                socket.emit('graph', results);
                console.log(err);
              }
            );
          } catch (err) {
            console.log(err);
          }

          try {
            let testNumber = 0;
            let ss = await Pacets.aggregate(
              [{
                  $sort: {
                    _id: 1
                  }
                },
                {
                  $match: {
                    'array.protocol': {
                      $in: ['tcp', 'UDP,', 'ICMP'],
                    },
                  },
                },
                {
                  $match: {
                    date: {
                      $gte: ((new Date().getTime() / 1000) | 0) - 4,
                    },
                  },
                },
                {
                  $group: {
                    _id: {
                      protocol: '$array.protocol',
                      IpTO: "$array.IpTO",
                      IpFROM: "$array.IpFROM"
                    },
                    total: {
                      $sum: '$size'
                    },
                    count: {
                      $sum: '$count'
                    },
                    date: {
                      $last: "$date"
                    }
                  },
                },
                {
                  $project: {
                    array: '$_id',
                    _id: {
                      $arrayElemAt: ['$dups', 0]
                    },
                    count: '$count',
                    size: '$total',
                    date: '$date',
                  },
                },

                {
                  $limit: 300
                },
                {
                  $skip: testNumber
                },
              ],
              (err, results) => {
                console.log(err);
                socket.emit('packetsResult', results);
              }
            );
            testNumber = +countPackets;
          } catch (err) {
            console.log(err);
          }
        }
      }, 3000);
    });

    socket.on('click_vpn', (data) => {
      const spawn = require('child_process').exec;
      const ds = spawn('systemctl', ['restart', 'openvpn@server']);
      ds.stdout.on('data', (data) => {
        status_openvpn();
      });
      ds.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        status_openvpn();
      });
      ds.on('close', (code) => {
        console.log(`child process exited with code2 ${code}`);
        status_openvpn();
      });

      function status_openvpn() {
        const ls = spawn('systemctl', ['status', 'openvpn']);
        ls.stdout.on('data', (data) => {
          socket.emit('response_vpn', ` ${data}`);
        });

        ls.stderr.on('data', (data) => {
          console.log(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
          console.log(`child process exited with code1 ${code}`);
        });
      }
    });
  });
};