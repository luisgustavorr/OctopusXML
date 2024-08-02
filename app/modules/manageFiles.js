const { shell } = require('electron');

class Manager {
    constructor() {

    }
    create() {

    }
    read() {

    }
    delete() {

    }
    openFolder(params) {
        let path = params.path
        shell.openPath(`${path}`);
        return 200
    }
}

module.exports = Manager