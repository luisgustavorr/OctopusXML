window.indexBridge.update((_event, value) => {
  $("#porcentagem").text(value)
})

window.indexBridge.changePercentDisplay((_event, value) => {
  $("#porcentagem").css("display", value)
})
window.indexBridge.renderToMainOneWay("teste")
async function enviarFormulário() {

  // let changePort = await window.indexBridge.restartServer(3000)
  let busyPort = await window.indexBridge.checkPort(3000)
  console.log(busyPort)
  if (busyPort) {
    alertar("Porta Ocupada, tente outra")
  } else {
    let changePort = await window.indexBridge.restartServer(3000)
  }

}
$("#config_father input").blur(
  async function (e) {
      if ($(this).val() != "") {

      } else {
        alertar("Favor insira um valor")
      }



  });
enviarFormulário()