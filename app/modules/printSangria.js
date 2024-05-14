
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

const { format } = require('date-fns');

// Obtém a data atual

class Order {
    constructor(sangriaInfo, vID, pID, local = false) {
        this.sangriaInfo = sangriaInfo;
        console.log(typeof (this.sangriaInfo))
        this.printer = ""
    }
    printOrder() {
    
            this.textConfig()
            this.staticPart()
            this.printer.cut()
            try {
                let execute = this.printer.execute()
                console.log("Print done!");
              } catch (error) {
                console.error("Print failed:", error);
              }
    }
    textConfig() {
        this.printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: '//localhost/printer_octopus'
      
          });
          this.printer.setTypeFontA()
          this.printer.setTextNormal()
          this.printer.alignLeft()
    }
    staticPart() {
        const currentDate = new Date();

        // Formata a data para o formato desejado
        const formattedDate = format(currentDate, 'yyyy/MM/dd HH:mm:ss');
        this.separador()


        this.printer.println("SANGRIA DE CAIXA", '857')
        this.separador()

        this.printer.println("\nData: " + formattedDate, '857')
        this.printer.println("Valor Sangria: " + this.sangriaInfo.valor_sangria, '857')
        this.printer.println("Novo Valor em Caixa: " + this.sangriaInfo.valor, '857')
        this.printer.println("Cod. colaborador: " + this.sangriaInfo.colaborador, '857')
        this.printer.println("Motivo: " + this.sangriaInfo.mensagem, '857')
        this.printer.println("Assinatura _____________________ \n", '857')
        this.separador()

    }

    separador() {
        this.printer.alignLeft()
        this.printer.println('='.repeat(38), '857');
    }
}
// let teste = new Order(JSON.stringify(data), 132, 123,true)
// teste.printOrder()
module.exports = Order;
