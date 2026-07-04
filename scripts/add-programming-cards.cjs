const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "public",
  "english_cards_300_words_template.json"
);

// [word, pronunciation, translation, sentence, sentencePronunciation, sentenceTranslation, level]
const entries = [
  ["code", "koud", "código", "This is the source code.", "Dis iz de sors koud.", "Este es el código fuente.", "A2"],
  ["variable", "VÉ-ria-bol", "variable", "This variable stores a number.", "Dis VÉ-ria-bol stors a NAM-ber.", "Esta variable almacena un número.", "B1"],
  ["function", "FANK-shon", "función", "This function returns a value.", "Dis FANK-shon ri-TERNS a VÁ-liu.", "Esta función devuelve un valor.", "B1"],
  ["array", "a-RÉI", "arreglo", "This array has five elements.", "Dis a-RÉI jaz faiv É-le-ments.", "Este arreglo tiene cinco elementos.", "B1"],
  ["object", "ÓB-yekt", "objeto", "This object has three properties.", "Dis ÓB-yekt jaz zri PRÁ-per-tis.", "Este objeto tiene tres propiedades.", "B1"],
  ["method", "ME-zod", "método", "This method solves the problem.", "Dis ME-zod solvs de PRÁ-blem.", "Este método resuelve el problema.", "B1"],
  ["loop", "lup", "bucle", "The loop repeats ten times.", "De lup ri-PÍTS ten taims.", "El bucle se repite diez veces.", "B1"],
  ["condition", "kon-DÍ-shon", "condición", "This condition checks the value.", "Dis kon-DÍ-shon cheks de VÁ-liu.", "Esta condición verifica el valor.", "B1"],
  ["algorithm", "ÁL-go-ri-dam", "algoritmo", "This algorithm sorts the numbers.", "Dis ÁL-go-ri-dam sorts de NAM-bers.", "Este algoritmo ordena los números.", "B1"],
  ["database", "DÉI-ta-beis", "base de datos", "The database stores all the users.", "De DÉI-ta-beis stors ol de IÚ-sers.", "La base de datos almacena a todos los usuarios.", "B1"],
  ["query", "KUÍ-ri", "consulta", "I run a query on the database.", "Ai ran a KUÍ-ri on de DÉI-ta-beis.", "Ejecuto una consulta en la base de datos.", "B1"],
  ["server", "SER-ver", "servidor", "The server is down right now.", "De SER-ver iz daun rait nau.", "El servidor está caído en este momento.", "A2"],
  ["client", "KLÁI-ent", "cliente", "The client sends a request.", "De KLÁI-ent sends a ri-KUÉST.", "El cliente envía una solicitud.", "A2"],
  ["API", "ei-pi-ÁI", "API", "This app uses a public API.", "Dis ap iuzes a PA-blik ei-pi-ÁI.", "Esta aplicación usa una API pública.", "B1"],
  ["framework", "FRÉIM-uork", "framework", "We build the app with this framework.", "Uí bild di ap uid dis FRÉIM-uork.", "Construimos la aplicación con este framework.", "B1"],
  ["repository", "ri-PA-si-to-ri", "repositorio", "I pushed the code to the repository.", "Ai pusht de koud tu de ri-PA-si-to-ri.", "Subí el código al repositorio.", "B1"],
  ["branch", "brantsh", "rama", "I created a new branch for this feature.", "Ai kri-É-i-ted a niu brantsh for dis FI-cher.", "Creé una nueva rama para esta función.", "B1"],
  ["commit", "ko-MIT", "commit", "He made a small commit this morning.", "Ji meid a smol ko-MIT dis MOR-ning.", "Él hizo un pequeño commit esta mañana.", "B1"],
  ["merge", "merdch", "fusión", "I need to merge this branch.", "Ai nid tu merdch dis brantsh.", "Necesito fusionar esta rama.", "B1"],
  ["bug", "bag", "error (bicho)", "There is a bug in the code.", "Der iz a bag in de koud.", "Hay un error en el código.", "A2"],
  ["debug", "di-BAG", "depurar", "I debug the code before deploying.", "Ai di-BAG de koud bi-FOR di-PLÓI-ing.", "Depuro el código antes de desplegarlo.", "B1"],
  ["error", "É-ror", "error", "The program shows an error.", "De PRÓ-gram shous an É-ror.", "El programa muestra un error.", "A2"],
  ["exception", "ek-SEP-shon", "excepción", "The code throws an exception.", "De koud zrous an ek-SEP-shon.", "El código lanza una excepción.", "B1"],
  ["test", "test", "prueba", "I test the new feature.", "Ai test de niu FI-cher.", "Pruebo la nueva función.", "A2"],
  ["deploy", "di-PLÓI", "desplegar", "We deploy the app every Friday.", "Uí di-PLÓI di ap É-vri FRÁI-dei.", "Desplegamos la aplicación cada viernes.", "B1"],
  ["deployment", "di-PLÓI-ment", "despliegue", "The deployment finished successfully.", "De di-PLÓI-ment FI-nisht sak-SES-ful-i.", "El despliegue terminó con éxito.", "B1"],
  ["build", "bild", "compilación", "The build failed after the last commit.", "De bild feild ÁF-ter de last ko-MIT.", "La compilación falló después del último commit.", "A2"],
  ["compile", "kom-PÁIL", "compilar", "The compiler will compile the code.", "De kom-PÁI-ler uil kom-PÁIL de koud.", "El compilador compilará el código.", "B1"],
  ["syntax", "SIN-tax", "sintaxis", "There is a syntax error in this line.", "Der iz a SIN-tax É-ror in dis lain.", "Hay un error de sintaxis en esta línea.", "B1"],
  ["file", "fail", "archivo", "I saved the file on my computer.", "Ai seivd de fail on mai kom-PIU-ter.", "Guardé el archivo en mi computadora.", "A2"],
  ["folder", "FÓUL-der", "carpeta", "I put the file in this folder.", "Ai put de fail in dis FÓUL-der.", "Puse el archivo en esta carpeta.", "A2"],
  ["terminal", "TER-mi-nal", "terminal", "I run this command in the terminal.", "Ai ran dis ko-MÁND in de TER-mi-nal.", "Ejecuto este comando en la terminal.", "B1"],
  ["command", "ko-MÁND", "comando", "Type this command to install it.", "Taip dis ko-MÁND tu ins-TOL it.", "Escribe este comando para instalarlo.", "A2"],
  ["script", "skript", "script", "I wrote a script to automate this task.", "Ai rout a skript tu O-to-meit dis task.", "Escribí un script para automatizar esta tarea.", "B1"],
  ["module", "MÁ-diul", "módulo", "This module handles the payments.", "Dis MÁ-diul JÁN-dols de PÉI-ments.", "Este módulo gestiona los pagos.", "B1"],
  ["package", "PÁ-kich", "paquete", "I installed a new package.", "Ai ins-TOLD a niu PÁ-kich.", "Instalé un nuevo paquete.", "B1"],
  ["dependency", "di-PEN-den-si", "dependencia", "This project has many dependencies.", "Dis PRÁ-yekt jaz MÉ-ni di-PEN-den-sis.", "Este proyecto tiene muchas dependencias.", "B1"],
  ["version", "VER-shon", "versión", "This is the latest version.", "Dis iz de LÉI-test VER-shon.", "Esta es la última versión.", "A2"],
  ["update", "ap-DÉIT", "actualización", "I installed the last update.", "Ai ins-TOLD de last ap-DÉIT.", "Instalé la última actualización.", "A2"],
  ["release", "ri-LÍS", "lanzamiento", "The new release comes out today.", "De niu ri-LÍS kams aut tu-DÉI.", "El nuevo lanzamiento sale hoy.", "B1"],
  ["patch", "pach", "parche", "This patch fixes the bug.", "Dis pach fixes de bag.", "Este parche corrige el error.", "B1"],
  ["backend", "BÁK-end", "backend", "She works on the backend.", "Shi uorks on de BÁK-end.", "Ella trabaja en el backend.", "B1"],
  ["frontend", "FRANT-end", "frontend", "He designs the frontend.", "Ji di-ZÁINS de FRANT-end.", "Él diseña el frontend.", "B1"],
  ["stack", "stak", "pila", "This company uses a modern stack.", "Dis KÁM-pa-ni iuzes a MÁ-dern stak.", "Esta empresa usa una pila tecnológica moderna.", "B1"],
  ["hosting", "JÓUS-ting", "alojamiento", "I pay for web hosting every month.", "Ai pei for ueb JÓUS-ting É-vri manz.", "Pago por alojamiento web cada mes.", "B1"],
  ["container", "kon-TÉI-ner", "contenedor", "The app runs inside a container.", "Di ap rans in-SÁID a kon-TÉI-ner.", "La aplicación corre dentro de un contenedor.", "B1"],
  ["cache", "kash", "caché", "The browser saves files in the cache.", "De BRÁU-ser seivs failz in de kash.", "El navegador guarda archivos en la caché.", "B1"],
  ["queue", "kiu", "cola", "Each task waits in a queue.", "Ich task ueits in a kiu.", "Cada tarea espera en una cola.", "B1"],
  ["thread", "zred", "hilo", "This program runs on a single thread.", "Dis PRÓ-gram rans on a SIN-gol zred.", "Este programa corre en un solo hilo.", "B1"],
  ["process", "PRA-ses", "proceso", "This process uses a lot of memory.", "Dis PRA-ses iuzes a lat of ME-mo-ri.", "Este proceso usa mucha memoria.", "A2"],
  ["memory", "ME-mo-ri", "memoria", "This computer needs more memory.", "Dis kom-PIU-ter nids mor ME-mo-ri.", "Esta computadora necesita más memoria.", "A2"],
  ["network", "NET-uork", "red", "I connect my laptop to the network.", "Ai ko-NEKT mai LAP-top tu de NET-uork.", "Conecto mi laptop a la red.", "A2"],
  ["protocol", "PRÓ-to-kol", "protocolo", "This website uses a secure protocol.", "Dis UÉB-sait iuzes a si-KIÚR PRÓ-to-kol.", "Este sitio web usa un protocolo seguro.", "B1"],
  ["request", "ri-KUÉST", "solicitud", "The browser sends a request to the server.", "De BRÁU-ser sends a ri-KUÉST tu de SER-ver.", "El navegador envía una solicitud al servidor.", "B1"],
  ["response", "ris-PONS", "respuesta", "The server sends back a response.", "De SER-ver sends bak a ris-PONS.", "El servidor devuelve una respuesta.", "B1"],
  ["endpoint", "END-point", "punto de conexión", "The app calls this endpoint.", "Di ap kols dis END-point.", "La aplicación llama a este punto de conexión.", "B1"],
  ["authentication", "o-zen-ti-KÉI-shon", "autenticación", "This page requires authentication.", "Dis peich ri-KUÁIRS o-zen-ti-KÉI-shon.", "Esta página requiere autenticación.", "B1"],
  ["token", "TÓU-ken", "token", "The server gives you a token after login.", "De SER-ver guivs iu a TÓU-ken ÁF-ter LO-guin.", "El servidor te da un token después de iniciar sesión.", "B1"],
  ["encryption", "en-KRIP-shon", "cifrado", "This message uses strong encryption.", "Dis ME-sich iuzes strong en-KRIP-shon.", "Este mensaje usa un cifrado fuerte.", "B1"],
  ["security", "si-KIÚ-ri-ti", "seguridad", "Security is important for every app.", "Si-KIÚ-ri-ti iz im-POR-tant for É-vri ap.", "La seguridad es importante para toda aplicación.", "A2"],
  ["firewall", "FÁIR-uol", "cortafuegos", "The firewall blocks unwanted traffic.", "De FÁIR-uol blaks an-UÁN-ted TRÁ-fik.", "El cortafuegos bloquea el tráfico no deseado.", "B1"],
  ["log", "log", "registro", "Check the log for any errors.", "Chek de log for É-ni É-rors.", "Revisa el registro por si hay errores.", "A2"],
  ["monitor", "MÁ-ni-tor", "monitorear", "We monitor the server every night.", "Uí MÁ-ni-tor de SER-ver É-vri nait.", "Monitoreamos el servidor cada noche.", "B1"],
  ["performance", "per-FOR-mans", "rendimiento", "This update improves the performance.", "Dis ap-DÉIT im-PRUVS de per-FOR-mans.", "Esta actualización mejora el rendimiento.", "B1"],
  ["refactor", "ri-FÁK-tor", "refactorizar", "The team decided to refactor the code.", "De tim di-SÁI-ded tu ri-FÁK-tor de koud.", "El equipo decidió refactorizar el código.", "B1"],
  ["documentation", "do-kiu-men-TÉI-shon", "documentación", "Read the documentation before you start.", "Rid de do-kiu-men-TÉI-shon bi-FOR iu start.", "Lee la documentación antes de empezar.", "B1"],
  ["comment", "KA-ment", "comentario", "I added a comment to explain this line.", "Ai Á-ded a KA-ment tu ex-PLÉIN dis lain.", "Agregué un comentario para explicar esta línea.", "A2"],
  ["boolean", "BÚ-li-an", "booleano", "This variable is a boolean.", "Dis VÉ-ria-bol iz a BÚ-li-an.", "Esta variable es un booleano.", "B1"],
  ["integer", "ÍN-ti-yer", "entero", "This number is an integer.", "Dis NAM-ber iz an ÍN-ti-yer.", "Este número es un entero.", "B1"],
  ["string", "string", "cadena", "The name is stored as a string.", "De neim iz stord as a string.", "El nombre se almacena como una cadena.", "B1"],
  ["float", "flout", "flotante", "This price is stored as a float.", "Dis prais iz stord as a flout.", "Este precio se almacena como un flotante.", "B1"],
  ["null", "nal", "nulo", "This value is null.", "Dis VÁ-liu iz nal.", "Este valor es nulo.", "B1"],
  ["pointer", "PÓIN-ter", "puntero", "This pointer stores a memory address.", "Dis PÓIN-ter stors a ME-mo-ri Á-dres.", "Este puntero almacena una dirección de memoria.", "B1"],
  ["reference", "RE-fe-rens", "referencia", "This variable holds a reference.", "Dis VÉ-ria-bol jolds a RE-fe-rens.", "Esta variable contiene una referencia.", "B1"],
  ["recursion", "ri-KER-shon", "recursividad", "This function uses recursion.", "Dis FANK-shon iuzes ri-KER-shon.", "Esta función usa recursividad.", "B1"],
  ["iteration", "i-te-RÉI-shon", "iteración", "Each iteration checks the next item.", "Ich i-te-RÉI-shon cheks de next Á-item.", "Cada iteración revisa el siguiente elemento.", "B1"],
  ["inheritance", "in-JÉ-ri-tans", "herencia", "This class uses inheritance.", "Dis klas iuzes in-JÉ-ri-tans.", "Esta clase usa herencia.", "B1"],
  ["interface", "ÍN-ter-feis", "interfaz", "This class implements an interface.", "Dis klas ÍM-ple-ments an ÍN-ter-feis.", "Esta clase implementa una interfaz.", "B1"],
  ["abstraction", "ab-STRÁK-shon", "abstracción", "This design adds a layer of abstraction.", "Dis di-ZÁIN ads a lei-er of ab-STRÁK-shon.", "Este diseño agrega una capa de abstracción.", "B1"],
  ["constructor", "kon-STRÁK-tor", "constructor", "This constructor sets the initial values.", "Dis kon-STRÁK-tor sets de i-NÍ-shal VÁ-lius.", "Este constructor establece los valores iniciales.", "B1"],
  ["instance", "ÍNS-tans", "instancia", "I created a new instance of this class.", "Ai kri-É-i-ted a niu ÍNS-tans of dis klas.", "Creé una nueva instancia de esta clase.", "B1"],
  ["attribute", "Á-tri-biut", "atributo", "This object has a color attribute.", "Dis ÓB-yekt jaz a KA-lor Á-tri-biut.", "Este objeto tiene un atributo de color.", "B1"],
  ["property", "PRÁ-per-ti", "propiedad", "This object has three properties.", "Dis ÓB-yekt jaz zri PRÁ-per-tis.", "Este objeto tiene tres propiedades.", "B1"],
  ["parameter", "pa-RÁ-mi-ter", "parámetro", "This function takes one parameter.", "Dis FANK-shon teiks uán pa-RÁ-mi-ter.", "Esta función recibe un parámetro.", "B1"],
  ["argument", "ÁR-giu-ment", "argumento", "I pass this value as an argument.", "Ai pas dis VÁ-liu as an ÁR-giu-ment.", "Paso este valor como un argumento.", "B1"],
  ["callback", "KOL-bak", "función de retorno", "This button calls a callback function.", "Dis BÁ-ton kols a KOL-bak FANK-shon.", "Este botón llama a una función de retorno.", "B1"],
  ["event", "i-VENT", "evento", "This button triggers a click event.", "Dis BÁ-ton TRI-gers a klik i-VENT.", "Este botón activa un evento de clic.", "A2"],
  ["listener", "LI-se-ner", "listener (escucha)", "I add a listener to this button.", "Ai ad a LI-se-ner tu dis BÁ-ton.", "Agrego un listener a este botón.", "B1"],
  ["compiler", "kom-PÁI-ler", "compilador", "The compiler found an error.", "De kom-PÁI-ler faund an É-ror.", "El compilador encontró un error.", "B1"],
  ["interpreter", "in-TER-pri-ter", "intérprete", "This language uses an interpreter.", "Dis LÁN-guich iuzes an in-TER-pri-ter.", "Este lenguaje usa un intérprete.", "B1"],
  ["runtime", "RAN-taim", "tiempo de ejecución", "This error happens at runtime.", "Dis É-ror JÁ-pens at RAN-taim.", "Este error ocurre en tiempo de ejecución.", "B1"],
  ["sprint", "sprint", "sprint", "We finish this task by the end of the sprint.", "Uí FI-nish dis task bai di end of de sprint.", "Terminamos esta tarea antes de que acabe el sprint.", "B1"],
  ["backlog", "BÁK-log", "backlog", "This task is still in the backlog.", "Dis task iz stil in de BÁK-log.", "Esta tarea todavía está en el backlog.", "B1"],
  ["issue", "Í-shu", "incidencia", "I found an issue in the app.", "Ai faund an Í-shu in di ap.", "Encontré una incidencia en la aplicación.", "B1"],
  ["feature", "FI-cher", "función (característica)", "This feature is very useful.", "Dis FI-cher iz VÉ-ri IÚS-ful.", "Esta función es muy útil.", "A2"],
  ["rollback", "RÓUL-bak", "reversión", "We did a rollback after the failed deploy.", "Uí did a RÓUL-bak ÁF-ter de feild di-PLÓI.", "Hicimos una reversión después del despliegue fallido.", "B1"],
  ["environment", "en-VÁI-ron-ment", "entorno", "This code only runs in this environment.", "Dis koud ÓUN-li rans in dis en-VÁI-ron-ment.", "Este código solo funciona en este entorno.", "B1"],
  ["shortcut", "SHORT-kat", "atajo", "This shortcut saves the file.", "Dis SHORT-kat seivs de fail.", "Este atajo guarda el archivo.", "B1"],
  ["output", "ÁUT-put", "salida", "This function shows the output.", "Dis FANK-shon shous di ÁUT-put.", "Esta función muestra la salida.", "A2"],
  ["input", "ÍN-put", "entrada", "This form needs some input.", "Dis form nids sam ÍN-put.", "Este formulario necesita algo de entrada.", "A2"],
];

if (entries.length !== 100) {
  throw new Error(`Expected 100 entries, got ${entries.length}`);
}

const raw = fs.readFileSync(filePath, "utf8");
const cards = JSON.parse(raw);

const existingWords = new Set(cards.map((c) => c.word.toLowerCase()));
const existingIds = new Set(cards.map((c) => c.id));
let nextId = Math.max(...existingIds) + 1;

const seen = new Set();
for (const [word] of entries) {
  const key = word.toLowerCase();
  if (existingWords.has(key)) {
    throw new Error(`Word "${word}" already exists in the dataset`);
  }
  if (seen.has(key)) {
    throw new Error(`Duplicate word "${word}" within new entries`);
  }
  seen.add(key);
}

const newCards = entries.map(
  ([
    word,
    pronunciation,
    translation,
    sentence,
    sentencePronunciation,
    sentenceTranslation,
    level,
  ]) => ({
    id: nextId++,
    word,
    pronunciation,
    translation,
    sentence,
    sentencePronunciation,
    sentenceTranslation,
    image: `${word}.jpg`,
    category: "Programming",
    level,
  })
);

const all = [...cards, ...newCards];
fs.writeFileSync(filePath, JSON.stringify(all, null, 2) + "\n", "utf8");

console.log(`Added ${newCards.length} cards. Total now: ${all.length}.`);
console.log(`New id range: ${newCards[0].id}-${newCards[newCards.length - 1].id}`);
