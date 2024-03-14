window.indexBridge.update((_event, value) =>{
  $("#porcentagem").text(value)
  })
  
  window.indexBridge.changePercentDisplay((_event, value) =>{
    $("#porcentagem").css("display",value)
    })
window.indexBridge.renderToMainOneWay("teste")
async function sendInfo(){

let teste = await window.indexBridge.openFile()
console.log(teste)
}

sendInfo()