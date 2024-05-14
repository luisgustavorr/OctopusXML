
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;


class Order {
    constructor(saleInfo, vID, pID, local = false) {
        this.saleInfo =saleInfo;
        this.local = local

    }
    printOrder() {

        this.printConfig()
        this.staticPart()
        this.repeatPart()
        this.printer.cut()
        try {
            let execute = this.printer.execute()
            console.log("Print done!");
          } catch (error) {
            console.error("Print failed:", error);
          }
    }
    printConfig() {
        this.printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: '//localhost/printer_octopus'
      
          });
          this.printer.setTypeFontA()
          this.printer.setTextNormal()
          this.printer.alignLeft()
    }
    staticPart() {
        console.log(typeof (this.saleInfo))
        this.printer
            .println("CUPOM DE VENDA")
        this.separador();
        console.log( this.saleInfo)
        const [ dataCompra, horaCompra ] = this.saleInfo["infoVenda"].data.split(" ")
        this.printer
            .println("Data da compra: " + dataCompra)
        this.printer
            .println("Hora da compra: " + horaCompra)
        this.separador();
    }
    repeatPart() {
        let valorTotal = 0
        for (const produto of this.saleInfo.infoProds) {
            valorTotal = parseFloat(parseFloat(valorTotal) + parseFloat(produto.valor)).toFixed(2)
            
            this.printer.println("Produto: "+produto.nome+"\n")
            this.printer.println("Quantidade: "+produto.quantidade_produto+"\n")
            this.printer.println("Valor: "+produto.valor+"\n")
                this.separador()

        }

        this.printer
        .println("Valor Total: R$"+valorTotal+"\n")
        this.separador()

    }
    separador() {
        this.printer.alignLeft()
        this.printer.println('='.repeat(38));
    }
}
// let data ={"infoProds":[{"id":"1331","colaborador":"4","data":"2024-03-19 04:00:42","valor":"6.9","caixa":"Mix Salgados Prainha Ltda","produto":"1331","forma_pagamento":"Dinheiro","pedido_id":"0","quantidade_produto":"1","venda_dividida_id":"0","troco":"3.1","nome":"PAO DE BATATA COM 12 UNID","codigo":"7890000908573","administrador":"1","preco":"6.9","por_peso":"0","codigo_id":"90857","vendido":"1","ncm":"1905.90.90","cod_grp_financeiro":"40","cst_icms":"102","icms":"18","cst_pis_cofins":"99","json_precos":"{\"Mix Salgados Ltda\":\"6.9\",\"Mix Salgados Prainha Ltda\":\"6.9\",\"Mix Salgados Variados Ltda\":\"3.90\"}","validade":"5"}],"infoVenda":{"data":"2024-03-19 04:00:42"}}

// let teste = new Order(JSON.stringify(data), 132, 123, true)
// teste.printOrder()
module.exports = Order;
