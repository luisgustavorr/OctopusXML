const fs = require("fs");
const convert = require('xml-js');
const escpos = require('escpos');
escpos.Network = require('escpos-network');




class DanfcePOS {
    constructor(xml_Path, device) {
        this.xmlNFE = xml_Path;
        this.NFeJSON = {};
        this.printer = "";
        this.device = new escpos.Network(device);
    }

    printAll() {
        this.printer = new escpos.Printer(this.device);

        this.device.open((err) => {
            // if (err) {
            //     console.error(err);
            //     return;
            // }
            this.loadNFCe();
            this.firstPart();
        });
    }

    loadNFCe() {
        let xml = this.xmlNFE;
        if (fs.existsSync(xml)) {
            xml = fs.readFileSync(xml).toString();
        } else {
         
            return false;
        }
        let nfe = convert.xml2json(xml, { compact: true, spaces: 4 });
        this.NFeJSON = JSON.parse(nfe);
    }

    firstPart() {
        let razao = this.NFeJSON.nfeProc.NFe.infNFe.emit.xNome._text;
        let cnpj = this.NFeJSON.nfeProc.NFe.infNFe.emit.CNPJ._text;
        let ie = this.NFeJSON.nfeProc.NFe.infNFe.emit.IE._text;
        let log = this.NFeJSON.nfeProc.NFe.infNFe.emit.enderEmit.xLgr._text;
        let nro = this.NFeJSON.nfeProc.NFe.infNFe.emit.enderEmit.nro._text;
        let bairro = this.NFeJSON.nfeProc.NFe.infNFe.emit.enderEmit.xBairro._text;
        let mun = this.NFeJSON.nfeProc.NFe.infNFe.emit.enderEmit.xMun._text;
        let uf = this.NFeJSON.nfeProc.NFe.infNFe.emit.enderEmit.UF._text;
        console.log(uf)
        let uri = "";
        if (this.NFeJSON.nfeProc.protNFe) {
            console.log(this.NFeJSON.nfeProc.NFe.infNFeSupl)
            uri = this.NFeJSON.nfeProc.NFe.infNFeSupl.urlChave._text;
        }
        
        // this.printer
        //     .setTextSize(1, 1)
        //     .align('ct')
        //     .text(razao + "\n")
        //     .text("CNPJ: " + cnpj + "     " + "IE: " + ie + "\n")
        //     .text(log + ', ' + nro + "\n")
        //     .text(bairro + ', ' + mun + ' - ' + uf + "\n")
        //     .text("Consulte pela chave de acesso em\n" + uri + "\n")
        //     .text("CHAVE DE ACESSO\n" + "12345678901234567890123456789012345678901234\n")
        //     .cut()
        //     .close();
        
    }
}
//  let teste =  new DanfcePOS("./NfeExample.xml","localhost")
// teste.printAll()
module.exports = DanfcePOS;

