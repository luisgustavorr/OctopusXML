const fs = require('fs');
const pdf = require('pdf-parse');

// Path to the PDF file
const pdfPath = "C:\\Users\\Public\\Documents\\NotasFiscais\\pdf\\2024\\03\\21\\2024-03-21-11-01-27.pdf";

// Read the PDF file
fs.readFile(pdfPath, (err, data) => {
  if (err) {
    console.error('Error reading PDF file:', err);
    return;
  }

  // Parse the PDF data
  pdf(data).then(function (doc) {
    // Extracted text content from the PDF
    const text = doc.text;

    // Create a JSON object
    const jsonContent = {
      text: text
    };

    // Convert JSON object to string
    const jsonString = JSON.stringify(jsonContent, null, 2);

    // Output JSON string to console
    console.log(JSON.parse(jsonString).text.split(":"));

    // Alternatively, you can save the JSON to a file
    // fs.writeFileSync('output.json', jsonString);
  }).catch(function (err) {
    console.error('Error parsing PDF:', err);
  });
});
