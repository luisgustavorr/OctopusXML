const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');

class Order {
    constructor(closeInfo, vID, pID, local = false) {
        this.closeInfo = closeInfo;
        console.log(closeInfo)
        this.vID = vID
        console.log(`IMPRESSORA DESEJADA:${vID}`)

   
    }
    printOrder() {

            this.textConfig()
            this.staticPart()
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
    textConfig() {
        this.printer = new ThermalPrinter({
                
            type: PrinterTypes.EPSON,
            characterSet: CharacterSet.PC852_LATIN2,
            removeSpecialCharacters: true, 
            interface: '//localhost/'+this.vID
      
          });

        this.printer
        this.printer.setTypeFontA()
        this.printer.setTextNormal()
        this.printer.alignLeft()
    }
    staticPart() {
        this.printer.println("FECHAMENTO DE CAIXA", '857')

        this.separador();
        this.printer.println("Dinheiro Informado: " + this.closeInfo["dinheiro_informadas"], '857')
        this.separador();
        this.printer.println("Cartao Informado: " + this.closeInfo["cartao_informadas"], '857')
        this.separador();
        this.printer.println("Moedas Informadas: " + this.closeInfo["moedas_informadas"], '857')
        this.separador();
        this.printer.println("Pix Informado: " + this.closeInfo["pix_informadas"], '857')
        this.separador();
        this.printer.println("Sangria Informadas: " + this.closeInfo["sangria_informadas"], '857')
        this.separador();
        this.printer.println("Colaborador: " + this.closeInfo["codigo_colaborador_informado_fechamento"] + "\n", '857')
    }

    separador() {
        this.printer.alignLeft()

        this.printer.println('='.repeat(38), '857');
    }
}
// let data = { "id": "308", "cliente": "Teste", "produtos": "[{\"id\":\"Teste_1\",\"quantidade\":\"1\",\"preco\":\"10.00\"},{\"id\":\"Teste_2\",\"quantidade\":\"1\",\"preco\":\"10.00\"}]", "entregue": "0", "data_entrega": "2024-01-10 14:30:00", "data_pedido": "2024-01-10 14:00:00", "retirada": "0", "forma_pagamento": "Pix", "endereco": "", "caixa": "Mix Salgados Prainha Ltda", "valor_entrada": "10", "metodo_entrada": "Pix", "colaborador": "9841", "numero_cliente": "37984103402", "enviado": "0" }
// let teste = new Order(data, 132, 123,true)
// teste.printOrder()
module.exports = Order;
