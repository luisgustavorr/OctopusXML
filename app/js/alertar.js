function alertar(message,title = "Alerta!",size = "500px"){
    $.alert({
        title: title,
        boxWidth: size,
        useBootstrap: false,
        content: message,
      });
}