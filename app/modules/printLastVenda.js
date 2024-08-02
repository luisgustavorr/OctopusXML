const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');



class Order {
    constructor(saleInfo, vID, pID, local = false) {
        this.saleInfo =saleInfo;
        this.local = local
        this.vID = vID
        console.log(`IMPRESSORA DESEJADA:${vID}`)

    }
    printOrder() {

        this.printConfig()
        this.staticPart()
        this.repeatPart()
        this.printer.cut()
        try {
            let execute = this.printer.execute()
            console.log("Print done!");
            console.log("\n\n\n");
        console.log(this.printer.getText());
        console.log("\n\n\n");

          } catch (error) {
            console.error("Print failed:", error);
          }
    }
    printConfig() {
        this.printer = new ThermalPrinter({
                
            type: PrinterTypes.EPSON,
            characterSet: CharacterSet.PC852_LATIN2,
            removeSpecialCharacters: true, 
            interface: '//localhost/'+this.vID
      
          });
          this.printer.setTypeFontA()
          this.printer.setTextNormal()
          this.printer.alignLeft()
    }
    staticPart() {
        function formatarData(target_data) {
            let data = new Date(target_data);
            let dia = data.getUTCDate()
            let mes = data.getMonth() + 1;
            dia = dia < 10 ? '0' + dia : dia;
            mes = mes < 10 ? '0' + mes : mes;
            let ano = data.getFullYear();
            let dataFormatada = dia + '/' + mes + '/' + ano;
            return dataFormatada
          
          }
        console.log(typeof (this.saleInfo))
        this.printer
            .println("CUPOM DE VENDA")
        this.separador();
        console.log( this.saleInfo)
        const [ dataCompra, horaCompra ] = this.saleInfo["infoVenda"].data.split(" ")
        this.printer
            .println("Data da compra: " + formatarData(dataCompra))
        this.printer
            .println("Hora da compra: " + horaCompra)
        this.separador();
    }
    repeatPart() {
        let valorTotal = 0
        for (const produto of this.saleInfo.infoProds) {
            valorTotal = parseFloat(parseFloat(valorTotal) + (parseFloat(produto.valor)).toFixed(2) * produto.quantidade_produto)
            
            this.printer.println("Produto: "+produto.nome+"\n")
            this.printer.println("Quantidade: "+produto.quantidade_produto+"\n")
            this.printer.println("Valor: R$"+parseFloat(produto.valor).toFixed(2)+"\n")
                this.separador()

        }
        valorTotal = parseFloat(valorTotal).toFixed(2)

        this.printer
        .println("Valor Bruto: R$"+valorTotal+"\n")
        let desc = parseFloat(this.saleInfo["infoVenda"].desconto_em_dinheiro).toFixed(2)
        this.printer
        .println("Desconto: R$"+desc+"\n")
        this.printer
        .println("Valor Total: R$"+parseFloat(valorTotal- desc).toFixed(2)+"\n")

        this.separador()

    }
    separador() {
        this.printer.alignLeft()
        this.printer.println('='.repeat(38));
    }
}
// let data ={"infoProds":[{"id":"1331","colaborador":"4","data":"2024-03-19 04:00:42","valor":"6.9","caixa":"Mix Salgados Prainha Ltda","produto":"1331","forma_pagamento":"Dinheiro","pedido_id":"0","quantidade_produto":"3","venda_dividida_id":"0","troco":"3.1","nome":"PAO DE BATATA COM 12 UNID","codigo":"7890000908573","administrador":"1","preco":"6.9","por_peso":"0","codigo_id":"90857","vendido":"1","ncm":"1905.90.90","cod_grp_financeiro":"40","cst_icms":"102","icms":"18","cst_pis_cofins":"99","json_precos":"{\"Mix Salgados Ltda\":\"6.9\",\"Mix Salgados Prainha Ltda\":\"6.9\",\"Mix Salgados Variados Ltda\":\"3.90\"}","validade":"5"}],"infoVenda":{"data":"2024-03-19 04:00:42"}}

// let teste = new Order(data, 132, 123, true)
// teste.printOrder()
module.exports = Order;
