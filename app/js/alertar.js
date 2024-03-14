function alertar(message,title = "Alerta!",size = "500px",icon = null){
    $.alert({
        title: title,
        icons:icon,
        boxWidth: size,
        useBootstrap: false,
        content: message,
      });
}