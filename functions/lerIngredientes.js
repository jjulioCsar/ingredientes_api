import fs from 'fs';

const lerIngredientes = (callback) => {
    fs.readFile('ingredientes.json', 'utf8', (err, data) => {
        if (err) {
            callback(err, null); // Passa o erro como o primeiro argumento e os ingredientes como nulo
            return;
        }
        try {
            const ingredientes = JSON.parse(data);
            callback(null, ingredientes); // Passa null como o primeiro argumento e os ingredientes como o segundo
        } catch (error) {
            callback(error, null); // Passa o erro como o primeiro argumento e os ingredientes como nulo
        }
    });
};

export default lerIngredientes;
