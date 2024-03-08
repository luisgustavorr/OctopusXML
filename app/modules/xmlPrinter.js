const fs = require("fs");
const convert = require('xml-js');
const escpos = require('escpos');
escpos.Network = require('escpos-network');

class DanfcePOS {
    constructor(xml_Path, device) {
        this.xmlNFE = xml_Path;
        this.NFeJSON = {};
        this.device = new escpos.Network(device);
    }

    printAll() {
        this.device.open((err) => {
            if (err) {
                console.error(err);
                return;
            }
            this.loadNFCe();
            this.parteI();
            this.parteII();
            this.parteIII();
            this.parteIV();
            this.parteV();
            this.parteVI();
            this.parteVII();
            this.parteVIII();
            this.parteIX();
            this.printer.cut();
            this.device.close();
        });
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
        let uri = "";
        if (this.NFeJSON.nfeProc.protNFe) {
            uri = this.NFeJSON.nfeProc.NFe.infNFeSupl.urlChave._text;
        }

        this.printer = new escpos.Printer(this.device);

        this.printer
            .setTextSize(1, 1)
            .align('ct')
            .text(razao + "\n")
            .text("CNPJ: " + cnpj + "     " + "IE: " + ie + "\n")
            .text(log + ', ' + nro + "\n")
            .text(bairro + ', ' + mun + ' - ' + uf + "\n")
            .text("Consulte pela chave de acesso em\n" + uri + "\n")
            .text("CHAVE DE ACESSO\n" + "12345678901234567890123456789012345678901234\n");
    }
    // Passe para Node:
    parteII() {
        this.printer
            .setJustification('center')
            .setEmphasis(true)
            .text("DANFCe - Documento Auxiliar da Nota Fiscal\nde Consumidor Eletronica\n")
            .setEmphasis(false)
            .setJustification('center')
            .text("Não permite aproveitamento de crédito de ICMS.\n");

        this.separador();
    }


    // Passe para Node:
    parteIII() {
        this.printer
            .setJustification('left')
            .setEmphasis(true)
            .text("Cód.  Descrição          Qtd. Un.  Valor   Total\n")
            .setEmphasis(false);

        const det = this.nfce.infNFe.det;
        this.totItens = det.length;
        let vTot = 0;

        for (let x = 0; x < this.totItens; x++) {
            const nItem = parseInt(det[x].attributes().nItem);
            const cProd = det[x].prod.cProd.toString();
            const xProd = det[x].prod.xProd.toString();
            const qCom = parseFloat(det[x].prod.qCom);
            const uCom = det[x].prod.uCom.toString();
            const vUnCom = parseFloat(det[x].prod.vUnCom);
            const vProd = parseFloat(det[x].prod.vProd);

            // Formatar dados do item
            const linha = {
                cod: this.strPad(cProd, 6, ' '),
                descricao: this.strPad(xProd, 19, ' '),
                quantidade: this.strPad(qCom, 5, ' '),
                unidade: this.strPad(uCom, 3, ' '),
                valor_unit: this.strPad(vUnCom.toFixed(2).replace('.', ','), 7, ' ', 'left'),
                valor_total: this.strPad(vProd.toFixed(2).replace('.', ','), 8, ' ', 'left')
            };

            // Imprimir linha
            this.printer.text(
                `${linha.cod}${linha.descricao}${linha.quantidade}${linha.unidade}${linha.valor_unit}${linha.valor_total}\n`
            );

            vTot += vProd;
        }

        this.printer
            .setJustification('center')
            .setEmphasis(false);

        this.separador();

        this.printer
            .setJustification('left')
            .text(this.strPad('Qtd. Total:', 31, ' ', 'left') + this.strPad(this.totItens.toString(), 17, ' ', 'left') + '\n')
            .text(this.strPad('Total dos Produtos:', 31, ' ', 'left') + this.strPad('R$' + vTot.toFixed(2).replace('.', ','), 17, ' ', 'left') + '\n')
            .text(this.strPad('Desconto:', 31, ' ', 'left') + this.strPad('R$' + parseFloat(this.nfce.infNFe.total.ICMSTot.vDesc).toFixed(2).replace('.', ','), 17, ' ', 'left') + '\n')
            .setEmphasis(true)
            .text(this.strPad('Total:', 31, ' ', 'left') + this.strPad('R$' + parseFloat(this.nfce.infNFe.total.ICMSTot.vNF).toFixed(2).replace('.', ','), 17, ' ', 'left') + '\n')
            .setEmphasis(false);
    }
    // Passe para Node:
    parteIV() {
        const pag = this.nfce.infNFe.pag.detPag;

        for (const pagI of pag) {
            let tPag = pagI.tPag.toString();
            tPag = this.tipoPag(tPag).toString();
            const vPag = parseFloat(pagI.vPag);

            const printFormPag = this.strPad(`${tPag}:`, 31, ' ', 'left') +
                this.strPad(`R$${vPag.toFixed(2).replace('.', ',')}`, 17, ' ', 'left');

            this.printer.text(printFormPag + '\n');
        }

        const printTroco = this.strPad('Troco:', 31, ' ', 'left') +
            this.strPad(`R$${parseFloat(this.nfce.infNFe.pag.vTroco).toFixed(2).replace('.', ',')}`, 17, ' ', 'left');

        this.printer.text(printTroco + '\n');
    }
    // Passe para Node:
    parteV() {
        this.printer
            .setJustification('center');

        const vTotTrib = parseFloat(this.nfce.infNFe.total.ICMSTot.vTotTrib);
        const printImp = this.strPad('Informação dos Tributos Incidentes:', 35, ' ') +
            this.strPad(`R$${vTotTrib.toFixed(2).replace('.', ',')}`, 13, ' ', 'left');

        this.printer.text(printImp + '\n')
            .text('Fonte IBPT - Lei Federal 12.741/2012\n')
            .setJustification('center');

        this.separador();
    }
    // Passe para Node:
    parteVI() {
        const infCpl = this.nfce.infNFe.infAdic.infCpl.toString();

        if (infCpl.trim() !== '') {
            this.printer.text(`${infCpl}\n`);
        }
    }
    // Passe para Node:
    parteVII() {
        this.printer
            .setJustification('center');

        const tpAmb = parseInt(this.nfce.infNFe.ide.tpAmb);
        if (tpAmb === 2) {
            this.printer.text("EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO\nSEM VALOR FISCAL\n");
        }

        const tpEmis = parseInt(this.nfce.infNFe.ide.tpEmis);
        if (tpEmis !== 1) {
            this.printer.text("EMITIDA EM AMBIENTE DE CONTINGÊNCIA\n");
        }

        const nNF = this.nfce.infNFe.ide.nNF.toString();
        const serie = parseInt(this.nfce.infNFe.ide.serie);
        const dhEmi = this.nfce.infNFe.ide.dhEmi.toString();
        const Id = this.nfce.infNFe.attributes().Id.toString();
        const chave = Id.substring(3);

        const linha = {
            numero: this.strPad(`NFCe: ${nNF.replace(/\D/g, '')}`, 15),
            serie: this.strPad(`Série: ${serie}`, 10),
            data: this.strPad(new Date(dhEmi).toLocaleString('pt-BR', { timeZone: 'UTC' }), 23, ' ', 'left')
        };

        this.printer.text(`${linha.numero}${linha.serie}${linha.data}\n`)
            .text("Consulte pela chave de acesso em ")
            .text(`${this.uri}\n`)
            .text("CHAVE DE ACESSO\n")
            .text(`${chave}\n`);

        this.separador();
    }
    // Passe para Node:
    parteVIII() {
        this.printer
            .setJustification('center');

        if (this.protNFe.infProt.xMsg) {
            this.printer
                .text("INFORMAÇÕES ADICIONAIS")
                .feed(1)
                .text(this.protNFe.infProt.xMsg)
                .feed(1);
        }

        const dest = this.nfce.infNFe.dest;

        if (!dest) {
            this.printer
                .setEmphasis(true)
                .text("CONSUMIDOR NÃO IDENTIFICADO\n")
                .setEmphasis(false);
            return;
        }

        const xNome = this.nfce.infNFe.dest.xNome.toString();
        this.printer
            .setJustification('center')
            .text(`${xNome}\n`);

        const cnpj = this.nfce.infNFe.dest.CNPJ.toString();
        const cpf = this.nfce.infNFe.dest.CPF.toString();
        const idEstrangeiro = this.nfce.infNFe.dest.idEstrangeiro.toString();

        if (cnpj) {
            this.printer
                .text(`CNPJ ${cnpj}\n`)
                .feed(1);
        }

        if (cpf) {
            this.printer.text(`CPF ${cpf}\n`);
        }

        if (idEstrangeiro) {
            this.printer.text(`Estrangeiro ${idEstrangeiro}\n`);
        }

        const xLgr = this.nfce.infNFe.dest.enderDest.xLgr.toString();
        const nro = this.nfce.infNFe.dest.enderDest.nro.toString();
        const xCpl = this.nfce.infNFe.dest.enderDest.xCpl.toString();
        const xBairro = this.nfce.infNFe.dest.enderDest.xBairro.toString();
        const xMun = this.nfce.infNFe.dest.enderDest.xMun.toString();
        const uf = this.nfce.infNFe.dest.enderDest.UF.toString();
        const cep = this.nfce.infNFe.dest.enderDest.CEP.toString();

        this.printer
            .text(`${xLgr}, ${nro}.\n`);

        if (xCpl) {
            this.printer.text(`${xCpl}, `);
        }

        this.printer
            .text(`${xBairro}. `)
            .text(`${xMun} - ${uf}.\n`);

        this.separador();
    }
    // Passe para Node:
    parteIX() {
        this.printer
            .setJustification('center')
            .text("Consulte via Leitor de QRCode\n");

        const qr = this.nfce.infNFeSupl.qrCode.toString();
        this.printer.qrCode(qr, this.printer.QR_ECLEVEL_L, 5)
            .feed();

        if (this.protNFe) {
            const nProt = this.protNFe.infProt.nProt.toString();
            const dhRecbto = this.protNFe.infProt.dhRecbto.toString();
            this.printer.text(`Protocolo de autorização: ${nProt}\n`);
        } else {
            this.printer
                .setEmphasis(true)
                .text("NOTA FISCAL INVÁLIDA - SEM PROTOCOLO DE AUTORIZAÇÃO\n")
                .setEmphasis(false);
        }
    }
    separador() {
        this.printer.text('='.repeat(48) + "\n");
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
// const imprimirDanfce = new DanfcePOS("C:\\Users\\Public\\Documents\\NotasFiscais\\xml\\2024\\02\\23\\2024-02-23-09-41-16.xml", "localhost")
// imprimirDanfce.printAll()
module.exports = DanfcePOS;
