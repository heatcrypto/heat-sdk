var MAIN_MODEL = null
function createModel(secret) {
  if (MAIN_MODEL) throw new Error('Overwriting global final MAIN_MODEL')
  MAIN_MODEL = {
    config: {
      secret: secret,
      index: 0
    },
    tps: 0,
    transactions: [],
    smartTimer: {
      createTimer: function () {
        let start = Date.now
        return 
      }
    },
    startGeneratingTransactions: function () {
      if (this.isGeneratingTransactions) throw new Error('invalid')
      this.isGeneratingTransactions = true
      this.stopGenerating = fillWithTransactions(this.config, this.transactions)
    },
    stopGeneratingTransactions: function () {
      if (!this.isGeneratingTransactions) throw new Error('invalid')
      this.isGeneratingTransactions = false
      this.stopGenerating()
      this.stopGenerating = null
    },
    startBroadcastingTransactions: function (transactionsPerSecond) {
      if (this.isBroadcastingTransactions) throw new Error('invalid')      
      this.isBroadcastingTransactions = true
      let milliseconds = 1000 / transactionsPerSecond
      let interval = setInterval(this.broadcastNext.bind(this), milliseconds)
      this.stopBroadcasting = function () {
        clearInterval(interval)
        interval = null
      }
    },
    stopBroadcastingTransactions: function () {
      if (!this.isBroadcastingTransactions) throw new Error('invalid')        
      this.isBroadcastingTransactions = false
      this.stopBroadcasting()
      this.stopBroadcasting = null
    },    
    broadcastNext: function () {
      if (this.pendingBroadcast) return      
      let transaction = this.transactions[0]
      if (!transaction) return
      this.transactions.splice(0, 1)
      let done = this.smartTimer.startTimer()
      this.pendingBroadcast = 
          broadcastTransaction(transaction)
            .then(function (response) {
              console.log(response)
              MAIN_MODEL.pendingBroadcast = null
              done()

              // let totalTime = Date.now() - startTime
              // MAIN_MODEL.tps = 1000 / totalTime
            })
            .catch(function (e) {
              console.error(e)
              MAIN_MODEL.pendingBroadcast = null
              done()
            })
    }
  }
  return MAIN_MODEL
}

function SmartTimer() {
  this.start = Date.now()
}
SmartTimer.prototype.startTimer = function () {
  
}

/**
 * Fill an array with transactions async, stop process with returned function 
 * 
  * @param config {
 *   secret: string,
 *   index: number
 * }
 * @param array we add transactions here
 */
function fillWithTransactions(config, array) {
  let whileVar = {
    hasStopped: false
  }
  generateWhile(config, whileVar, array)
  return function () {
    whileVar.hasStopped = true
  }
}

/**
 * Recursive internal method that keeps generating transactions until 
 * its stopped from the outside
 */
function generateWhile(config, whileVar, array) {
  if (whileVar.hasStopped) return
  config.index += 1;
  generateTransaction(config)
    .then(function(t) {
      array.push(t)
      setTimeout(function () {
        generateWhile(config, whileVar, array)
      }, 0)
    })
    .catch(e => {
      console.error(e)
      setTimeout(function () {
        generateWhile(config, whileVar, array)      
      }, 0)
    }
  )
}

/**
 * Generate a random transaction
 * 
 * @param config {
 *   secret: string,
 *   index: number
 * }
 */
function generateTransaction(config) {
  return sdk.payment("4729421738299387565", "1."+pad(config.index,5))
             //.publicMessage("x "+(this.unique++))
            .sign(config.secret)
            .then(t => t.getTransaction())
            .catch(e => console.error(e))
}

/**
 * Broadcast a transaction, return promise 
 * 
 * @param transaction TransactionImpl
 */
function broadcastTransaction(transaction) {
  return sdk.rpc.broadcast2(transaction)
            .then(response => response)
            .catch(e => console.error(e))
}

function pad(num, size) {
  var s = "00000000" + num
  return s.substr(s.length - size)
}
