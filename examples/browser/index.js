$(document).ready(function () {
  let sdk = new heatsdk.HeatSDK();
  getLastBlock(sdk)
  getLastTransactions(sdk)
  setupSecretGenerator(sdk)
  setupEncryptText(sdk)
  setupCreateTransaction(sdk)
})

function getLastBlock(sdk) {
  function refresh() {
    sdk.api.get("/blockchain/status").then(function (data) {    
      let height = data.lastBlockchainFeederHeight;
      let date = sdk.utils.timestampToDate(data.lastBlockTimestamp)
      $('#1 #block-height').text(height)
      $('#1 #date').text(date)
    }).catch(function (error) {
      $('#1 #error').text(JSON.stringify(error))
    })
  }
  refresh()
  $('#1 #refresh').click(function (){ 
    $('#1 #block-height').text("loading ...")
    $('#1 #date').text("loading ...")
    setTimeout(function () {
      refresh() 
    }, 500)    
  })
}

function getLastTransactions(sdk) {
  function refresh() {
    sdk.api.get("/blockchain/transactions/all/0/100").then(function (data) {
      let transactionJSON;
      for (let i=0; i<data.length; i++) {
        let transaction = data[i]
        let attachment = transaction.attachment
        if (!sdk.utils.isDefined(attachment['version.EncryptedMessage']) && 
            !sdk.utils.isDefined(attachment['version.PublicKeyAnnouncement']) && 
            !sdk.utils.isDefined(attachment['version.EncryptToSelfMessage'])){
          transactionJSON = transaction
          break
        }
      }
      if (!transactionJSON)
        console.log("could not find a payment without encrypted message")

      $("#2 #json").text(JSON.stringify(transactionJSON, null, 2));
      let parsedFromJSONTransaction = sdk.parseTransactionJSON(transactionJSON)
      let bytesAsHex = parsedFromJSONTransaction.getBytesAsHex()
      $("#2 #bytes").text(bytesAsHex || 'nothing');
      let parsedFromBytesTransaction = sdk.parseTransactionBytes(bytesAsHex)
      let backToJson = parsedFromBytesTransaction.getJSONObject()
      $("#2 #parsed").text(JSON.stringify(backToJson, null, 2) || 'nothing');
      let verified2 = parsedFromBytesTransaction.verifySignature()
      $("#3 #valid").text(verified2);
    }).catch(function (error) {
      console.error(error)
      $('#2 #error').text(JSON.stringify(error))
    })
  }
  refresh()
  $('#2 #refresh').click(function (){ 
    $("#2 #json").text("loading ..");
    $("#2 #bytes").text("loading ..");
    $("#2 #parsed").text("loading ..");
    $("#3 #valid").text("loading ..");
    setTimeout(function () {
      refresh() 
    }, 500) 
  })
}

function setupSecretGenerator(sdk) {
  function generate() {
    let secret = sdk.secretGenerator.generate()
    let publickey = sdk.crypto.secretPhraseToPublicKey(secret)
    let account = sdk.crypto.getAccountIdFromPublicKey(publickey)
    $('#4 #secret').text(secret)
    $('#4 #publickey').text(publickey)
    $('#4 #account').text(account)
  }
  generate()
  $('#4 #btn').click(function (){ generate() })
}

function setupEncryptText(sdk) {
  function encrypt() {
    let key = $('#5 #key').val()
    let plain = $('#5 #plain').val()
    $('#5 #cipher').val(sdk.passphraseEncrypt(plain, key))    
  }
  function decrypt() {
    let key = $('#5 #key').val()
    let cipher = $('#5 #cipher').val()
    $('#5 #plain').val('decrypting ...')
    setTimeout(function () {
      $('#5 #plain').val(sdk.passphraseDecrypt(cipher, key))    
    }, 500)    
  }
  $('#5 #key').val(sdk.secretGenerator.generate())
  $('#5 #plain').val("saving the world with heat-sdk")
  encrypt()
  $('#5 #btn-encr').click(function (){ encrypt() })
  $('#5 #btn-decr').click(function (){ decrypt() })  
}

function setupCreateTransaction(sdk) {
  function create() {
    let key = $('#6 #key').val()
    let recipient = $('#6 #recipient').val()
    let amount = $('#6 #amount').val()
    let transaction = sdk.payment(recipient, amount).sign(key).getTransaction()
    $('#6 #bytes').val(transaction.getBytesAsHex())
  }   

  $('#6 #key').val(sdk.secretGenerator.generate())
  $('#6 #recipient').val("111111")
  $('#6 #amount').val("0.01")
  create();
  $('#6 #update').click(function (){ 
    $('#6 #bytes').val("creating transaction ..")
    setTimeout(function () {
      create() 
    }, 500) 
  })
}