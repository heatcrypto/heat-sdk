const config = new heatsdk.Configuration({
  isTestnet: true, 
  baseURL: "http://localhost:7733/api/v1", websocketURL: "ws://localhost:7755/ws/"
})
const sdk = new heatsdk.HeatSDK(config)
var model = null

function initDemo() {
  let secret = $('#secret').val()
  model = createModel(secret)
  setInterval(function () {
    $('#pool-size').text(model.transactions.length)
    $('#realTps').text(model.tps)
  }, 200)
  $('#btn-pool-start').click(function(){
    model.startGeneratingTransactions()
  })
  $('#btn-pool-stop').click(function(){
    model.stopGeneratingTransactions()
  })
  $('#btn-broadcast-start').click(function(){
    var tps = parseInt($('#tps').val())
    model.startBroadcastingTransactions(tps)
  })
  $('#btn-broadcast-stop').click(function(){
    model.stopBroadcastingTransactions()
  })  
}
$(document).ready(initDemo)

function updateBlockchainStatus() {
  sdk.api.get("/blockchain/status")
     .then(function (data) { 
        $('#numberOfTransactions').text(data.numberOfTransactions)
        $('#numberOfUnconfirmedTransactions').text(data.numberOfUnconfirmedTransactions)
        $('#numberOfBlocks').text(data.numberOfBlocks)
     })
     .catch(e => console.error(e))
}
setInterval(updateBlockchainStatus, 2000);

// var generator = null;
// function start() {
//   if (generator)
//     throw new Error('flow error')
//   generator = new Generator()
//   $('#btn-start').prop('disabled', false);
//   $('#btn-pause').prop('disabled', false);
//   console.log(`Preparing ${generator.total} transactions`)
//   generator.prepare().then(transactions => {
//     console.log(`Done preparing ${generator.total} transactions`)
//     generator.start(transactions)
//   })
// }

// function pauze() {
//   if (!generator)
//     throw new Error('flow error')
//   generator.stop()
//   generator = null    
//   $('#btn-start').prop('disabled', false);
//   $('#btn-pause').prop('disabled', true);
// }

// function Generator() {
//   this.secret = $('#secret').val()
//   var tps = parseInt($('#tps').val())
//   if (Number.isNaN(tps)) {
//     console.log('tps is not a number')
//     this.pauze()
//   }
//   this.wait = 1000 / tps
//   this.interval = null
//   this.unique = 0
//   this.total = parseInt($('#total-txn').val())
// }
// Generator.prototype.prepare = function () {
//   var promises = []
//   for (var i=0; i<this.total; i++) {
//     promises.push(
//       sdk.payment("4729421738299387565", "1."+pad(i,5))
//          //.publicMessage("x "+(this.unique++))
//          .sign(this.secret)
//          .then(t => t.getTransaction())
//          .catch(e => console.error(e))
//     )         
//   }
//   return Promise.all(promises)
// }
// Generator.prototype.start = function (txns) {
//   var index = 0, self = this
//   this.interval = setInterval(function () {
//     var transaction = txns[index++]
//     if (!transaction) {
//       self.stop()
//     }
//     else {
//       console.log("send -> txn="+transaction.id)
//       sdk.rpc.broadcast2(transaction)
//              .then(response => {
//                console.log("send -> resp="+response)
//              })
//              .catch(e => console.error(e))
//     }
//   }, this.wait)
// }
// Generator.prototype.stop = function () {
//   clearInterval(this.interval)
//   this.interval = null
// }
// function pad(num, size) {
//   var s = "00000000" + num
//   return s.substr(s.length - size)
// }

