
# Octopus XML Printer :octopus:

## Descrição

Sistema desktop criado usando NodeJS com electron, além de usar diversas bibliotecas como express e escpos para possibilitar a impressão de Notas Fiscais do Consumidor apartir do XML delas. 


## Requesitos
    
- Sistema Operacional Windows

## Instalação

- 1° Ir nos releases do GitHub
- 2° Selecionar a última versão
- 3° Baixar o setup e executar ele

## API Reference

#### SaveXML 

```http
  POST http://localhost:${port}/saveXML
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `dataXML` | `string` | Data de emissão da NFE     |
| `fileXML` | `file` | XML da Nota     |

#### OBS : Os XMLs e PDFs das notas fiscais ficam salvos em pastas organizadas da seguinte forma : "C:\Users\Public\Documents\NotasFiscais\\{ano}\\{mes}\\{dia}\\{data completa}.xml"
####  savePDF

```http
 POST http://localhost:${port}/savePDF
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `dataXML` | `string` | Data de emissão da NFE     |
| `filePDF` | `file` | PDF da Nota     |


####  printNFCe

```http
 POST http://localhost:${port}/printXML
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `dataXML` | `string` | Data de emissão da NFE     |
| `vID` | `string` | Vendor ID da impressora térmica     |
| `pID` | `string` | Product ID da impressora térmica     |




## Autores

- [@luisgustavorr](https://github.com/luisgustavorr)

