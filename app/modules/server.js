// server.js

const express = require('express');
const bodyParser = require('body-parser');
const path = require('node:path');
const DanfcePOS = require("./xmlPrinter")
const app = express();
const port = 3000;
const multer = require('multer');
const fs = require('fs');
const storage = multer.memoryStorage();


const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024  
    }})
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/', (req, res) => {
    res.status(200).json({ status: 200 });

});
function generateXMLPath(date){
    let data = date
    let dataArray = data.split("-")
    let caminhoXML = path.resolve("C:\\Users\\Public\\Documents\\NotasFiscais\\xml" + "\\" + dataArray[0] + "\\" + dataArray[1] + "\\" + dataArray[2] + "\\" + data + ".xml")
    return caminhoXML;
}
app.post('/printXML',upload.none(), async (req, res) => {
    try {
        let data = req.body.dataXML
        console.log(data)
        console.log(generateXMLPath(data))
        let teste = await new DanfcePOS(generateXMLPath(data), "localhost")
        teste.printAll()
        res.status(200).json({ status: "Sucesso" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: "Falha" });

    }

});

app.post('/saveXML',upload.single("fileXML"),async (req, res) => {
    try {
        let data = req.body.dataXML
        const fileInfo = req.file
        const base64 = fileInfo.buffer.toString("base64");
        let caminhoXML = generateXMLPath(data)

        const filePath = caminhoXML

        fs.writeFileSync(filePath, fileInfo.buffer)
        res.status(200).json({ status: "Sucesso" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: "Falha" });

    }

});

function startServer() {
    app.listen(port, () => {
        console.log(`octopus rodando na porta :  ${port}`);
    });
}

module.exports = startServer;
