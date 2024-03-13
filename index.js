window.indexBridge.update((_event, value) =>{
    console.log(value)
  })
  
window.indexBridge.renderToMainOneWay("teste")
async function sendInfo(){

let teste = await window.indexBridge.openFile()
console.log(teste)
}

sendInfo()