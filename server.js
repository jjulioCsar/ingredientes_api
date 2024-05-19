import http from 'http';
import fs from 'fs';
import { URLSearchParams } from 'url';
import lerIngredientes from './functions/lerIngredientes.js';


const PORT = 3333;

const server = http.createServer((request, response) => {
    const { method, url } = request;

    if (method === 'POST' && url === '/ingredientes') {//cadastrar ingrediente
        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            if (!body) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ message: 'Corpo da solicitação vazio' }));
                return;
            }

            const novoIngrediente = JSON.parse(body);

            lerIngredientes((err, ingredientes) => {
                if (err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ message: 'Erro ao cadastrar o ingrediente' }));
                    return;
                }

                novoIngrediente.id = ingredientes.length + 1;
                ingredientes.push(novoIngrediente);

                fs.writeFile('ingredientes.json', JSON.stringify(ingredientes, null, 2), (err) => {
                    if (err) {
                        response.writeHead(500, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ message: 'Erro ao cadastrar o ingrediente no arquivo' }));
                        return;
                    }
                    response.writeHead(201, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(novoIngrediente));
                });
            });
        });
    }else if (method === 'GET' && url === '/ingredientes'){//mostrar ingredientes
        lerIngredientes((err, ingredientes) => {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ message: 'Erro ao ler os dados' }));
                return;
            }
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(ingredientes));
        });  
    }else if(url.startsWith('/ingredientes/') && method === 'GET'){
        const id = parseInt(url.split('/')[2])

        lerIngredientes((err, ingrediente) => {
            if(err){
                response.writeHead(500, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message: 'Erro interno no servidor'}))
                return; 
            }
            const indexIngrediente = ingrediente.findIndex((ingrediente) => ingrediente.id == id)
            if(indexIngrediente == -1){
                response.writeHead(404, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message: 'ingrediente não encontrado'}))
                return;
            }
            const ingredienteEncontrado = ingrediente[indexIngrediente]
            response.writeHead(200, {'Content-Type':'application/json'})
            response.end(JSON.stringify(ingredienteEncontrado))
        }) 
    }else if(url.startsWith('/ingredientes/') && method == 'PUT'){//atualizar um ingrediente
        const id = parseInt(url.split('/') [2])
        let body = ''
        request.on('data', (chunk)=>{
            body += chunk
        })
        request.on('end', () =>{
            if(!body){
                response.writeHead(400, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message: 'Corpo da solicitação vazio'}))
                return
            }
            lerIngredientes((err, ingredientes)=>{
                if(err){
                    response.writeHead(500, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Erro ao ler dados da ingrediente'}))
                    return
                }
    
                const indexIngrediente = ingredientes.findIndex((ingrediente)=> ingrediente.id === id)
    
                if(indexIngrediente === -1){
                    response.writeHead(404, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message: 'ingrediente não encontrada'}))
                }
    
                const ingredienteAtualizado = JSON.parse(body)
                ingredienteAtualizado.id = id
                ingredientes[indexIngrediente] = ingredienteAtualizado
    
                fs.writeFile('ingredientes.json', JSON.stringify(ingredientes, null, 2), (err)=>{
                    if(err){
                        response.writeHead(500, {'Content-Type': 'application/json'})
                        response.end(JSON.stringify({message:'Não é possivel atualizar o ingrediente'}))
                        return
                    }
                    response.writeHead(201, {'Content-Type':'application/json'})
                    response.end(JSON.stringify(ingredienteAtualizado))
                })
            });
        });

    }else if(url.startsWith ('/ingredientes/') && method === 'DELETE'){ // deletar um ingrediente
        const id = parseInt(url.split('/')[2])
        lerIngredientes((err, ingredientes) => {
            if(err){
                response.writeHead(500, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message: 'Erro interno no servidor'}))
                return; // função => parar a execução
            }
            const indexIngredientee = ingredientes.findIndex((ingrediente) => ingredientes.id === id)
            if(indexIngredientee === 1){
                response.writeHead(404, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message: 'ingrediente não encontrada'}))
                return;
            }
            ingredientes.splice(indexIngredientee, 1)
            fs.writeFile('ingredientes.json', JSON.stringify(ingredientes, null, 2), (err) => {
                if(err){
                    response.writeHead(500, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Erro ao salvar os dados'}))
                    return
                }
                response.writeHead(201, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message: 'ingrediente deletada'}))
            })
        })
    }else if (method === 'GET' && url.startsWith('/ingredientes')) {//trazer todas os ingrediente que possuem essa composição localhost:3333/ingredientes/pesquisa={ingrediente}
        const params = new URLSearchParams(url.split('?')[1]);
        const ingrediente = params.get('pesquisa');
        console.log(ingrediente);
        
        lerIngredientes((err, ingredientes) => {
            if (err) {
                response.writeHead(500, {'Content-Type': 'application/json'});
                response.end(JSON.stringify({message: 'Erro ao ler dados dos ingredientes'}));
                return;
            }
            const ingredientesComposição = ingredientes.filter(ingrediente => ingrediente.ingredientes.includes(ingrediente));
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(ingredientesComposição));
        });
    }else{
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Rota não encontrada' }));
    }
});

server.listen(PORT, () => {
    console.log(`Servidor em execução na porta ${PORT}`);
});
