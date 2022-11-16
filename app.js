// const { Client, Location, List, Buttons, LocalAuth } = require('whatsapp-web.js');
const { Client, Location, List, Buttons, LocalAuth, MessageMedia } = require('./index');
require("dotenv").config();
const dbConnect = require('./config/mongo');
const cultivos = require('./models/cultivos');
const users = require('./models/users');
const afirmaciones = ['Si', 'si', 'Vale', 'vale', 'Ok', 'ok', 'Afirmativo', 'afirmativo'];
const negaciones = ['No', 'no', 'Negativo', 'negativo'];
const saludos = ['Hola', 'hola', 'Buenas', 'buenas', 'Saludos', 'saludos', 'Buenas tardes', 'buenas tardes', 'Buenos dias', 'buenos dias'];
const verduras = ["tomate", "aguacate", "pepino", "maiz", "zanahoria", "cebolla", "patata"];
const semillas = new Map([
    ["tomate", "semillas_tomate"],
    ["aguacate", "semillas_aguacate"],
    ["pepino", "semillas_pepino"],
    ["maiz", "semillas_maiz"],
    ["zanahoria", "semillas_zanahoria"],
    ["cebolla", "semillas_cebolla"],
    ["patata", "semillas_patata"],                                                         
]);
const ubicaciones = [
    ['Puerta real', '37.173', '-3.599'],
    ['Plaza einstein', '37.177', '-3.609'],
    ['La puerta del vino', '37.176', '-3.590'],
    ['Camping la Habana', '36.742', '-2.965'],
]
const cadena_ejemplo_granja_pequeña = "\
🍅🥵      🥑🥵      🥒😊\n \
                 🥑🥵      🥒😊\n \
🍅🥵      🥑🥵      🥒😊\n\n \
🌽🥵      🏡🏡      🥕😊\n \
🌽🥵      🏡🏡      🥕😊\n \
🌽🥵      🏡🏡      🥕😊\n\n \
🧅🥵      🥔😊\n \
🧅😊      🥔🥵\n \
🧅😊      🥔🥵";
const cadena_ejemplo_granja_puntos = "---------------------------\n---------------------------\n\n-------------------🏡-----------------\n-------------------------------------------\n\n------------------\n-----------------";
const client = new Client({ 
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }, //  con esto se abre chromium con el whatsapp web del bot
});

client.initialize(); 
dbConnect();

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
    var temporizador = setInterval(recordatorio, 1000);
});

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function ver_granja(msg_from, usuario) {
    let sections = [{title:'Estas son las opciones',rows:[{title:'Ver cultivos'}, {title:'Ir a la tienda'}, {title:'Ver inventario'}, {title:'Retos'}, {title:'Comerciar con amigos'}, {title:'Invitar a un amigo a crearse una granja'}, {title:'Visitar la granja de un amigo'}]}];
    let list = new List('¿Que quieres hacer en tu granja?','Acciones',sections,'Title','footer');
    // let list = "¿Que quieres hacer en tu granja?\nEstas son las opciones\n-Ver cultivos\n-Ir a la tienda\n-Ver inventario\n-Retos\n-Comerciar con amigos";
    client.sendMessage(msg_from, list);  
} 

function ver_cultivos(msg) {

    let sections = [{title:'Estas son las opciones',rows:[{title:'Plantar nuevo cultivo'},{title:'Regar cultivo'},{title:'Recolectar cultivo'},{title:'Eliminar cultivos secos'},{title:'Volver a la granja'}]}];
    let list = new List('¿Que quieres hacer con los cultivos?','Acciones',sections,'Title','footer');
    // let list = "¿Que quieres con los cultivos?\nEstas son las opciones\nPlantar nuevo cultivo\nRegar cultivo\nRecolectar cultivo\nEliminar cultivos secos\nVolver a la granja";
    client.sendMessage(msg.from, list); 
} 

function ver_tienda(msg) {
    let sections = [{title:'Estas son las opciones',rows:[{title:'Comprar semillas'},{title:'Vender cajas de cultivos'},{title:'Volver a la granja'}]}];
    let list = new List('¿Que quieres hacer?','Acciones',sections,'Title','footer');
    // let list = "¿Que quieres hacer en la tienda?\nEstas son las opciones\n-Comprar semillas\n-Vender cajas de cultivos\nVolver a la granja";
    client.sendMessage(msg.from, list); 
} 

function ver_retos(msg) {
    let sections = [{title:'Estas son las opciones',rows:[{title:'Buscar recompensas en tiempo real'},{title:'Otros retos'},{title:'Volver'}]}];
    let list = new List('¿Que quieres hacer?','Acciones',sections,'Title','footer');
    // let list = "¿Que quieres hacer en la tienda?\nEstas son las opciones\n-Comprar semillas\n-Vender cajas de cultivos\nVolver a la granja";
    client.sendMessage(msg.from, list); 
} 

function devolver_num_semillas(usuario, verdura){
    var numero_semillas = 0;
    switch(verdura){
        case "tomate":
            numero_semillas = usuario.semillas_tomate;
            break;
        case "aguacate":
            numero_semillas = usuario.semillas_aguacate;
            break;
        case "pepino":
            numero_semillas = usuario.semillas_pepino;
            break;
        case "maiz":
            numero_semillas = usuario.semillas_maiz;
            break;
        case "zanahoria":
            numero_semillas = usuario.semillas_zanahoria;
            break;
        case "cebolla":
            numero_semillas = usuario.semillas_cebolla;
            break;
        case "patata":
            numero_semillas = usuario.semillas_patata;
            break;
    }
    return numero_semillas; 
}

function devolver_num_cajas(usuario, verdura){
    var numero_cajas = 0;
    switch(verdura){
        case "tomate":
            numero_cajas= usuario.cajas_tomate;
            break;
        case "aguacate":
            numero_cajas = usuario.cajas_aguacate;
            break;
        case "pepino":
            numero_cajas = usuario.cajas_pepino;
            break;
        case "maiz":
            numero_cajas = usuario.cajas_maiz;
            break;
        case "zanahoria":
            numero_cajas = usuario.cajas_zanahoria;
            break;
        case "cebolla":
            numero_cajas = usuario.cajas_cebolla;
            break;
        case "patata":
            numero_cajas = usuario.cajas_patata;
            break;
    }
    return numero_cajas; 
}

function decrementar_num_semillas(usuario, verdura){
    switch(verdura){
        case "tomate":
            usuario.semillas_tomate--;
            break;
        case "aguacate":
            usuario.semillas_aguacate--;
            break;
        case "pepino":
            usuario.semillas_pepino--;
            break;
        case "maiz":
            usuario.semillas_maiz--;
            break;
        case "zanahoria":
            usuario.semillas_zanahoria--;
            break;
        case "cebolla":
            usuario.semillas_cebolla--;
            break;
        case "patata":
            usuario.semillas_patata--;
            break;
    }
    return usuario; 
}

function incrementar_num_semillas(usuario, verdura, numero){
    switch(verdura){
        case "tomate":
            usuario.semillas_tomate+=numero;
            break;
        case "aguacate":
            usuario.semillas_aguacate+=numero;
            break;
        case "pepino":
            usuario.semillas_pepino+=numero;
            break;
        case "maiz":
            usuario.semillas_maiz+=numero;
            break;
        case "zanahoria":
            usuario.semillas_zanahoria+=numero;
            break;
        case "cebolla":
            usuario.semillas_cebolla+=numero;
            break;
        case "patata":
            usuario.semillas_patata+=numero;
            break;
    }
    return usuario; 
}

async function devolver_lista_cultivos_regar(msg, cultivos_encontrados, usuario){
    if (cultivos_encontrados != null){

        
        var num_tomates = 0;
        var num_aguacates = 0;
        var num_pepinos = 0;
        var num_maiz = 0;
        var num_zanahorias = 0;
        var num_cebollas = 0;
        var num_patatas = 0;
        
        for (var cultivo of cultivos_encontrados) {
            if (cultivo.muerto == false){
                switch(cultivo.tipo){
                    case "tomate":
                        num_tomates++;
                        break;
                    case "aguacate":
                        num_aguacates++;
                        break;
                    case "pepino":
                        num_pepinos++;
                        break;
                    case "maiz":
                        num_maiz++;
                        break;
                    case "zanahoria":
                        num_zanahorias++;
                        break;
                    case "cebolla":
                        num_cebollas++;
                        break;
                    case "patata":
                        num_patatas++;
                        break;
                }
            }
        }
        const rows = []
        if(num_tomates > 0)
            rows.push({title:'tomate'})
        if(num_aguacates > 0)
            rows.push({title:'aguacate'})
        if(num_pepinos > 0)
            rows.push({title:'pepino'})
        if(num_maiz > 0)
            rows.push({title:'maiz'})
        if(num_zanahorias > 0)
            rows.push({title:'zanahoria'})
        if(num_cebollas > 0)
            rows.push({title:'cebolla'})
        if(num_patatas > 0)
            rows.push({title:'patata'})
        if(rows.length > 0){
            let sections = [{title:'¿Que cultivos quieres regar?',rows}];
            let list = new List('Elige verdura','Acciones',sections,'Title','footer');
            client.sendMessage(msg.from, list);
            usuario.estado = 6;
            await usuario.save(); 
        } else{
            client.sendMessage(msg.from, "No hay cultivos disponibles para regar");
            ver_cultivos(msg);
            usuario.estado = 4;
            await usuario.save(); 
        }
        /////////////////////////////////PARTE SUSTITUTA//////////////////////
        // var hay_cultivos = false;
        // let list = "¿Que cultivos quieres regar?\n";
        // if(num_tomates > 0){
        //     list += 'tomate\n';
        //     hay_cultivos = true;
        // }
        // if(num_aguacates > 0){
        //     list += 'aguacate\n';
        //     hay_cultivos = true;
        // }
        // if(num_pepinos > 0){
        //     list += 'pepino\n';
        //     hay_cultivos = true;
        // }
        // if(num_maiz > 0){
        //     list += 'maiz\n';
        //     hay_cultivos = true;
        // }
        // if(num_zanahorias > 0){
        //     list += 'zanahoria\n';
        //     hay_cultivos = true;
        // }
        // if(num_cebollas > 0){
        //     list += 'cebolla\n';
        //     hay_cultivos = true;
        // }
        // if(num_patatas > 0){
        //     list += 'patata\n';
        //     hay_cultivos = true;
        // }
        // if(hay_cultivos == true){
        //     client.sendMessage(msg.from, list);
        //     usuario.estado = 6;
        //     await usuario.save(); 
        // } else{
        //     client.sendMessage(msg.from, "No hay cultivos disponibles para regar");
        //     ver_cultivos(msg);
        //     usuario.estado = 4;
        //     await usuario.save(); 
        // }
        /////////////////////////////////PARTE SUSTITUTA//////////////////////

    }
}

function devolver_lista_cultivos_recolectar(msg, cultivos_encontrados){
    if (cultivos_encontrados != null){
        // var num_tomates = 0;
        // var num_aguacates = 0;
        // var num_pepinos = 0;
        // var num_maiz = 0;
        // var num_zanahorias = 0;
        // var num_cebollas = 0;
        // var num_patatas = 0;
        var rows = [];
        
        for (var cultivo of cultivos_encontrados) {
            if(cultivo.listo == true)
                rows.push({title:cultivo.tipo});
        }
        if (rows.length > 0){
            let sections = [{title:'¿Que cultivos quieres recoger?',rows}];
            let list = new List('Elige cultivo','Acciones',sections,'Title','footer');
            client.sendMessage(msg.from, list);
            return true;
        } else{
            client.sendMessage(msg.from, "No tienes cultivos listos para recoger");
            return false;
        }
        /////////////////////////////////PARTE SUSTITUTA//////////////////////SEGUIR POR AQUI
        // var hay_cultivos = false;
        // let list = "¿Que cultivos quieres recoger?\n";
        // for (var cultivo of cultivos_encontrados) {
        //     if(cultivo.listo == true){
        //         list += cultivo.tipo;
        //         hay_cultivos = true;
        //     }
        // }
        // if (hay_cultivos){
        //     client.sendMessage(msg.from, list);
        //     return true;
        // } else{
        //     client.sendMessage(msg.from, "No tienes cultivos listos para recoger");
        //     return false;
        // }
        /////////////////////////////////PARTE SUSTITUTA//////////////////////

    }
}
function verCajasVerduras(usuario, msg){
    client.sendMessage(msg.from, 'Tienes ' + usuario.cajas_tomate +' cajas de tomates');
    client.sendMessage(msg.from, 'Tienes ' + usuario.cajas_aguacate +' cajas de aguacates');
    client.sendMessage(msg.from, 'Tienes ' + usuario.cajas_pepino +' cajas de pepinos');
    client.sendMessage(msg.from, 'Tienes ' + usuario.cajas_maiz +' cajas de maiz');
    client.sendMessage(msg.from, 'Tienes ' + usuario.cajas_zanahoria +' cajas de zanahorias');
    client.sendMessage(msg.from, 'Tienes ' + usuario.cajas_cebolla +' cajas de cebollas');
    client.sendMessage(msg.from, 'Tienes ' + usuario.cajas_patata +' cajas de patatas');
}
function verCantidadSemillas(usuario, msg){
    client.sendMessage(msg.from, 'Tienes ' + usuario.semillas_tomate +' semillas de tomates');
    client.sendMessage(msg.from, 'Tienes ' + usuario.semillas_aguacate +' semillas de aguacates');
    client.sendMessage(msg.from, 'Tienes ' + usuario.semillas_pepino +' semillas de pepinos');
    client.sendMessage(msg.from, 'Tienes ' + usuario.semillas_maiz +' semillas de maiz');
    client.sendMessage(msg.from, 'Tienes ' + usuario.semillas_zanahoria +' semillas de zanahorias');
    client.sendMessage(msg.from, 'Tienes ' + usuario.semillas_cebolla +' semillas de cebollas');
    client.sendMessage(msg.from, 'Tienes ' + usuario.semillas_patata +' semillas de patatas');
}

function verInventario(usuario, msg){
    client.sendMessage(msg.from, 'Tienes ' + usuario.monedas +' monedas');
    verCajasVerduras(usuario, msg)
    verCantidadSemillas(usuario, msg)
}
function construir_granja_iconos(numero, cultivos_encontrados){
    if (cultivos_encontrados != null){

        
        var cadena = "";
        var vec_tomates = [];
        var vec_aguacates = [];
        var vec_pepinos = [];
        var vec_maiz = [];
        var vec_zanahorias = [];
        var vec_cebollas = [];
        var vec_patatas = [];

        var num_aguacates = 0;
        var num_pepinos = 0;
        var num_maiz = 0;
        var num_zanahorias = 0;
        var num_cebollas = 0;
        var num_patatas = 0;
        
        for (var cultivo of cultivos_encontrados) {
            switch(cultivo.tipo){
                case "tomate":
                    vec_tomates.push(cultivo);
                    break;
                case "aguacate":
                    vec_aguacates.push(cultivo);
                    break;
                case "pepino":
                    vec_pepinos.push(cultivo);
                    break;
                case "maiz":
                    vec_maiz.push(cultivo);
                    break;
                case "zanahoria":
                    vec_zanahorias.push(cultivo);
                    break;
                case "cebolla":
                    vec_cebollas.push(cultivo);
                    break;
                case "patata":
                    vec_patatas.push(cultivo);
                    break;
            }
        }
        
        if(cultivos_encontrados){ // muestra cultivos

            for (let i = 0; i < 3; i++) { // En cada iteracion vamos a buscar una verdura concreta para que el orden de la granja siempre sea igual
                if (vec_tomates[i] != null){
                    cadena += "🍅";
                    if (vec_tomates[i].listo == true)
                        cadena += "✅";
                    else if (vec_tomates[i].regado == true && vec_tomates[i].listo == false)
                        cadena += "😊";
                    else if (vec_tomates[i].regado == false && vec_tomates[i].muerto == true)
                        cadena += "😵";
                    else
                        cadena += "🥵";
                    cadena += "      ";
                }
                else 
                    cadena += "                  ";
                    
                    
                if (vec_aguacates[i] != null){
                    cadena += "🥑";
                    if (vec_aguacates[i].listo == true)
                        cadena += "✅";
                    else if (vec_aguacates[i].regado == true && vec_aguacates[i].listo == false)
                        cadena += "😊";
                    else if (vec_aguacates[i].regado == false && vec_aguacates[i].muerto == true)
                        cadena += "😵";
                    else
                        cadena += "🥵";
                    cadena += "      ";
                }
                else 
                    cadena += "                  ";
                    
                if (vec_pepinos[i] != null){
                    cadena += "🥒";
                    if (vec_pepinos[i].listo == true)
                        cadena += "✅";
                    else if (vec_pepinos[i].regado == true && vec_pepinos[i].listo == false)
                        cadena += "😊";
                    else if (vec_pepinos[i].regado == false && vec_pepinos[i].muerto == true)
                        cadena += "😵";
                    else
                        cadena += "🥵";
                    cadena += "      ";
                }
                else 
                    cadena += "                  ";
                cadena+="\n";                
            }
            cadena+="\n";
            for (let i = 0; i < 3; i++) { // En cada iteracion vamos a buscar una verdura concreta para que el orden de la granja siempre sea igual
                if (vec_maiz[i] != null){
                    cadena += "🌽";
                    if (vec_maiz[i].listo == true)
                        cadena += "✅";
                    else if (vec_maiz[i].regado == true && vec_maiz[i].listo == false)
                        cadena += "😊";
                    else if (vec_maiz[i].regado == false && vec_maiz[i].muerto == true)
                        cadena += "😵";
                    else
                        cadena += "🥵";
                    cadena += "      ";
                }
                else 
                    cadena += "                  ";

                cadena+="🏡🏡      ";

                if (vec_zanahorias[i] != null){
                    cadena += "🥕";
                    if (vec_zanahorias[i].listo == true)
                        cadena += "✅";
                    else if (vec_zanahorias[i].regado == true && vec_zanahorias[i].listo == false)
                        cadena += "😊";
                    else if (vec_zanahorias[i].regado == false && vec_zanahorias[i].muerto == true)
                        cadena += "😵";
                    else
                        cadena += "🥵";
                    cadena += "      ";
                }
                else 
                    cadena += "                  ";
                cadena+="\n";                
            }
            cadena+="\n";
            for (let i = 0; i < 3; i++) { // En cada iteracion vamos a buscar una verdura concreta para que el orden de la granja siempre sea igual
                if (vec_cebollas[i] != null){
                    cadena += "🧅";
                    if (vec_cebollas[i].listo == true)
                        cadena += "✅";
                    else if (vec_cebollas[i].regado == true && vec_cebollas[i].listo == false)
                        cadena += "😊";
                    else if (vec_cebollas[i].regado == false && vec_cebollas[i].muerto == true)
                        cadena += "😵";
                    else
                        cadena += "🥵";
                    cadena += "      ";
                }
                else 
                    cadena += "                  ";

                if (vec_patatas[i] != null){
                    cadena += "🥔";
                    if (vec_patatas[i].listo == true)
                        cadena += "✅";
                    else if (vec_patatas[i].regado == true && vec_patatas[i].listo == false)
                        cadena += "😊";
                    else if (vec_patatas[i].regado == false && vec_patatas[i].muerto == true)
                        cadena += "😵";
                    else
                        cadena += "🥵";
                    cadena += "      ";
                }
                else 
                    cadena += "                  ";
                cadena+="\n";                
            }
        }
        client.sendMessage(numero, cadena);
    }
}

function devolver_num_cultivos(nombre_cultivo, cultivos_encontrados){
    var contador = 0;
    if(cultivos_encontrados != null){

        for (var cultivo of cultivos_encontrados) {
            if(nombre_cultivo == cultivo.tipo)
            contador++;
        }
        
    }
    return contador;
}

function aniadir_cajas_verdura(usuario, verdura){
    var random = getRandomIntInclusive(1, 4);
    switch(verdura){
        case "tomate":
            usuario.cajas_tomate+=random;
            break;
        case "aguacate":
            usuario.cajas_aguacate+=random;
            break;
        case "pepino":
            usuario.cajas_pepino+=random;
            break;
        case "maiz":
            usuario.cajas_maiz+=random;
            break;
        case "zanahoria":
            usuario.cajas_zanahoria+=random;
            break;
        case "cebolla":
            usuario.cajas_cebolla+=random;
            break;
        case "patata":
            usuario.cajas_patata+=random;
            break;
    }
    client.sendMessage(usuario.numero_tlf, "Genial! Has obtenido " + random + " cajas de " + verdura);
    return usuario; 
}

function devolver_verdura_en_mensaje(msg) {
    verdura="";
    if(msg.match(/tomate/ig))
        verdura = "tomate";
    else if(msg.match(/aguacate/ig))
        verdura = "aguacate";
    else if(msg.match(/pepino/ig))
        verdura = "pepino";
    else if(msg.match(/maiz/ig))
        verdura = "maiz";
    else if(msg.match(/zanahoria/ig))
        verdura = "zanahoria";
    else if(msg.match(/cebolla/ig))
        verdura = "cebolla";
    else if(msg.match(/patata/ig))
        verdura = "patata";
    return verdura;
} 

function comprar_semillas(usuario, verdura, numero_semillas){
    usuario = incrementar_num_semillas(usuario, verdura, numero_semillas);
    usuario.monedas -= numero_semillas*10; 
    return usuario;
}

function consultar_cajas(verdura, usuario){
    num_cajas = 0;
    switch(verdura){
        case "tomate":
            num_cajas=usuario.cajas_tomate;
            break;
        case "aguacate":
            num_cajas=usuario.cajas_aguacate;
            break;
        case "pepino":
            num_cajas=usuario.cajas_pepino;
            break;
        case "maiz":
            num_cajas=usuario.cajas_maiz;
            break;
        case "zanahoria":
            num_cajas=usuario.cajas_zanahoria;
            break;
        case "cebolla":
            num_cajas=usuario.cajas_cebolla;
            break;
        case "patata":
            num_cajas=usuario.cajas_patata;
            break;
    }
    return num_cajas; 
}

function consultar_semillas(verdura, usuario){
    num_semillas = 0;
    switch(verdura){
        case "tomate":
            num_semillas=usuario.semillas_tomate;
            break;
        case "aguacate":
            num_semillas=usuario.semillas_aguacate;
            break;
        case "pepino":
            num_semillas=usuario.semillas_pepino;
            break;
        case "maiz":
            num_semillas=usuario.semillas_maiz;
            break;
        case "zanahoria":
            num_semillas=usuario.semillas_zanahoria;
            break;
        case "cebolla":
            num_semillas=usuario.semillas_cebolla;
            break;
        case "patata":
            num_semillas=usuario.semillas_patata;
            break;
    }
    return num_semillas; 
}

function vender_cajas(usuario, verdura_msg, numero_cajas){
    usuario.monedas += numero_cajas*10;
    switch(verdura_msg){
        case "tomate":
            usuario.cajas_tomate -= numero_cajas;
            break;
        case "aguacate":
            usuario.cajas_aguacate -= numero_cajas;
            break;
        case "pepino":
            usuario.cajas_pepino -= numero_cajas;
            break;
        case "maiz":
            usuario.cajas_maiz -= numero_cajas;
            break;
        case "zanahoria":
            usuario.cajas_zanahoria -= numero_cajas;
            break;
        case "cebolla":
            usuario.cajas_cebolla -= numero_cajas;
            break;
        case "patata":
            usuario.cajas_patata -= numero_cajas;
            break;
    }
    return usuario;
}

async function comprobar_cultivos(cultivos_encontrados){
    for (var cultivo of cultivos_encontrados) {
        var diferencia = Date.now() - cultivo.fecha_regado;
        var diferencia_creado = Date.now() - cultivo.createdAt;
        console.log(diferencia)
        if (diferencia > 120000 && cultivo.listo != true){
            cultivo.muerto = true;
            cultivo.regado = false;
        }
        else if (diferencia > 60000 && cultivo.listo != true){
            cultivo.regado = false;
        }
        else if(diferencia_creado > 180000)
            cultivo.listo = true;
        await cultivo.save();
    }
}


async function recordatorio() {
    var usuarios = await users.find();
    for(var usuario of usuarios) {
        var diferencia = Date.now() - usuario.updatedAt;
        if(diferencia > 100000000)
        client.sendMessage(usuario.numero_tlf, 'Hace tiempo que tienes la granja desantendida, se te van a morir los cultivos');
    }
}

client.on('message', async msg => {
    //console.log('MESSAGE RECEIVED', msg);
     // el unico problema de ponerlo aqui es que para que comience a funcionar tiene que recibir un mensaje el bot después sigue funcionando correctamente
    var usuario = await users.findOne({ numero_tlf: msg.from }).exec(); //buscamos al usuario en la bd
    console.log('El resultado de la busqueda es: ', usuario);
    console.log('El contenido del mensaje es', msg);
    if (usuario != null){
        var cultivos_encontrados = await cultivos.find({ numero_tlf: usuario.numero_tlf }).exec();
        if(cultivos_encontrados!=null)
            comprobar_cultivos(cultivos_encontrados);
    }


    if (usuario == null && !afirmaciones.includes(msg.body) && !negaciones.includes(msg.body) && saludos.includes(msg.body))
        msg.reply('¿Quieres registrarte para tener una granja? Esto es un chatbot el cual va a recrear una granja donde vas a tener que cuidar de cultivos, regarlos y recolectarlos. Además va a a poder comprar semillas con monedas del juego para poder cultivar distintos tipos de cultivos. En este chatbot vas a poder interactuar con amigos y jugar de forma multijugador aparte de otros retos. ¿Te unes?');
        
    else if (usuario == null && afirmaciones.includes(msg.body)) {
        const query = new users({
            name: msg.author,
            numero_tlf: msg.from,
            monedas: 20,
            estado: 1,
        })
        await query.save();                    
        msg.reply('Me puedes decir tu nombre?');
    }
    else if (usuario == null && negaciones.includes(msg.body))
        msg.reply('De acuerdo, otra vez será');

    else if(usuario != null && usuario.estado == 1){
        usuario.name = msg.body;
        usuario.estado++;
        await usuario.save();
        msg.reply('Genial ' + usuario.name + '!\nTienes :' + usuario.monedas + ' monedas');
        client.sendMessage(msg.from,'¿Quieres que te regale un cultivo de tomate para comenzar?')
    }
    else if(usuario != null && usuario.estado == 2 && afirmaciones.includes(msg.body)){
        const query = new cultivos({
            numero_tlf: usuario.numero_tlf,
            regado: false,
            sulfatado: false,
        })
        await query.save();
        usuario.estado++;
        await usuario.save();
        var cultivo = await cultivos.find({ numero_tlf: usuario.numero_tlf }).exec();       
        construir_granja_iconos(msg.from, cultivo);
        ver_granja(msg.from, usuario);
    }
    else if(usuario != null && usuario.estado == 2 && negaciones.includes(msg.body)){
        usuario.estado++;
        await usuario.save();
        var cultivo = await cultivos.find({ numero_tlf: usuario.numero_tlf }).exec();
        construir_granja_iconos(msg.from, cultivo);
        ver_granja(msg.from, usuario);    
    }
    else if(usuario != null && usuario.estado == 3 && msg.body != 'Ver cultivos' && msg.body != 'Ir a la tienda' && msg.body != 'Ver inventario'&& msg.body != 'Retos' && msg.body != 'Comerciar con amigos' && msg.body != 'Invitar a un amigo a crearse una granja' && msg.body != 'Visitar la granja de un amigo'){ // Aqui añadiremos otras condiciones
    //////// MUESTRA MENU DE LA GRANJA /////////////////////// 3
        
        var cultivo = await cultivos.find({ numero_tlf: usuario.numero_tlf }).exec();
        construir_granja_iconos(msg.from, cultivo);
        ver_granja(msg.from, usuario);
    }
    else if(usuario != null && usuario.estado == 3 && msg.body == 'Ver cultivos'){
    //////// MUESTRA MENU DE LOS CULTIVOS /////////////////////// 4
        usuario.estado = 4;
        await usuario.save();
        var cultivo = await cultivos.find({ numero_tlf: usuario.numero_tlf }).exec();
        if(cultivo){ // muestra cultivos
            for (var iterator of cultivo) {
                client.sendMessage(msg.from, 'Tienes un cultivo de: ' + iterator.tipo );
            }
        }
        ver_cultivos(msg);
    }

    else if(usuario != null && usuario.estado == 4  && msg.body == 'Plantar nuevo cultivo'){
        //////////////PLANTAR NUEVO CULTIVO///////////////////////  5
        let sections = [{title:'Estas son las opciones',rows:[{title:'tomate'},{title:'aguacate'},{title:'pepino'},{title:'maiz'},{title:'zanahoria'},{title:'cebolla'},{title:'patata'}]}];
        let list = new List('Elige verdura','Acciones',sections,'Title','footer');
        /////////////////////////////////PARTE SUSTITUTA//////////////////////
        // let list = "Elige verdura\nEstas son las opciones\ntomate\naguacate\npepino\nmaiz\nzanahoria\ncebolla\npatata";
        /////////////////////////////////PARTE SUSTITUTA//////////////////////
        client.sendMessage(msg.from, list);
        usuario.estado = 5;
        await usuario.save();
    }
    else if(usuario != null && usuario.estado == 5 && verduras.includes(msg.body)){
        //////////////PLANTAR NUEVO CULTIVO///////////////////////  5
        var semilla_cultivo = semillas.get(msg.body)
        var cultivos_encontrados = await cultivos.find({ numero_tlf: usuario.numero_tlf }).exec();

        if(devolver_num_semillas(usuario, msg.body) <= 0){
            client.sendMessage(msg.from, 'Te faltan semillas de ' + msg.body);
        } else if (devolver_num_cultivos(msg.body, cultivos_encontrados) >= 3){
            client.sendMessage(msg.from, 'Ya tienes el número máximo de cultivos de ' + msg.body);
        } else {
        const query = new cultivos({
            numero_tlf: usuario.numero_tlf,
            tipo: msg.body,
            regado: false,
            fecha_regado: Date.now(),
            listo: false,
            muerto: false
        })
        await query.save(); //YA SE DECREMENTA LA SEMILLA UTILIZADA
        var usuario = decrementar_num_semillas(usuario, msg.body);
        await usuario.save();
        var cultivo = await cultivos.find({ numero_tlf: usuario.numero_tlf }).exec();
        if(cultivo){ // muestra cultivos
            for (var iterator of cultivo) {
                client.sendMessage(msg.from, 'Tienes un cultivo de: ' + iterator.tipo );
            }
        }
        }
        usuario.estado = 4;
        await usuario.save(); 
        ver_cultivos(msg);        
    }
    else if(usuario != null && usuario.estado == 4 && msg.body == 'Regar cultivo'){
        ///////////////////////REGAR CULTIVO//////////////////////////// 6
        var cultivo = await cultivos.find({ numero_tlf: usuario.numero_tlf }).exec();
        devolver_lista_cultivos_regar(msg, cultivo, usuario);
    }
    else if(usuario != null && usuario.estado == 6 && verduras.includes(msg.body)){
        ///////////////////////REGAR CULTIVO//////////////////////////// 6
        var cultivo = await cultivos.find({ numero_tlf: usuario.numero_tlf, tipo: msg.body }).exec();
        if(cultivo){ // muestra cultivos
            for (var iterator of cultivo) {
                if (iterator.muerto == false){
                    iterator.regado = true;
                    iterator.fecha_regado = Date.now();
                }
                await iterator.save(); 
            }
        }
        usuario.estado = 4;
        await usuario.save(); 
        ver_cultivos(msg);  
    }
    else if(usuario != null && usuario.estado == 4 && msg.body == 'Recolectar cultivo'){
        ///////////////////////RECOLECTAR CULTIVO//////////////////////////// 7
        var cultivo = await cultivos.find({ numero_tlf: usuario.numero_tlf }).exec();
        var estado = devolver_lista_cultivos_recolectar(msg, cultivo);
        if (estado == true)
            usuario.estado = 7;
        else{
            usuario.estado = 4;
            ver_cultivos(msg);
        }
        await usuario.save(); 
    }
    else if(usuario != null && usuario.estado == 7 && verduras.includes(msg.body)){
        ///////////////////////RECOLECTAR CULTIVO//////////////////////////// 7
        var usuario = aniadir_cajas_verdura(usuario, msg.body);
        usuario.estado = 4;
        await usuario.save(); 
        await cultivos.deleteOne({ numero_tlf: usuario.numero_tlf, tipo: msg.body, listo :true });// esto importante después del usuario.save() si no peta
        ver_cultivos(msg);  

    }
    else if(usuario != null && usuario.estado == 4 && msg.body == 'Eliminar cultivos secos'){
        await cultivos.deleteMany({ numero_tlf: usuario.numero_tlf, muerto :true });// esto importante después del usuario.save() si no peta
        ver_cultivos(msg); 

    }
    else if(usuario != null && usuario.estado == 4 && msg.body == 'Volver a la granja'){
        var cultivo = await cultivos.find({ numero_tlf: usuario.numero_tlf }).exec();
        construir_granja_iconos(msg.from, cultivo);
        ver_granja(msg.from, usuario);
        usuario.estado = 3;
        await usuario.save();
    }
    else if(usuario != null && usuario.estado == 4 &&  msg.body != 'Plantar nuevo cultivo' && msg.body != 'Regar cultivo' && msg.body != 'Recolectar cultivo' && msg.body != 'Eliminar cultivos secos' && msg.body != 'Volver a la granja'){
        client.sendMessage(msg.from, 'Lo siento no te he entendido, ¿puedes seleccionar una opción de las acciones que se muestran arriba?');
    }
    else if(usuario != null && usuario.estado == 3 && msg.body == 'Ir a la tienda'){
    //////// MUESTRA MENU DE LA TIENDA /////////////////////// 8
        usuario.estado = 8;
        await usuario.save();
        client.sendMessage(msg.from, 'Tienes ' + usuario.monedas + 'monedas');
        ver_tienda(msg);
    }
    else if(usuario != null && usuario.estado == 8 && msg.body == 'Comprar semillas'){
    //////// COMPRAR SEMILLAS /////////////////////// 9
        usuario.estado = 9;
        await usuario.save();
        client.sendMessage(msg.from, 'Tienes ' + usuario.monedas + 'monedas');
        client.sendMessage(msg.from, 'Cada semilla cuesta 10 monedas\nIndica primer cuantas semillas quieres con números y después de que verdura');
    }
    else if(usuario != null && usuario.estado == 9){
        //////// COMPRAR SEMILLAS /////////////////////// 9
        if(msg.body.match(/\d+/gi) != null){
            var numero_sem = parseInt(msg.body.match(/\d+/gi));

            var verdura_msg = devolver_verdura_en_mensaje(msg.body);
            if((numero_sem*10) > usuario.monedas){
                client.sendMessage(msg.from, 'Te faltan monedas');
                usuario.estado = 8;
            }
            else{
                usuario = comprar_semillas(usuario, verdura_msg, numero_sem);
                usuario.estado = 8;
                client.sendMessage(msg.from, 'Genial has comprado ' + numero_sem + ' semillas de ' + verdura_msg);
            }
            await usuario.save();
            ver_tienda(msg);
        } else{
            client.sendMessage(msg.from, 'Indique de nuevo correctamente cuantas semillas quiere');
        }
    }
    else if(usuario != null && usuario.estado == 8 && msg.body == 'Vender cajas de cultivos'){
    //////// VENDER CAJAS DE CULTIVOS /////////////////////// 10
        client.sendMessage(msg.from, 'Tienes ' + usuario.monedas + 'monedas');
        client.sendMessage(msg.from, 'Por cada caja de verduras te podemos dar 10 monedas, dime cuales quires vender y cuantas con números');
        verCajasVerduras(usuario, msg);
        usuario.estado = 10;
        await usuario.save();
 
    }
    else if(usuario != null && usuario.estado == 10){
        //////// VENDER CAJAS DE CULTIVOS/////////////////////// 10
            var num_cajas_str = msg.body.match(/\d+/gi);
            var numero_cajas = parseInt(num_cajas_str);
            var verdura_msg = devolver_verdura_en_mensaje(msg.body);
        if(msg.body.match(/\d+/gi) != null){
            if(consultar_cajas(verdura_msg, usuario) < numero_cajas){
                client.sendMessage(msg.from, 'No tienes suficientes cajas de ' + verdura_msg);
                usuario.estado = 8;
            }
            else{
                usuario = vender_cajas(usuario, verdura_msg, numero_cajas);
                usuario.estado = 8;
            }
            await usuario.save();
            client.sendMessage(msg.from, 'Ahora tienes ' + usuario.monedas + ' monedas');
            ver_tienda(msg);
        } else{
            client.sendMessage(msg.from, 'Indique de nuevo correctamente cuantas cajas quiere vender');
        }
    }
    else if(usuario != null && usuario.estado == 8 && msg.body == 'Volver a la granja'){
        var cultivo = await cultivos.find({ numero_tlf: usuario.numero_tlf }).exec();
        construir_granja_iconos(msg.from, cultivo);
        ver_granja(msg.from, usuario);
        usuario.estado = 3;
        await usuario.save();
    }
    else if(usuario != null && usuario.estado == 8 && msg.body != 'Vender cajas de cultivos' && msg.body != 'Comprar semillas' && msg.body != 'Volver a la granja'){
        client.sendMessage(msg.from,'Lo siento no te he entendido, ¿puedes seleccionar una opción de las acciones que se muestran arriba?');
    }
    else if(usuario != null && usuario.estado == 3 && msg.body == 'Ver inventario'){
        verInventario(usuario, msg);
        ver_granja(msg.from, usuario);
    }
    ///////////////////////RETOS/////////////////////////////////
    else if(usuario != null && usuario.estado == 3 && msg.body == 'Retos'){
        usuario.estado = 40;
        await usuario.save();
        ver_retos(msg);
    }
    else if(usuario != null && usuario.estado == 40 && msg.body == 'Buscar recompensas en tiempo real'){
        client.sendMessage(msg.from, 'Las ubicaciones son las siguientes, si estas en alguna de ellas envía tu ubicación y conseguirás un tesoro, si quieres volver, escribe volver para retroceder al menú de la granja');
        for (let i = 0; i < ubicaciones.length; i++) {
            client.sendMessage(msg.from, ubicaciones[i][0]);
        }
        usuario.estado = 41;
        await usuario.save();
    }
    else if(usuario != null && usuario.estado == 40 && msg.body == 'Otros retos'){

        client.sendMessage(msg.from,'Aún no hay más retos disponibles, esto será un a mejora para el futuro. Elige otra opcción de las de arriba');

    }
    else if(usuario != null && usuario.estado == 40 && msg.body == 'Volver'){
        usuario.estado = 3;
        await usuario.save();
        construir_granja_iconos(msg.from, cultivo);
        ver_granja(msg.from, usuario);
    }
    else if(usuario != null && usuario.estado == 40 && msg.body != 'Buscar recompensas en tiempo real' && msg.body != 'Otros retos'){

        client.sendMessage(msg.from,'Lo siento no te he entendido, ¿puedes seleccionar una opción de las acciones que se muestran arriba?');

    }
    else if(usuario != null && usuario.estado == 41 && msg.body.match((/volver/i)) != null){
        usuario.estado = 3;
        await usuario.save();
        construir_granja_iconos(msg.from, cultivo);
        ver_granja(msg.from, usuario);
    }
    else if(usuario != null && usuario.estado == 41 && msg.type == 'location'){
        var encontrado = false;
        var latitud = msg.location.latitude.toString();
        latitud = latitud.slice(0, 6);
        var longitud = msg.location.longitude.toString();
        longitud = longitud.slice(0, 6);
        console.log(latitud);
        console.log(longitud);
        for (let i = 0; i < ubicaciones.length; i++) {
            if(ubicaciones[i][1] == latitud && ubicaciones[i][2] == longitud){
                client.sendMessage(msg.from, 'Genial! Estás en ' + ubicaciones[i][0] + ' como recompensa por haberte movido para buscar la recompensa has conseguido una semilla de cada cultivo');
                usuario.semillas_tomate++;
                usuario.semillas_aguacate++;
                usuario.semillas_pepino++;
                usuario.semillas_maiz++;
                usuario.semillas_zanahoria++;
                usuario.semillas_cebolla++;
                usuario.semillas_patata++;
                usuario.estado = 3;
                await usuario.save();
                encontrado = true;
                ver_granja(msg.from, usuario)
            }
        }
        if (encontrado == false){
            client.sendMessage(msg.from, 'Lo siento no has encontrado el tesoro 🙁 Sigue probando o dime: volver. Y volverás al menú principal.');
        }
    }
    /////////////////RETOS/////////////////////////////////////
    ///////////////INVITAR AMIGOS A JUGAR//////////////////30
    else if(usuario != null && usuario.estado == 3 && msg.body == 'Invitar a un amigo a crearse una granja'){
        client.sendMessage(msg.from, 'Enviame el contacto de la persona a la que quieres invitar a jugar');
        usuario.estado = 30;
        await usuario.save();
    }
    else if(usuario != null && usuario.estado == 30){
        if (msg.body.startsWith('BEGIN:VCARD')){
            numero = msg.body.match(/(\+34|0034|34)?[ -]*(6|7)[ -]*([0-9][ -]*){8}/)[0];
            numero += '@c.us';
            var usuario_invitar = await users.findOne({ numero_tlf: numero }).exec();
            if (usuario_invitar != null)
                client.sendMessage(msg.from, 'El usuario ya está registrado');
            else
                client.sendMessage(numero, 'Hola ' + usuario.name + ' te ha invitado a crearte una granja');
            usuario.estado = 3;
            await usuario.save();
            ver_granja(msg.from, usuario);
        } else{
            client.sendMessage(msg.from, 'Envía un contacto no otra cosa');
        }
    }
    ///////////////INVITAR AMIGOS A JUGAR//////////////////30
    ///////////////VISITAR GRANJA AMIGO/////////////////////50
    else if(usuario != null && usuario.estado == 3 && msg.body == 'Visitar la granja de un amigo'){
        client.sendMessage(msg.from, 'Enviame el contacto de la persona a la que quieres visitar');
        usuario.estado = 50;
        await usuario.save();
    }
    else if(usuario != null && usuario.estado == 50){
        if (msg.body.startsWith('BEGIN:VCARD')){
            numero = msg.body.match(/(\+34|0034|34)?[ -]*(6|7)[ -]*([0-9][ -]*){8}/)[0];
            numero += '@c.us';
            var usuario_visitar = await users.findOne({ numero_tlf: numero }).exec();
            if (usuario_visitar != null){
                client.sendMessage(msg.from, 'Esta es la granja de ' + usuario_visitar.name);
                usuario.estado = 51;
                await usuario.save();
                var cultivo = await cultivos.find({ numero_tlf: usuario_visitar.numero_tlf }).exec();       
                construir_granja_iconos(msg.from, cultivo);
                client.sendMessage(msg.from, 'Si quieres volver a tu granja dime que vuelva');
            }
            else{
                client.sendMessage(msg.from, 'El usuario no tiene ninguna granja, invítalo a tener una :), vuelves a tu granja.');
                usuario.estado = 3;
                await usuario.save();
                ver_granja(msg.from, usuario);
            }
        } else{
            client.sendMessage(msg.from, 'Envía un contacto no otra cosa');
        }
    }
    else if(usuario != null && usuario.estado == 51){
        if(msg.body.match(/volver/ig)){
            usuario.estado = 3;
            await usuario.save();
            client.sendMessage(usuario.numero_tlf, 'Vuelves a tu granja');
            construir_granja_iconos(msg.from, cultivo);
            ver_granja(msg.from, usuario);
        }
    }
    ///////////////VISITAR GRANJA AMIGO/////////////////////50
    ///////////////COMERCIAR CON AMIGOS//////////////////20
    else if(usuario != null && usuario.estado == 3 && msg.body == 'Comerciar con amigos'){
        client.sendMessage(msg.from, 'Enviame el contacto de la persona con la que quieras comerciar');
        usuario.estado = 20;
        await usuario.save();
    }
    else if(usuario != null && usuario.estado == 20){
        if (msg.body.startsWith('BEGIN:VCARD')){
            numero = msg.body.match(/(\+34|0034|34)?[ -]*(6|7)[ -]*([0-9][ -]*){8}/)[0];
            numero += '@c.us';
            var usuario_comerciar = await users.findOne({ numero_tlf: numero }).exec();
            if (usuario_comerciar != null && usuario_comerciar.estado >= 3){
                client.sendMessage(numero, 'Hola ' + usuario.name + ' quiere comerciar contigo, ¿tu quieres? responde si o no');
                usuario_comerciar.estado = 21;
                usuario_comerciar.num_user_comercio = msg.from;
                await usuario_comerciar.save();
                usuario.estado = 22;
                usuario.num_user_comercio = numero;
                await usuario.save();
            }else{
                client.sendMessage(msg.from, 'El contacto que me has enviado no está registrado, invita a tu amigo a unirse para poder comerciar juntos');
                usuario.estado = 3;
                await usuario.save();
                ver_granja(msg.from, usuario);
            }
        } else{
            client.sendMessage(msg.from, 'Envía un contacto no otra cosa');

        }
    }
    else if(usuario != null && usuario.estado == 21){
        respuesta = msg.body;
        var usuario_comercio = await users.findOne({ numero_tlf: usuario.num_user_comercio}); 

        if (respuesta.match((/si/i))){
            client.sendMessage(usuario.num_user_comercio, 'El usuario ' + usuario.name + ' quiere comerciar, solo se pueden comerciar cajas de cultivos y semillas, dime primero que quieres y después que le ofreces. Ejemplo: Quiero 2 semillas de tomate y ofrezco 3 cajas de pepino. Se pueden intercalar todas las posibilidades, eso si debes especificar lo que quieres, cajas o semillas en cada caso');
            client.sendMessage(msg.from, 'De acuerdo espera mientras el otro jugador te hace una oferta');
            usuario.estado = 23;
            await usuario.save();
        }
        else if (respuesta.match((/no/i))){
            client.sendMessage(usuario.num_user_comercio, 'Lo siento no quiere comerciar');
            usuario_comercio.estado = 3;
            usuario_comercio.num_user_comercio = "";
            await usuario_comercio.save();
            ver_granja(usuario_comercio.numero_tlf, usuario_comercio)

            usuario.estado = 3;
            usuario.num_user_comercio = "";
            usuario.save();
            ver_granja(msg.from, usuario)
        }
        else {
            client.sendMessage(msg.from, 'Por favor responde si o no');
        }
    }
    else if(usuario != null && usuario.estado == 22){ //IMPLEMENTAR POR AQUI QUE SI SE OFRECE UNA CANTIDAD MAYOR QUE LA QUE SE TIENE TARSE QUIETO devolver_num_cajas
        var diferencia = 0;
        respuesta = msg.body;
        var usuario_comercio = await users.findOne({ numero_tlf: usuario.num_user_comercio}); 

        var primera_verdura = null;
        var segunda_verdura = null;

        var primer_comerciable = null;
        var segundo_comerciable = null;

        var primer_numero = null;
        var segundo_numero = null;
        try {
            primera_verdura = respuesta.match((/tomate|aguacate|pepino|maiz|zanahoria|cebolla|patata/gi))[0];
            segunda_verdura = respuesta.match((/tomate|aguacate|pepino|maiz|zanahoria|cebolla|patata/gi))[1];
            primer_comerciable = respuesta.match((/semilla|caja/gi))[0];
            segundo_comerciable = respuesta.match((/semilla|caja/gi))[1];
            primer_numero = respuesta.match((/\d+/g))[0];
            segundo_numero = respuesta.match((/\d+/g))[1];

            usuario.verdura_vender = segunda_verdura;
            usuario.verdura_comprar = primera_verdura;
    
            usuario.comerciable_vender = segundo_comerciable;
            usuario.comerciable_comprar = primer_comerciable;   
    
            usuario.cantidad_vender = parseInt(segundo_numero);
            usuario.cantidad_comprar = parseInt(primer_numero);
    
            if(usuario.comerciable_vender == 'caja'){
                diferencia = consultar_cajas(usuario.verdura_vender,usuario) - usuario.cantidad_vender;
            }else if(usuario.comerciable_vender == 'semilla'){
                diferencia = consultar_semillas(usuario.verdura_vender,usuario) - usuario.cantidad_vender;
            }
    
            if(diferencia >= 0){
    
                await usuario.save();
                
                usuario_comercio.verdura_vender = primera_verdura;
                usuario_comercio.verdura_comprar = segunda_verdura;
                usuario_comercio.comerciable_vender = primer_comerciable;
                usuario_comercio.comerciable_comprar = segundo_comerciable;   
                usuario_comercio.cantidad_vender = parseInt(primer_numero);
                usuario_comercio.cantidad_comprar = parseInt(segundo_numero);
                
                await usuario_comercio.save();
                
                client.sendMessage(usuario_comercio.numero_tlf, 'Ahora mismo tienes ' + consultar_cajas(primera_verdura, usuario_comercio) + ' cajas de ' + primera_verdura + ', ' + consultar_semillas(primera_verdura, usuario_comercio) + ' semillas de ' + primera_verdura + ' y ' + consultar_cajas(segunda_verdura, usuario_comercio) + ' cajas de ' + segunda_verdura + ', ' + consultar_semillas(segunda_verdura, usuario_comercio) + ' semillas de ' + segunda_verdura);
                client.sendMessage(usuario_comercio.numero_tlf, usuario.name + ' te ofrece ' + segundo_numero+ ' ' + segundo_comerciable + 's de ' + segunda_verdura + ' a cambio de que le des ' + primer_numero+ ' ' + primer_comerciable + 's de ' + primera_verdura + ', ¿aceptas?');
                client.sendMessage(msg.from, 'De acuerdo, vamos a esperar a ver si acepta tu oferta');
            }else{
                client.sendMessage(msg.from, 'No puedes ofrecer más cantidad de la que tienes, hazme otra oferta que sea posible');
            }
        }catch (e) {
            client.sendMessage(msg.from, 'Indica tu oferta correctamente, hay algo incorrecto');
        }


    }
    else if(usuario != null && usuario.estado == 23){
        respuesta = msg.body;
        var usuario_comercio = await users.findOne({ numero_tlf: usuario.num_user_comercio}); 

        if (respuesta.match((/si/i))){
            var diferencia = 0;
            if(usuario.comerciable_vender == 'caja'){
                diferencia = consultar_cajas(usuario.verdura_vender,usuario) - usuario.cantidad_vender;
            }else if(usuario.comerciable_vender == 'semilla'){
                diferencia = consultar_semillas(usuario.verdura_vender,usuario) - usuario.cantidad_vender;
            }
            
            if(diferencia >= 0){
                if(usuario.verdura_vender == 'tomate' && usuario.comerciable_vender == 'semilla'){
                    usuario.semillas_tomate -= usuario.cantidad_vender;
                    usuario_comercio.semillas_tomate += usuario_comercio.cantidad_comprar;
                }else if(usuario.verdura_vender == 'aguacate' && usuario.comerciable_vender == 'semilla'){
                    usuario.semillas_aguacate -= usuario.cantidad_vender;
                    usuario_comercio.semillas_aguacate += usuario_comercio.cantidad_comprar;
                }else if(usuario.verdura_vender == 'pepino' && usuario.comerciable_vender == 'semilla'){
                    usuario.semillas_pepino -= usuario.cantidad_vender;
                    usuario_comercio.semillas_pepino += usuario_comercio.cantidad_comprar;   
                }else if(usuario.verdura_vender == 'maiz' && usuario.comerciable_vender == 'semilla'){
                    usuario.semillas_maiz -= usuario.cantidad_vender;
                    usuario_comercio.semillas_maiz += usuario_comercio.cantidad_comprar;   
                }else if(usuario.verdura_vender == 'zanahoria' && usuario.comerciable_vender == 'semilla'){
                    usuario.semillas_zanahoria -= usuario.cantidad_vender;
                    usuario_comercio.semillas_zanahoria += usuario_comercio.cantidad_comprar;            
                }else if(usuario.verdura_vender == 'cebolla' && usuario.comerciable_vender == 'semilla'){
                    usuario.semillas_cebolla -= usuario.cantidad_vender;
                    usuario_comercio.semillas_cebolla += usuario_comercio.cantidad_comprar;   
                }else if(usuario.verdura_vender == 'patata' && usuario.comerciable_vender == 'semilla'){
                    usuario.semillas_patata -= usuario.cantidad_vender;
                    usuario_comercio.semillas_patata += usuario_comercio.cantidad_comprar;   
                }else if(usuario.verdura_vender == 'tomate' && usuario.comerciable_vender == 'caja'){
                    usuario.cajas_tomate -= usuario.cantidad_vender;
                    usuario_comercio.cajas_tomate += usuario_comercio.cantidad_comprar;   
                }else if(usuario.verdura_vender == 'aguacate' && usuario.comerciable_vender == 'caja'){
                    usuario.cajas_aguacate -= usuario.cantidad_vender;
                    usuario_comercio.cajas_aguacate += usuario_comercio.cantidad_comprar;
                }else if(usuario.verdura_vender == 'pepino' && usuario.comerciable_vender == 'caja'){
                    usuario.cajas_pepino -= usuario.cantidad_vender;
                    usuario_comercio.cajas_pepino += usuario_comercio.cantidad_comprar;
                }else if(usuario.verdura_vender == 'maiz' && usuario.comerciable_vender == 'caja'){
                    usuario.cajas_maiz -= usuario.cantidad_vender;
                    usuario_comercio.cajas_maiz += usuario_comercio.cantidad_comprar;
                }else if(usuario.verdura_vender == 'zanahoria' && usuario.comerciable_vender == 'caja'){
                    usuario.cajas_zanahoria -= usuario.cantidad_vender;
                    usuario_comercio.cajas_zanahoria += usuario_comercio.cantidad_comprar;    
                }else if(usuario.verdura_vender == 'cebolla' && usuario.comerciable_vender == 'caja'){
                    usuario.cajas_cebolla -= usuario.cantidad_vender;
                    usuario_comercio.cajas_cebolla += usuario_comercio.cantidad_comprar; 
                }else if(usuario.verdura_vender == 'patata' && usuario.comerciable_vender == 'caja'){
                    usuario.cajas_patata -= usuario.cantidad_vender;
                    usuario_comercio.cajas_patata += usuario_comercio.cantidad_comprar; 
                }

                if(usuario.verdura_comprar == 'tomate' && usuario.comerciable_comprar == 'semilla'){
                    usuario.semillas_tomate += usuario.cantidad_comprar;
                    usuario_comercio.semillas_tomate -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'aguacate' && usuario.comerciable_comprar == 'semilla'){
                    usuario.semillas_aguacate += usuario.cantidad_comprar;
                    usuario_comercio.semillas_aguacate-= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'pepino' && usuario.comerciable_comprar == 'semilla'){
                    usuario.semillas_pepino += usuario.cantidad_comprar;
                    usuario_comercio.semillas_pepino -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'maiz' && usuario.comerciable_comprar == 'semilla'){
                    usuario.semillas_maiz += usuario.cantidad_comprar;
                    usuario_comercio.semillas_maiz -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'zanahoria' && usuario.comerciable_comprar == 'semilla'){
                    usuario.semillas_zanahoria += usuario.cantidad_comprar;
                    usuario_comercio.semillas_zanahoria -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'cebolla' && usuario.comerciable_comprar == 'semilla'){
                    usuario.semillas_cebolla += usuario.cantidad_comprar;
                    usuario_comercio.semillas_cebolla -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'patata' && usuario.comerciable_comprar == 'semilla'){
                    usuario.semillas_patata += usuario.cantidad_comprar;
                    usuario_comercio.semillas_patata -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'tomate' && usuario.comerciable_comprar == 'caja'){
                    usuario.cajas_tomate += usuario.cantidad_comprar;
                    usuario_comercio.cajas_tomate -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'aguacate' && usuario.comerciable_comprar == 'caja'){
                    usuario.cajas_aguacate += usuario.cantidad_comprar;
                    usuario_comercio.cajas_aguacate -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'pepino' && usuario.comerciable_comprar == 'caja'){
                    usuario.cajas_pepino += usuario.cantidad_comprar;
                    usuario_comercio.cajas_pepino -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'maiz' && usuario.comerciable_comprar == 'caja'){
                    usuario.cajas_maiz += usuario.cantidad_comprar;
                    usuario_comercio.cajas_maiz -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'zanahoria' && usuario.comerciable_comprar == 'caja'){
                    usuario.cajas_zanahoria += usuario.cantidad_comprar;
                    usuario_comercio.cajas_zanahoria -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'cebolla' && usuario.comerciable_comprar == 'caja'){
                    usuario.cajas_cebolla += usuario.cantidad_comprar;
                    usuario_comercio.cajas_cebolla -= usuario_comercio.cantidad_vender;
                }else if(usuario.verdura_comprar == 'patata' && usuario.comerciable_comprar == 'caja'){
                    usuario.cajas_patata += usuario.cantidad_comprar;
                    usuario_comercio.cajas_patata -= usuario_comercio.cantidad_vender;
                }

                client.sendMessage(usuario_comercio.numero_tlf, 'Genial has recibido' + usuario_comercio.cantidad_comprar + ' ' + usuario_comercio.comerciable_comprar + ' de ' + usuario_comercio.verdura_comprar + ' a cambio de ' + usuario_comercio.cantidad_vender + ' ' + usuario_comercio.comerciable_vender + ' de ' + usuario_comercio.verdura_vender);
                usuario_comercio.estado = 3;
                usuario_comercio.num_user_comercio = "";
                usuario_comercio.verdura_vender = null;
                usuario_comercio.verdura_comprar = null;
                usuario_comercio.comerciable_vender = null;
                usuario_comercio.comerciable_comprar = null;
                usuario_comercio.cantidad_vender = 0;
                usuario_comercio.cantidad_comprar = 0;
                await usuario_comercio.save();
                ver_granja(usuario_comercio.numero_tlf, usuario_comercio);
                
                client.sendMessage(usuario.numero_tlf, 'Genial has recibido' + usuario.cantidad_comprar + ' ' + usuario.comerciable_comprar + ' de ' + usuario.verdura_comprar + ' a cambio de ' + usuario.cantidad_vender + ' ' + usuario.comerciable_vender + ' de ' + usuario.verdura_vender);
                usuario.estado = 3;
                usuario.num_user_comercio = "";
                usuario.verdura_vender = null;
                usuario.verdura_comprar = null;
                usuario.comerciable_vender = null;
                usuario.comerciable_comprar = null;
                usuario.cantidad_vender = 0;
                usuario.cantidad_comprar = 0;
                await usuario.save();
                ver_granja(msg.from, usuario);
            }else{
                client.sendMessage(usuario_comercio.numero_tlf, 'Lo siento no puede comerciar');
                usuario_comercio.estado = 3;
                usuario_comercio.num_user_comercio = "";
                usuario_comercio.verdura_vender = null;
                usuario_comercio.verdura_comprar = null;
                usuario_comercio.comerciable_vender = null;
                usuario_comercio.comerciable_comprar = null;
                usuario_comercio.cantidad_vender = 0;
                usuario_comercio.cantidad_comprar = 0;
                await usuario_comercio.save();
                ver_granja(usuario_comercio.numero_tlf, usuario_comercio)
    
                client.sendMessage(usuario.numero_tlf, 'No puedes aceptar la oferta, no tienes los recursos suficientes');
                usuario.estado = 3;
                usuario.num_user_comercio = "";
                usuario.verdura_vender = null;
                usuario.verdura_comprar = null;
                usuario.comerciable_vender = null;
                usuario.comerciable_comprar = null;
                usuario.cantidad_vender = 0;
                usuario.cantidad_comprar = 0;
                await usuario.save();
                ver_granja(msg.from, usuario)
            }
        }
        else if (respuesta.match((/no/i))){
            client.sendMessage(usuario_comercio.numero_tlf, 'Lo siento no quiere comerciar');
            usuario_comercio.estado = 3;
            usuario_comercio.num_user_comercio = "";
            usuario_comercio.verdura_vender = null;
            usuario_comercio.verdura_comprar = null;
            usuario_comercio.comerciable_vender = null;
            usuario_comercio.comerciable_comprar = null;
            usuario_comercio.cantidad_vender = 0;
            usuario_comercio.cantidad_comprar = 0;
            await usuario_comercio.save();
            ver_granja(usuario_comercio.numero_tlf, usuario_comercio)

            client.sendMessage(usuario.numero_tlf, 'De acuerdo no pasa nada');
            usuario.estado = 3;
            usuario.num_user_comercio = "";
            usuario.verdura_vender = null;
            usuario.verdura_comprar = null;
            usuario.comerciable_vender = null;
            usuario.comerciable_comprar = null;
            usuario.cantidad_vender = 0;
            usuario.cantidad_comprar = 0;
            await usuario.save();
            ver_granja(msg.from, usuario)
        }
        else {
            client.sendMessage(msg.from, 'Por favor responde si o no');
        }
    }
    ///////////////COMERCIAR CON AMIGOS//////////////////20
});

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        if (msg.body === 'YeS') {
            // Send a new message as a reply to the current one
            msg.reply('pong');
        }
    }
});

client.on('message_revoke_everyone', async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    console.log(after); // message after it was deleted.
    if (before) {
        console.log(before); // message before it was deleted.
    }
});

client.on('message_revoke_me', async (msg) => {
    // Fired whenever a message is only deleted in your own view.
    console.log(msg.body); // message before it was deleted.
});

client.on('message_ack', (msg, ack) => {
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

    if(ack == 3) {
        // The message was read
    }
});

client.on('group_join', (notification) => {
    // User has joined or been added to the group.
    console.log('join', notification);
    notification.reply('User joined.');
});

client.on('group_leave', (notification) => {
    // User has left or been kicked from the group.
    console.log('leave', notification);
    notification.reply('User left.');
});

client.on('group_update', (notification) => {
    // Group picture, subject or description has been updated.
    console.log('update', notification);
});

client.on('change_state', state => {
    console.log('CHANGE STATE', state );
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});
