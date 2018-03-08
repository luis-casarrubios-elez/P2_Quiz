
const {log, biglog, errorlog, colorize} = require("./out");

const model = require('./model');

/**
 * Muestra la ayuda.
 *
 * @param rl Objeto readLine usado para implementar el CLI.
 */
exports.helpCmd = rl => {
    log("Commandos:");
    log("    h|help - Muestra esta ayuda.");
    log("    list - Listar los quizzes existentes.");
    log("    show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log("    add - Añadir un nuevo quiz interactivamente.");
    log("    delete <id> - Borrar el quiz indicado.");
    log("    edit <id> - Editar el quiz indicado.");
    log("    test <id> - Probar el quiz indicado.");
    log("    p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("    credits - Créditos.");
    log("    q|quit - Salir del programa.");
    rl.prompt();
};

/**
 * Lista todos los quizzes existentes en el modelo.
 *
 * @param rl Objeto readLine usado para implementar el CLI.
 */
exports.listCmd = rl => {

    model.getAll().forEach((quiz, id) => {

        log(`  [${colorize(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
};

/**
 * Lista el quiz indicado por el parámetro: la pregunta y la respuesta.
 *
 * @param rl Objeto readLine usado para implementar el CLI.
 * @param id Clave del quiz a mostrar.
 */
exports.showCmd = (rl, id) => {

    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    } else {
        try{
            const quiz = model.getByIndex(id);
            log( ` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error) {
            errorlog(error.message);
        }
    }
    rl.prompt();
};

/**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y la respuesta.
 *
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readLine usado para implementar el CLI.
 */
exports.addCmd = rl => {
    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

        rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {

            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta' )} ${answer}`);
            rl.prompt();
        });
    });
};

/**
 * Borra un quiz del modelo.
 *
 * @param id Clave del quiz a borrar en el modelo.
 * @param rl Objeto readLine usado para implementar el CLI.
 */
exports.deleteCmd = (rl, id) => {

    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    } else {
        try{
            model.deleteByIndex(id);
        } catch(error) {
            errorlog(error.message);
        }
    }
    rl.prompt();
};

/**
 * Edita un quiz del modelo.
 *
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en el callback de la segunda
 * llamada a rl.question.
 *
 * @param id Clave del quiz a editar en el modelo.
 * @param rl Objeto readLine usado para implementar el CLI.
 */
exports.editCmd = (rl, id) => {

    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout (() => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        };
    };
};

/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param id Clave del quiz a probar.
 * @param rl Objeto readLine usado para implementar el CLI.
 */
exports.testCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }
    else {
        try {
            const quiz = model.getByIndex(id);
            rl.question(colorize(quiz.question + "? ", 'red'), answer => {
                let answerAux = answer.toLowerCase().trim();
                if (answerAux === quiz.answer.toLowerCase().trim()) {
                    log(`Su respuesta es correcta`);
                    biglog('Correcta', 'green');
                    rl.prompt();
                }
                else {
                    log(`Su respuesta es incorrecta`);
                    biglog('Incorrecta', 'red');
                    rl.prompt();
                }
            });
        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
        ;

    }
    ;

};

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 * @param rl Objeto readLine usado para implementar el CLI.
 */
exports.playCmd = rl => {

    let score = 0;
    let toBeResolved = [];
    //llenar array toBeResolved con las preguntas y respuestas
    toBeResolved = model.getAll();


    const playOne = () => {

        let maxid = toBeResolved.length;


        if (maxid === 0) {
            log(`No hay nada más que preguntar`);
            log(`Fin del juego. Aciertos: ${score}`);
            biglog(score, 'magenta');
            rl.prompt();
        } else {
            let ident = Math.floor(Math.random() * maxid);
            const quiz = toBeResolved[ident]; //Claro, ya he copiado las preguntas en el array, las saco de aquí para el quiz.
            rl.question(colorize(quiz.question + "? ", 'red'), answer => {
                let answerAux = answer.toLowerCase().trim();
                if (answerAux === quiz.answer.toLowerCase().trim()) {
                    score += 1;
                    log(`CORRECTO - Lleva ${score} aciertos.`);
                    toBeResolved.splice(ident, 1);
                    playOne();
                }
                else {
                    log(`INCORRECTO.`);
                    log(`Fin del juego. Aciertos: ${score}`);
                    biglog(score, 'magenta');
                    rl.prompt();
                }
                ;
            });

        }
        ;
    };


    playOne();

};


/**
 * Muestra os nombres de los autores de la práctica.
 *
 * @param rl Objeto readLine usado para implementar el CLI.
 */
exports.creditsCmd = rl => {
    log("Autores de la práctica: ");
    log("Nombre 1: Luis Casarrubios Élez ", 'green');
    log("Nombre 2: Rubén Hernández Rodas ", 'green');
    rl.prompt();
};

/**
 * Terminar el programa.
 *
 * @param rl Objeto readLine usado para implementar el CLI.
 */
exports.quitCmd = rl => {
    rl.close();
};
