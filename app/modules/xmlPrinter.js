const fs = require("fs");
const convert = require('xml-js');
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');



class DanfcePOS {
    constructor(xml_Path,vID,pID) {
        this.xmlNFE = xml_Path;
        this.vID = vID
        // console.log(`IMPRESSORA DESEJADA:${vID}`)
        this.NFeJSON = {};
    }

    printAll() {

  
            this.printer = new ThermalPrinter({
                
                type: PrinterTypes.EPSON,
                characterSet: CharacterSet.PC852_LATIN2,
                removeSpecialCharacters: true, 
                interface: '//localhost/'+this.vID
          
              });
            this.loadNFCe();
            this.parteI();
            this.parteII();
            this.parteIII();
            this.parteIV();
            this.parteV();
            this.parteVII();
            this.parteVIII();
            this.parteIX();
            try {
                let execute = this.printer.execute()
                // console.log("Print done!");
                console.log("\n\n\n");
                console.log(this.printer.getText());
                console.log("\n\n\n");
              } catch (error) {
                console.error("Print failed:", error);
              }
            // this.printer.cut().close()

    }
    strPad(input, pad_length, pad_string = ' ', pad_type = 'right') {
        const diff = input.length - Buffer.byteLength(input, 'utf8');
        const real_pad_length = pad_length + diff;

        if (pad_type === 'right') {
            return input.padEnd(real_pad_length, pad_string);
        } else if (pad_type === 'left') {
            return input.padStart(real_pad_length, pad_string);
        } else if (pad_type === 'both') {
            const pad_left_length = Math.floor((real_pad_length - input.length) / 2);
            const pad_right_length = real_pad_length - input.length - pad_left_length;
            return input.padStart(pad_left_length + input.length, pad_string).padEnd(pad_right_length + pad_left_length + input.length, pad_string);
        } else {
            throw new Error('Invalid pad type');
        }
    }

    loadNFCe() {
        let xml = this.xmlNFE;
        if (fs.existsSync(xml)) {
            xml = fs.readFileSync(xml).toString();
        } else {
            console.error("XML file not found.");
            return false;
        }
        let nfe = convert.xml2json(xml, { compact: true, spaces: 4 });
        this.NFeJSON = JSON.parse(nfe);
    }

    parteI() {
        let razao = this.NFeJSON.nfeProc.NFe.infNFe.emit.xNome._text;
        let cnpj = this.NFeJSON.nfeProc.NFe.infNFe.emit.CNPJ._text;
        let ie = this.NFeJSON.nfeProc.NFe.infNFe.emit.IE._text;
        let log = this.NFeJSON.nfeProc.NFe.infNFe.emit.enderEmit.xLgr._text;
        let nro = this.NFeJSON.nfeProc.NFe.infNFe.emit.enderEmit.nro._text;
        let bairro = this.NFeJSON.nfeProc.NFe.infNFe.emit.enderEmit.xBairro._text;
        let mun = this.NFeJSON.nfeProc.NFe.infNFe.emit.enderEmit.xMun._text;
        let uf = this.NFeJSON.nfeProc.NFe.infNFe.emit.enderEmit.UF._text;

        this.printer
        this.printer.setTypeFontA()
        this.printer.setTextNormal()

        this.printer.alignCenter()
            this.printer.println(razao,"857")
            this.printer.println("CNPJ: " + cnpj + "     " + "IE: " + ie,"857")
            this.printer.println(log + ', ' + nro,"857")
            this.printer.println(bairro + ', ' + mun + ' - ' + uf,"857")
        this.separador();

    }
    // Passe para Node:
    parteII() {
        
            this.printer.alignCenter()
            this.printer.println("DANFCe - Documento Auxiliar da Nota Fiscal\ne Consumidor Eletronica","857")
            this.printer.println("Nao permite aproveitamento de crédito de ICMS.","857")

        this.separador();
    }


    // Passe para Node:
    parteIII() {
            this.printer.alignCenter()

            this.printer.println("Cód.  Descrição          Qtd. Un. Valor Total","857")
            ;

        let det = this.NFeJSON.nfeProc.NFe.infNFe.det;
        if (Object.keys(det)[0] == '_attributes') {
            det = [det]
        }
        this.totItens = det.length;
        let vTot = 0;

        for (let x = 0; x < this.totItens; x++) {
            const nItem = parseInt(det[x]["_attributes"].nItem);
            const cProd = det[x].prod.cProd["_text"].toString();
            const xProd = det[x].prod.xProd["_text"].toString();
            const qCom = parseFloat(det[x].prod.qCom["_text"]);
            const uCom = det[x].prod.uCom["_text"].toString();
            const vUnCom = parseFloat(det[x].prod.vUnCom["_text"]);
            const vProd = parseFloat(det[x].prod.vProd["_text"]);

            // Formatar dados do item
            const linha = {
                cod: this.strPad(cProd, 6, ' '),
                descricao: this.strPad(xProd, 19, ' '),
                quantidade: this.strPad(qCom.toString(), 5, ' '),
                unidade: this.strPad(uCom, 3, ' '),
                valor_unit: this.strPad(vUnCom.toFixed(2).replace('.', ','), 5, ' ', 'left'),
                valor_total: this.strPad(vProd.toFixed(2).replace('.', ','), 5, ' ', 'left')
            };

            // Imprimir linha
            this.printer.println(
                `${linha.cod}${linha.descricao}${linha.quantidade}${linha.unidade}${linha.valor_unit}${linha.valor_total}`,"857"
            );

            vTot += vProd;
        }

            this.printer.alignCenter()
            ;

        this.separador();


            this.printer.alignCenter()

            this.printer.println('Qtd. Total:' + this.strPad(this.totItens.toString(), 17, ' ', 'left'),"857")
            this.printer.println('Total dos Produtos:' + this.strPad('R$' + vTot.toFixed(2).replace('.', ','), 17, ' ', 'left'),"857")
            this.printer.println('Desconto:' + this.strPad('R$' + this.NFeJSON.nfeProc.NFe.infNFe.total.ICMSTot.vDesc["_text"].toString().replace('.', ','), 17, ' ', 'left'),"857")

            this.printer.println('Total:' + this.strPad('R$' + this.NFeJSON.nfeProc.NFe.infNFe.total.ICMSTot.vNF["_text"].toString().replace('.', ','), 17, ' ', 'left'),"857")
        this.separador();


    }

    // Passe para Node:
    parteIV() {
            this.printer.alignCenter();
        this.printer.println("FORMA PAGAMENTO","857")

        const pag = this.NFeJSON.nfeProc.NFe.infNFe.pag.detPag
        let tPag = pag.tPag["_text"].toString();
        tPag = this.tipoPag(tPag).toString();
        const vPag = parseFloat(pag.vPag["_text"]);

        const printFormPag = this.strPad(`${tPag}:`, 0, ' ', 'left') +
            this.strPad(`R$${vPag.toFixed(2).replace('.', ',')}`, 40, ' ', 'left');

        this.printer.println(printFormPag,"857");

        const printTroco = this.strPad('Troco:', 0, ' ', 'left') +
            this.strPad(`R$${parseFloat(this.NFeJSON.nfeProc.NFe.infNFe.pag.vTroco["_text"]).toFixed(2).replace('.', ',')}`, 40, ' ', 'left');

        this.printer.println(printTroco,"857");
        this.separador();
        let uri = "";
        if (this.NFeJSON.nfeProc.protNFe) {
            uri = this.NFeJSON.nfeProc.NFe.infNFeSupl.urlChave._text;
        }
        this.printer.println("Consulte pela chave de acesso em\n" + uri,"857")
            this.printer.println("CHAVE DE ACESSO\n" + "12345678901234567890123456789012345678901234","857")
        this.separador();

    }
    // Passe para Node:
    parteV() {

            this.printer.alignCenter();

        const vTotTrib = 0;
        // console.log(vTotTrib)
        const printImp = this.strPad('Informação dos Tributos Incidentes:', 35, ' ') +
            this.strPad(`R$${vTotTrib.toFixed(2).replace('.', ',')}`, 13, ' ', 'left');

        this.printer.println(printImp,"857")
            this.printer.println('Fonte IBPT - Lei Federal 12.741/2012',"857")
            this.printer.alignCenter();

        this.separador();
    }
    // Passe para Node:
    parteVII() {
            this.printer.alignCenter();

        const tpAmb = parseInt(this.NFeJSON.nfeProc.NFe.infNFe.ide.tpAmb);
        if (tpAmb === 2) {
            this.printer.println("EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO SEM VALOR FISCAL","857");
        }

        const nNF = this.NFeJSON.nfeProc.NFe.infNFe.ide.nNF["_text"].toString();
        const serie = parseInt(this.NFeJSON.nfeProc.NFe.infNFe.ide.serie["_text"]);
        const dhEmi = this.NFeJSON.nfeProc.NFe.infNFe.ide.dhEmi["_text"].toString();
        const Id = this.NFeJSON.nfeProc.NFe.infNFe["_attributes"].Id.toString();
        const chave = Id.substring(3);
        // console.log(dhEmi)
        const linha = {
            numero: this.strPad(`NFCe: ${nNF.replace(/\D/g, '')}`, 15),
            serie: this.strPad(`Série: ${serie}`, 10),
            data: this.strPad(new Date(dhEmi).toLocaleString('pt-BR', { timeZone: 'UTC' }), 23, ' ', 'left')
        };
        this.printer.println(`${linha.numero}${linha.serie}${linha.data}`,"857")
            this.printer.println("Consulte pela chave de acesso em ","857")
            this.printer.println(`https://portalsped.fazenda.mg.gov.br/portalnfce`,"857")
            this.printer.println("CHAVE DE ACESSO","857")
            this.printer.println(`${chave}`,"857")

        this.separador();
    }
    // Passe para Node:
    parteVIII() {
            this.printer.alignCenter();

        if (this.NFeJSON.nfeProc.protNFe.infProt.xMsg) {


            this.printer
                this.printer.println("INFORMAÇÕES ADICIONAIS","857")
                this.printer.feed(1)
                this.printer.println(this.NFeJSON.nfeProc.infProt.xMsg,"857")
                this.printer.feed(1)
        }
        const dest = this.NFeJSON.nfeProc.NFe.infNFe.dest;
        if (!dest) {


                this.printer.println("CONSUMIDOR NAO IDENTIFICADO","857")
                ;
            return;
        }
        const xNome = this.NFeJSON.nfeProc.NFe.infNFe.dest.xNome["_text"].toString();
            this.printer.alignCenter()
            this.printer.println(`${xNome}\n`,"857");
        let cpf = null;
        let cnpj = null;
        let idEstrangeiro = null;
        // console.log(dest)
        if (Object.keys(dest)[0] == "CPF") {
            cpf = this.NFeJSON.nfeProc.NFe.infNFe.dest.CPF["_text"].toString();


        } else {
            cnpj = dest.CNPJ["_text"].toString();
            if(dest.idEstrangeiro !== undefined){
                idEstrangeiro = this.NFeJSON.nfeProc.NFe.infNFe.dest.idEstrangeiro["_text"].toString();

            }
            idEstrangeiro = 0;

        }


        if (cnpj) {
            // console.log("A")
                this.printer.println(`CNPJ ${cnpj}`,"857")
        }

        if (cpf) {
            // console.log("A")

            this.printer.println(`CPF ${cpf}`,"857");
        }

        if (idEstrangeiro) {
            // console.log("A")

            this.printer.println(`Estrangeiro ${idEstrangeiro}`,"857");
        }



        this.separador();
    }
    // Passe para Node:
    parteIX() {
            this.printer.alignCenter()
            this.printer.println("Consulte via Leitor de QRCode","857")

        const qr = this.NFeJSON.nfeProc.NFe.infNFeSupl.qrCode["_text"].toString();
        // console.log(this.NFeJSON.nfeProc.NFe.infNFeSupl.qrCode["_text"])
        if (this.NFeJSON.nfeProc.protNFe) {
            const nProt = this.NFeJSON.nfeProc.protNFe.infProt.nProt["_text"].toString();
            const dhRecbto = this.NFeJSON.nfeProc.protNFe.infProt.dhRecbto["_text"].toString();

            this.printer.println(`Protocolo de autorização: ${nProt}`,"857");
            this.printer.println(`Data de autorização: ${dhRecbto}`,"857");

        } else {

                this.printer.println("NOTA FISCAL INVÁLIDA - SEM PROTOCOLO DE AUTORIZAÇÃO","857")
                ;
        }
        this.separador();

        this.printer.printQR(qr.trim())
    }
    separador() {
        this.printer.alignCenter()
        this.printer.println('='.repeat(48),"857");
    }
    // Passe para Node:
    intLowHigh(input, length) {
        let outp = "";
        for (let i = 0; i < length; i++) {
            outp += String.fromCharCode(input % 256);
            input = Math.floor(input / 256);
        }
        return outp;
    }


    tipoPag(tPag) {
        let aPag = {
            '01': 'Dinheiro',
            '02': 'Cheque',
            '03': 'Cartao de Credito',
            '04': 'Cartao de Debito',
            '05': 'Credito Loja',
            '10': 'Vale Alimentacao',
            '11': 'Vale Refeicao',
            '12': 'Vale Presente',
            '13': 'Vale Combustivel',
            '99': 'Outros',
        }
        if (aPag.hasOwnProperty(tPag)) {
            return aPag[tPag];
        }
        return '';
    }
}
// const imprimirDanfce = new DanfcePOS("C:\\Users\\Public\\Documents\\NotasFiscais\\xml\\2024\\05\\10\\2024-05-10-15-32-16.xml", "localhost")
// imprimirDanfce.printAll()
module.exports = DanfcePOS;
