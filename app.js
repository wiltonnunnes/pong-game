const http = require('http');
let fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

const customReadFile = (filePath, res) => {
    fs.readFile(filePath, (err, data) => {
        res.statusCode = 200;
        res.write(data);
        return res.end();
    });
}

const server = http.createServer((req, res) => {
    let url = req.url;
    if (url.indexOf('.') == -1) {
        res.setHeader('Content-Type', 'text/html');
        customReadFile('index.htm', res);
    } else if (url.indexOf('.css') != -1) {
        res.setHeader('Content-Type', 'text/css');
        customReadFile(`public/css${url}`, res);
    } else if (url.indexOf('.js') != -1) {
        res.setHeader('Content-Type', 'text/javascript');
        customReadFile(`public/js${url}`, res);
    } else {

    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});