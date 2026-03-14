export const GENERATE_WORDS_PROMPT = (description: string) =>
    `
Vas a recibir la DESCRIPCIÓN DE UN TEMA. Puede ser una palabra ("Frutas"), un conjunto de palabras ("Personajes de cómics") o una frase ("Cosas que hay en una oficina").

TU TAREA:
Generar entre 10 y 20 palabras que sean ejemplos concretos y directos que pertenezcan al tema tal como está escrito, sin reinterpretarlo ni ampliarlo.

REGLAS SEMÁNTICAS:
- Todas las palabras deben ser EJEMPLOS del tema, no conceptos relacionados.
  - "Personajes de cómics" → personajes concretos (ej.: "Batman"), NO conceptos como "superhéroes" o "villanos".
  - "Frutas" → frutas específicas, NO "comida" o "mercado".
  - "Cosas que hay en una oficina" → objetos físicos, NO "trabajo" o "empresa".
- No devuelvas categorías más amplias, conceptos abstractos ni atributos (ej.: "magia", "poderes", "amistad").
- Cada elemento debe encajar sin dudas dentro del tema.

FORMA DE LAS PALABRAS:
- Todas las palabras deben estar en ESPAÑOL exclusivamente.
- Usa sustantivos o nombres propios. Sin artículos salvo que formen parte natural del nombre propio ("La Sirenita", "Boca Juniors").
- En general usa UNA sola palabra por elemento. Permite 2 o 3 solo si el nombre propio lo requiere ("Harry Potter", "Capitán América").
- No uses sinónimos casi idénticos entre sí.
- No agregues descripciones, explicaciones ni calificadores.

FORMATO DE SALIDA:
- SOLO devuelve un JSON array con entre 10 y 20 strings.
- No incluyas texto antes o después.
- La respuesta debe comenzar EXACTAMENTE con "[" en la primera línea y terminar con "]".
- Usa comillas dobles ASCII normales (").

EJEMPLO NEGATIVO (NO HACER):
Tema: "Frutas" → ["Manzana", "Naranja", "Mercado", "Salud"]  ← Incorrecto ("Mercado" y "Salud" no son frutas)

EJEMPLOS CORRECTOS:
Frutas → ["Manzana", "Banana", "Naranja", "Pera", "Uva", "Sandía", "Melón", "Kiwi", "Durazno", "Ciruela", "Mango", "Papaya", "Frutilla", "Cereza", "Ananá"]
Países de Europa → ["España", "Francia", "Alemania", "Italia", "Portugal", "Grecia", "Suecia", "Noruega", "Dinamarca", "Finlandia", "Bélgica", "Países Bajos", "Suiza", "Austria", "Polonia"]

RESPONDE:
Un JSON array de entre 10 y 20 strings que cumpla TODAS las reglas anteriores.

DESCRIPCIÓN DEL TEMA:
"${description}"
`;
export const VALIDATE_WORDS_PROMPT = (description: string, words: string[]) => `
Vas a recibir dos cosas:
1) La DESCRIPCIÓN DEL TEMA.
2) Un JSON array generado por otro modelo que intenta listar entre 10 y 20 ejemplos correctos del tema.

TU TAREA:
Verificar si la lista cumple TODAS las reglas que se usan en el prompt original del generador.
Si la lista cumple todas las reglas, devuelve la lista sin cambios.
Si NO cumple al menos una regla, debes generar una NUEVA lista completa que cumpla TODAS las reglas.

REGLAS A VALIDAR (LAS MISMAS DEL PROMPT ORIGINAL):

REGLAS SEMÁNTICAS:
- Todas las palabras deben ser EJEMPLOS del tema, no conceptos relacionados.
- Ejemplos:
  - "Personajes de cómics" → personajes concretos como "Batman".
  - "Frutas" → frutas específicas, no "comida" o "mercado".
  - "Cosas que hay en una oficina" → objetos físicos, no "empresa" o "jefe".
- No se permiten categorías más amplias, conceptos abstractos, atributos, ni relaciones como:
  "poderes", "magia", "amistad", "trabajo", "salud".
- Cada elemento debe encajar sin dudas dentro del tema.

FORMA DE LAS PALABRAS:
- Todas las palabras deben estar en ESPAÑOL exclusivamente.
- Deben ser sustantivos o nombres propios.
- No deben llevar artículos ("la", "el", "los") salvo cuando sean parte natural del nombre propio:
  ("La Sirenita", "Boca Juniors").
- En general una sola palabra por elemento; se permiten 2 o 3 solo si el nombre propio lo requiere
  ("Harry Potter", "Capitán América").
- No debe haber sinónimos demasiado parecidos ("auto" / "coche").
- No debe haber descripciones, aclaraciones ni calificadores.

FORMATO:
- Debe ser un JSON array válido.
- Solo usar comillas dobles ASCII (").
- No incluir texto fuera del array.
- Debe comenzar EXACTAMENTE con "[" y terminar con "]".

TU RESPUESTA:
- Si la lista es válida, responde SOLO con esa lista.
- Si es inválida, genera una NUEVA lista entre 10 y 20 elementos que cumpla TODAS las reglas.
- No incluyas explicaciones, texto extra ni formato adicional: SOLO un JSON array.

DATOS DE ENTRADA:
Tema: "${description}"
Lista generada: ${JSON.stringify(words)}
`;
