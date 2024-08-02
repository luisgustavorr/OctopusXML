const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');


class Order {
    constructor(orderInfo, vID, pID, local = false) {
        console.log(typeof(orderInfo))
        console.log(orderInfo)

        this.orderInfo =JSON.parse(orderInfo);
        this.local = local
        this.vID = vID
        console.log(`IMPRESSORA DESEJADA:${vID}`)
       
    }
    printOrder() {

        this.textConfig()
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
    textConfig() {
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
        this.printer.println("PEDIDO")

        this.separador()
        let retirada = "NAO"
        if (this.orderInfo.retirada === 1) {
            retirada = "SIM"
        }
        const [ dataPedido, horaPedido ] = this.orderInfo.data_pedido.split(" ")
        const [ dataEntrega, horaEntrega ] = this.orderInfo.data_entrega.split(" ")

        let numero = this.orderInfo.numero_cliente
        let numero_formatado = "("+numero[0]+numero[1]+") "+numero[2]+numero[3]+numero[4]+numero[5]+"-"+numero[6]+numero[7]+numero[8]+numero[9]

        if(numero.length == 11){
             numero_formatado = "("+numero[0]+numero[1]+") "+numero[2]+" "+numero[3]+numero[4]+numero[5]+numero[6]+"-"+numero[7]+numero[8]+numero[9]+numero[10]

        }
        
            this.printer.println("Cliente: " + this.orderInfo.cliente,"857")
            this.printer.println("N.Cliente: " + numero_formatado,"857")
        this.separador()
        
            this.printer.println("Valor Entrada: " + this.orderInfo.valor_entrada,"857")
        this.separador()
        
            this.printer.println("Data do Pedido: " + formatarData(dataPedido))
            this.printer.println("Hora do Pedido: " + horaPedido)
        this.separador()
        
            this.printer.println("Data da Entrega: " + formatarData(dataEntrega))
            this.printer.println("Hora da Entrega: " + horaEntrega)
        this.separador()
        
            this.printer.println("Entrega ? " + retirada)
        if (retirada != "NAO") {
            
                this.printer.println("Endereco: " + this.orderInfo.endereco)
        }
        this.separador()

        
            this.printer.println("-> DOCUMENTO NAO FISCAL <-")
            this.separador()
        
            this.printer.println("Itens")
    }
    repeatPart() {
        let valorTotal = 0
        let produtos = this.orderInfo.produtos
        if(typeof produtos === "string"){
            produtos =JSON.parse(produtos)
        }
        for (const produto of produtos ) {
            valorTotal = parseFloat(parseFloat(valorTotal) + parseFloat(produto.preco)).toFixed(2)
            
                this.printer.println(produto.quantidade + " - " + produto.id.replace(/_/g," ") + " R$"+produto.preco)
        }
        this.separador()

        
        this.printer.println("Valor Total: R$"+valorTotal+"\n\n")
        this.printer.println("Assinatura _____________________ \n", '857')

    }
    separador() {
        this.printer.alignLeft()

        this.printer.println('='.repeat(38));
    }
}
// let data = { "id": "308", "cliente": "Teste", "produtos": "[{\"id\":\"Teste_1\",\"quantidade\":\"1\",\"preco\":\"10.00\"},{\"id\":\"Teste_2\",\"quantidade\":\"1\",\"preco\":\"10.00\"}]", "entregue": "0", "data_entrega": "2024-01-10 14:30:00", "data_pedido": "2024-01-10 14:00:00", "retirada": "0", "forma_pagamento": "Pix", "endereco": "", "caixa": "Mix Salgados Prainha Ltda", "valor_entrada": "10", "metodo_entrada": "Pix", "colaborador": "9841", "numero_cliente": "37984103402", "enviado": "0" }
// let teste = new Order(JSON.stringify(data), 132, 123,true)
// teste.printOrder()
module.exports = Order;
