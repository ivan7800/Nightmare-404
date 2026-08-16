window.N404_DATA = {
  "version": "3.2.0",
  "balance": {
    "startSignal": 7,
    "signalExplore": 3,
    "signalInvestigate": 1,
    "signalRest": 2,
    "signalCombatRound": 1,
    "restHealth": 22,
    "restSanity": 20,
    "restCap": 2,
    "clueBaseChance": 0.4,
    "investigateAmbushChance": 0.22,
    "investigateSanityMin": 2,
    "investigateSanityMax": 5,
    "dropChance": 0.45,
    "chapterSignalCap": 36,
    "chapterRestore": true,
    "playerDamageBonusMax": 5,
    "highSignalThreshold": 80,
    "highSignalSanityPenalty": 2
  },
  "characters": [
    {
      "id": "lucia",
      "name": "Lucía Vega",
      "role": "Periodista investigativa",
      "image": "assets/images/lucia.webp",
      "health": 88,
      "sanity": 96,
      "power": 9,
      "focus": 9,
      "description": "Persigue un patrón de desapariciones unido a símbolos astrales y testimonios que hablan de un mar negro bajo la ciudad.",
      "passive": "Ojo del patrón: mayor probabilidad de encontrar pistas y una opción exclusiva en ciertos eventos, como si la ciudad quisiera ser leída.",
      "passiveKey": "extraClue",
      "special": "Analizar patrón",
      "specialText": "Revela una debilidad oculta: hiere la geometría de la entidad y debilita su siguiente manifestación."
    },
    {
      "id": "gabriel",
      "name": "Matías Rivas",
      "role": "Exorcista apóstata",
      "image": "assets/images/gabriel.webp",
      "health": 96,
      "sanity": 86,
      "power": 10,
      "focus": 6,
      "description": "Abandonó la Iglesia después de escuchar una confesión pronunciada por una garganta que no pertenecía a este mundo.",
      "passive": "Liturgia del Umbral: causa daño adicional a entidades espirituales y comienza con incienso ritual.",
      "passiveKey": "spiritDamage",
      "special": "Rito de expulsión",
      "specialText": "Consume cordura para trazar un rito prohibido que desgarra la presencia de entidades extradimensionales."
    },
    {
      "id": "noa",
      "name": "Noa Sanz",
      "role": "Hacker anónima",
      "image": "assets/images/noa.webp",
      "health": 92,
      "sanity": 104,
      "power": 9,
      "focus": 8,
      "description": "Interceptó una red inalámbrica llamada PISO_404. Desde entonces recibe paquetes enviados desde una versión futura y hambrienta de sí misma.",
      "passive": "Puerta trasera: la Señal aumenta más despacio y escapar de un combate es más sencillo, como si el sistema quisiera conservarla.",
      "passiveKey": "signalControl",
      "special": "Sobrecarga de Señal",
      "specialText": "Daña a la entidad y reduce la Señal mediante una interferencia ritualizada entre código y radiofrecuencia."
    }
  ],
  "weather": [
    {
      "id": "rain",
      "name": "Lluvia de cenagal",
      "icon": "////",
      "description": "Cada gota deja un eco que no coincide con tu cuerpo.",
      "signal": 1,
      "enemy": 0,
      "clue": 0.04
    },
    {
      "id": "fog",
      "name": "Bruma abisal",
      "icon": "≋≋",
      "description": "La niebla parece respirarte antes de tocarte.",
      "signal": 1,
      "enemy": 0,
      "clue": -0.08
    },
    {
      "id": "storm",
      "name": "Tormenta ritual",
      "icon": "ϟϟ",
      "description": "La electricidad dibuja constelaciones que nadie debería interpretar.",
      "signal": 2,
      "enemy": 1,
      "clue": 0.02
    },
    {
      "id": "clear",
      "name": "Cielo sin estrellas",
      "icon": "○",
      "description": "Una calma imposible: el firmamento parece haber sido vaciado.",
      "signal": 0,
      "enemy": 0,
      "clue": 0.08
    },
    {
      "id": "eclipse",
      "name": "Alineación negra",
      "icon": "◉",
      "description": "Algo inmenso se superpone a la luna y aprende tu contorno.",
      "signal": 2,
      "enemy": 2,
      "clue": 0.12
    },
    {
      "id": "ash",
      "name": "Polvo del afuera",
      "icon": "·:·",
      "description": "Cae materia fría de un lugar donde el fuego no existe.",
      "signal": 1,
      "enemy": 1,
      "clue": 0.04
    }
  ],
  "cases": [
    {
      "id": "block404",
      "order": 1,
      "version": "v0.1",
      "title": "El Piso 404",
      "location": "Bloque 404",
      "icon": "▥",
      "scene": "block",
      "tagline": "Un ascensor canta una planta imposible que sólo existe cuando la ciudad sueña.",
      "description": "Los vecinos desaparecen después de pulsar un botón que emerge a las 04:04, como una pupila abriéndose en el panel.",
      "objective": "Reúne cuatro pistas y abre el ascensor sin dejar que la Señal convierta el edificio en un órgano del Otro Lado.",
      "clueTarget": 4,
      "minExplores": 4,
      "boss": "elevator",
      "events": [
        "b-intercom",
        "b-mirror",
        "b-neighbor",
        "b-meter",
        "b-vhs",
        "b-zero"
      ],
      "enemies": [
        "faceless",
        "shadow",
        "intercom",
        "worker"
      ],
      "weather": [
        "rain",
        "fog",
        "storm"
      ],
      "intro": "El portal está abierto. En el panel del ascensor palpita un número imposible: 404.",
      "resolution": {
        "title": "Las puertas permanecen abiertas",
        "text": "Tras la cabina no hay maquinaria sino un corredor vertical cubierto de símbolos húmedos. El edificio espera tu ofrenda.",
        "choices": [
          {
            "id": "seal",
            "label": "Sellar el umbral el acceso con el círculo de sal",
            "result": "La grieta se cierra como un ojo cauterizado y la ciudad expulsa un suspiro de piedra.",
            "seals": 1,
            "knowledge": 0,
            "signal": -2,
            "item": "universeShard"
          },
          {
            "id": "descend",
            "label": "Descender para estudiar la verdad abisal",
            "result": "Regresas con conocimiento prohibido; algo detrás del velo ya conoce tu nombre y tu respiración.",
            "seals": 0,
            "knowledge": 1,
            "signal": 0,
            "corruption": 1,
            "item": "salt"
          }
        ]
      }
    },
    {
      "id": "hospital",
      "order": 2,
      "version": "v0.2",
      "title": "La Sala 13",
      "location": "Hospital Saint Mercy",
      "icon": "✚",
      "scene": "hospital",
      "tagline": "Un ala clausurada sigue operando sobre cuerpos que ya han olvidado morir.",
      "description": "Pacientes dados por muertos reaparecen en cámaras internas, suplicando que alguien interrumpa la liturgia mecánica de las máquinas.",
      "objective": "Localiza la Sala 13, recupera los historiales y detén la cirugía cósmica que nunca termina.",
      "clueTarget": 4,
      "minExplores": 4,
      "boss": "surgeon",
      "events": [
        "h-reception",
        "h-theater",
        "h-nursery",
        "h-records",
        "h-morgue",
        "h-lift"
      ],
      "enemies": [
        "nurse",
        "orderly",
        "patient",
        "monitor"
      ],
      "weather": [
        "rain",
        "storm",
        "clear"
      ],
      "intro": "Las puertas automáticas se abren sin corriente. El altavoz pronuncia tu ingreso con una voz que parece recordar tu autopsia.",
      "resolution": {
        "title": "La puerta del quirófano respira",
        "text": "Tras la sala sellada late una membrana translúcida donde se reflejan constelaciones anatómicas.",
        "choices": [
          {
            "id": "release",
            "label": "Desconectar las máquinas y liberar a los pacientes",
            "result": "El hospital queda en silencio por primera vez en cuarenta años.",
            "seals": 1,
            "knowledge": 0,
            "signal": -2,
            "item": "ritualInk"
          },
          {
            "id": "preserve",
            "label": "Copiar la memoria clínica antes de apagarla",
            "result": "Las voces desaparecen, pero ahora sueñas recuerdos que no te pertenecen.",
            "seals": 0,
            "knowledge": 1,
            "signal": 0,
            "corruption": 1,
            "item": "blackThread"
          }
        ]
      }
    },
    {
      "id": "forest",
      "order": 3,
      "version": "v0.3",
      "title": "El Coro de las Raíces",
      "location": "Bosque Raven Woods",
      "icon": "♜",
      "scene": "forest",
      "tagline": "El bosque murmura con bocas enterradas y senderos que no llevan a la misma noche.",
      "description": "Animales y excursionistas han sido hallados secos, como si algo hubiese bebido de ellos su recuerdo de la forma.",
      "objective": "Sigue las marcas antiguas, reúne cuatro pistas y enfrenta la voluntad que enraíza Raven Woods en otra esfera.",
      "clueTarget": 4,
      "minExplores": 4,
      "boss": "stag",
      "events": [
        "f-radio",
        "f-trail",
        "f-bells",
        "f-cabin",
        "f-well",
        "f-shrine"
      ],
      "enemies": [
        "rootling",
        "moth",
        "pilgrim",
        "hound"
      ],
      "weather": [
        "fog",
        "ash",
        "eclipse"
      ],
      "intro": "El aire huele a barro salado. Entre los troncos cuelgan campanillas hechas con hueso y óxido.",
      "resolution": {
        "title": "El claro sin cielo",
        "text": "Las raíces forman un círculo perfecto desde el que puede verse un firmamento ajeno.",
        "choices": [
          {
            "id": "silence",
            "label": "Quemar el transmisor y cerrar el santuario",
            "result": "Las campanas se detienen. Los senderos vuelven a conducir al exterior.",
            "seals": 1,
            "knowledge": 0,
            "signal": -2,
            "item": "silverMirror"
          },
          {
            "id": "pact",
            "label": "Aceptar la frecuencia del bosque",
            "result": "Comprendes el idioma de las raíces. Desde entonces, los árboles giran para observarte.",
            "seals": 0,
            "knowledge": 1,
            "signal": 0,
            "corruption": 1,
            "item": "medkit"
          }
        ]
      }
    },
    {
      "id": "mansion",
      "order": 4,
      "version": "v0.4",
      "title": "El Retrato Inacabado",
      "location": "Mansión Ashcroft",
      "icon": "♛",
      "scene": "mansion",
      "tagline": "La casa conserva una genealogía escrita en retratos que aún parpadean.",
      "description": "Ashcroft Manor no está abandonada: simplemente aprendió a cerrar la puerta a las décadas correctas.",
      "objective": "Explora la mansión, reúne cuatro pistas y decide si romper o estudiar el linaje que la sostiene.",
      "clueTarget": 4,
      "minExplores": 4,
      "boss": "lady",
      "events": [
        "m-gallery",
        "m-dinner",
        "m-clock",
        "m-ballroom",
        "m-stairs",
        "m-library"
      ],
      "enemies": [
        "maid",
        "portrait",
        "twin",
        "butler"
      ],
      "weather": [
        "storm",
        "clear",
        "eclipse"
      ],
      "intro": "Los goznes no chirrían. La mansión te abre como si recordara que ya estuviste dentro en otra vida.",
      "resolution": {
        "title": "La herencia incompleta",
        "text": "El salón principal se pliega sobre sí mismo y revela una galería de retratos aún sin pintar.",
        "choices": [
          {
            "id": "burn",
            "label": "Quemar el retrato y romper la herencia",
            "result": "La casa envejece cien años en un segundo y se derrumba bajo la lluvia.",
            "seals": 1,
            "knowledge": 0,
            "signal": -2,
            "item": "portraitKey"
          },
          {
            "id": "inherit",
            "label": "Firmar como nuevo heredero Ashcroft",
            "result": "La mansión te entrega su archivo. Tu reflejo adopta una sonrisa que no reconoces.",
            "seals": 0,
            "knowledge": 1,
            "signal": 0,
            "corruption": 1,
            "item": "incense"
          }
        ]
      }
    },
    {
      "id": "nexus",
      "order": 5,
      "version": "v1.0",
      "title": "La Señal Madre",
      "location": "Nexo 404",
      "icon": "◉",
      "scene": "nexus",
      "final": true,
      "tagline": "Bajo la ciudad late una geometría que no fue diseñada para la mente humana.",
      "description": "El Nexo 404 reúne las cuatro heridas en una sola boca estelar que desea mirar a través de ti.",
      "objective": "Reúne las verdades dispersas, soporta la mirada del Nexo y decide qué relación tendrá Black Hollow con el abismo.",
      "clueTarget": 4,
      "minExplores": 4,
      "boss": "dreamer",
      "events": [
        "n-channel",
        "n-copies",
        "n-loop",
        "n-icon",
        "n-past",
        "n-threshold"
      ],
      "enemies": [
        "duplicate",
        "static",
        "observer",
        "forgotten"
      ],
      "weather": [
        "eclipse",
        "ash",
        "storm"
      ],
      "intro": "La escalera termina en un silencio líquido. Bajo tus pies, la piedra late al ritmo de algo dormido y atento."
    }
  ],
  "enemies": [
    {
      "id": "faceless",
      "case": "block404",
      "name": "La inquilina desollada del rostro",
      "icon": "◉",
      "hp": 22,
      "attack": 5,
      "sanity": 3,
      "type": "spirit",
      "text": "Sonríe con una cara completamente lisa. En su mano lleva las llaves de tu casa."
    },
    {
      "id": "shadow",
      "case": "block404",
      "name": "Sombra del rellano abisal",
      "icon": "▰",
      "hp": 24,
      "attack": 6,
      "sanity": 3,
      "type": "spirit",
      "text": "Una sombra que no pertenece a nadie. Cuando parpadeas, está más cerca."
    },
    {
      "id": "intercom",
      "case": "block404",
      "name": "Niño del interfono",
      "icon": "☎",
      "hp": 20,
      "attack": 4,
      "sanity": 5,
      "type": "spirit",
      "text": "Repite tu fecha de nacimiento desde todos los telefonillos a la vez."
    },
    {
      "id": "worker",
      "case": "block404",
      "name": "Operario sin piel",
      "icon": "⚙",
      "hp": 30,
      "attack": 7,
      "sanity": 2,
      "type": "flesh",
      "text": "Su uniforme está cosido directamente al cuerpo."
    },
    {
      "id": "nurse",
      "case": "hospital",
      "name": "Enfermera de guardia eterna",
      "icon": "✚",
      "hp": 26,
      "attack": 6,
      "sanity": 4,
      "type": "spirit",
      "text": "Consulta una hoja clínica donde tu muerte ya está firmada."
    },
    {
      "id": "orderly",
      "case": "hospital",
      "name": "Celador de porcelana",
      "icon": "▣",
      "hp": 32,
      "attack": 8,
      "sanity": 2,
      "type": "flesh",
      "text": "Empuja una camilla vacía que pesa como si llevara un cuerpo."
    },
    {
      "id": "patient",
      "case": "hospital",
      "name": "Paciente sin alta",
      "icon": "⌁",
      "hp": 28,
      "attack": 6,
      "sanity": 5,
      "type": "void",
      "text": "Tiene pulseras de ingreso con todos tus nombres posibles."
    },
    {
      "id": "monitor",
      "case": "hospital",
      "name": "Monitor cardíaco consciente",
      "icon": "⌁",
      "hp": 22,
      "attack": 5,
      "sanity": 6,
      "type": "machine",
      "text": "El pitido acelera cuando piensas en escapar."
    },
    {
      "id": "rootling",
      "case": "forest",
      "name": "Infante de raíces",
      "icon": "Ψ",
      "hp": 27,
      "attack": 6,
      "sanity": 3,
      "type": "flesh",
      "text": "Camina con las manos y deja pequeñas huellas de savia negra."
    },
    {
      "id": "moth",
      "case": "forest",
      "name": "Polilla de los recuerdos",
      "icon": "Ӿ",
      "hp": 21,
      "attack": 4,
      "sanity": 6,
      "type": "spirit",
      "text": "El polvo de sus alas borra rostros de tu memoria."
    },
    {
      "id": "pilgrim",
      "case": "forest",
      "name": "Peregrino sin sendero",
      "icon": "†",
      "hp": 34,
      "attack": 8,
      "sanity": 3,
      "type": "void",
      "text": "Lleva un mapa cosido al pecho. Todos los caminos terminan en ti."
    },
    {
      "id": "hound",
      "case": "forest",
      "name": "Sabueso de corteza",
      "icon": "⌁",
      "hp": 31,
      "attack": 9,
      "sanity": 2,
      "type": "flesh",
      "text": "No ladra. Imita la voz de la última persona que pidió ayuda."
    },
    {
      "id": "maid",
      "case": "mansion",
      "name": "Doncella de ceniza",
      "icon": "♟",
      "hp": 27,
      "attack": 6,
      "sanity": 4,
      "type": "spirit",
      "text": "Limpia manchas que todavía no han ocurrido."
    },
    {
      "id": "portrait",
      "case": "mansion",
      "name": "Retrato desprendido",
      "icon": "▧",
      "hp": 25,
      "attack": 6,
      "sanity": 6,
      "type": "void",
      "text": "La figura sale del marco dejando detrás un fondo vacío."
    },
    {
      "id": "twin",
      "case": "mansion",
      "name": "Gemelos del reloj",
      "icon": "∞",
      "hp": 33,
      "attack": 8,
      "sanity": 4,
      "type": "spirit",
      "text": "Uno habla un segundo antes que el otro. Ambos usan tu voz."
    },
    {
      "id": "butler",
      "case": "mansion",
      "name": "Mayordomo sin sombra",
      "icon": "♜",
      "hp": 37,
      "attack": 9,
      "sanity": 3,
      "type": "flesh",
      "text": "Te ofrece tu propio abrigo, todavía caliente y manchado de tierra."
    },
    {
      "id": "duplicate",
      "case": "nexus",
      "name": "Tu copia incompleta",
      "icon": "YOU",
      "hp": 36,
      "attack": 9,
      "sanity": 5,
      "type": "void",
      "text": "Recuerda decisiones que tú todavía no has tomado."
    },
    {
      "id": "static",
      "case": "nexus",
      "name": "Estática con forma humana",
      "icon": "▓",
      "hp": 31,
      "attack": 7,
      "sanity": 7,
      "type": "machine",
      "text": "Cada golpe elimina una palabra de la interfaz."
    },
    {
      "id": "observer",
      "case": "nexus",
      "name": "Observador de la grieta",
      "icon": "◉",
      "hp": 39,
      "attack": 10,
      "sanity": 5,
      "type": "spirit",
      "text": "Solo existe en el borde de la pantalla."
    },
    {
      "id": "forgotten",
      "case": "nexus",
      "name": "El personaje olvidado",
      "icon": "?",
      "hp": 42,
      "attack": 10,
      "sanity": 5,
      "type": "void",
      "text": "Asegura haber sido el cuarto protagonista desde el principio."
    }
  ],
  "bosses": [
    {
      "id": "elevator",
      "case": "block404",
      "name": "El Ascensor Voraz",
      "icon": "▥",
      "hp": 58,
      "attack": 10,
      "sanity": 6,
      "type": "void",
      "text": "Los cables son tendones. Los botones son dientes. La cabina lleva décadas esperando tu peso.",
      "weakItem": "fuse",
      "description": "Una caja litúrgica que digiere pisos, nombres y horas enteras."
    },
    {
      "id": "surgeon",
      "case": "hospital",
      "name": "El Cirujano de los Ecos",
      "icon": "✣",
      "hp": 62,
      "attack": 11,
      "sanity": 7,
      "type": "spirit",
      "text": "Opera recuerdos, no cuerpos. Cada instrumento lleva grabado uno de tus secretos.",
      "weakItem": "scalpel",
      "description": "Opera con instrumental imposible sobre anatomías que pertenecen a varias realidades a la vez."
    },
    {
      "id": "stag",
      "case": "forest",
      "name": "El Ciervo de Ceniza",
      "icon": "Ψ",
      "hp": 66,
      "attack": 12,
      "sanity": 7,
      "type": "flesh",
      "text": "Sus astas atraviesan el cielo. De cada punta cuelga una campana con un nombre.",
      "weakItem": "flare",
      "description": "Un heraldo astado cuya cornamenta dibuja constelaciones muertas entre los árboles."
    },
    {
      "id": "lady",
      "case": "mansion",
      "name": "Lady Ashcroft, la Inacabada",
      "icon": "♛",
      "hp": 70,
      "attack": 13,
      "sanity": 8,
      "type": "spirit",
      "text": "Su rostro cambia para parecerse a quien la observa. El lienzo late detrás de ella.",
      "weakItem": "silverMirror",
      "description": "La voluntad degenerada de una dinastía que no acepta el cierre de su sangre."
    },
    {
      "id": "dreamer",
      "case": "nexus",
      "name": "El Soñador del Abismo",
      "icon": "404",
      "hp": 76,
      "attack": 13,
      "sanity": 10,
      "type": "void",
      "text": "No tiene forma propia. Usa la ciudad, tus recuerdos y la interfaz para imaginarse un cuerpo.",
      "weakItem": "universeShard",
      "description": "Una inteligencia cósmica que sueña ciudades, linajes y accidentes como si fueran recuerdos propios."
    }
  ],
  "items": {
    "flashlight": {
      "id": "flashlight",
      "name": "Linterna gastada",
      "description": "Recupera 12 de cordura en combate.",
      "kind": "sanity",
      "value": 16
    },
    "medkit": {
      "id": "medkit",
      "name": "Botiquín incompleto",
      "description": "Recupera 24 de vida.",
      "kind": "health",
      "value": 30
    },
    "pills": {
      "id": "pills",
      "name": "Pastillas sin etiqueta",
      "description": "Recuperan 18 de cordura, pero aumentan la Señal.",
      "kind": "sanityRisk",
      "value": 22
    },
    "salt": {
      "id": "salt",
      "name": "Sello de sal",
      "description": "Debilita entidades del vacío.",
      "kind": "ward",
      "value": 20
    },
    "fuse": {
      "id": "fuse",
      "name": "Fusible ennegrecido",
      "description": "Debilita al Ascensor Hambriento.",
      "kind": "boss",
      "value": 18
    },
    "tape": {
      "id": "tape",
      "name": "Cinta VHS 04:04",
      "description": "Una prueba de que el Piso 404 existe.",
      "kind": "evidence",
      "value": 0
    },
    "incense": {
      "id": "incense",
      "name": "Incienso ritual",
      "description": "Reduce el siguiente ataque y recupera cordura.",
      "kind": "guard",
      "value": 16
    },
    "scalpel": {
      "id": "scalpel",
      "name": "Bisturí de memoria",
      "description": "Debilita al Cirujano de los Ecos.",
      "kind": "boss",
      "value": 18
    },
    "sedative": {
      "id": "sedative",
      "name": "Sedante experimental",
      "description": "Recupera mucha cordura, pero reduce en 4 puntos tu próximo ataque.",
      "kind": "sedative",
      "value": 26
    },
    "keycard": {
      "id": "keycard",
      "name": "Tarjeta Sala 13",
      "description": "Abre puertas clínicas selladas.",
      "kind": "evidence",
      "value": 0
    },
    "flare": {
      "id": "flare",
      "name": "Bengala forestal",
      "description": "Debilita al Ciervo de Ceniza.",
      "kind": "boss",
      "value": 18
    },
    "bell": {
      "id": "bell",
      "name": "Campana sin badajo",
      "description": "Disipa una gran cantidad de Señal.",
      "kind": "signal",
      "value": 16
    },
    "compass": {
      "id": "compass",
      "name": "Brújula invertida",
      "description": "Aumenta la probabilidad de hallar pistas.",
      "kind": "passive",
      "value": 0
    },
    "silverMirror": {
      "id": "silverMirror",
      "name": "Espejo de plata",
      "description": "Debilita a Lady Ashcroft y refleja parte del daño.",
      "kind": "boss",
      "value": 14
    },
    "portraitKey": {
      "id": "portraitKey",
      "name": "Llave del retrato",
      "description": "Abre el archivo secreto Ashcroft.",
      "kind": "evidence",
      "value": 0
    },
    "blackThread": {
      "id": "blackThread",
      "name": "Hilo quirúrgico negro",
      "description": "Recupera vida y cordura a cambio de corrupción.",
      "kind": "hybridRisk",
      "value": 26
    },
    "ritualInk": {
      "id": "ritualInk",
      "name": "Tinta ritual",
      "description": "Mejora el siguiente ataque especial.",
      "kind": "boost",
      "value": 8
    },
    "universeShard": {
      "id": "universeShard",
      "name": "Fragmento Universo 404",
      "description": "Una pieza del icono que vibra cerca del Nexo.",
      "kind": "boss",
      "value": 16
    },
    "ashcroftSeal": {
      "id": "ashcroftSeal",
      "name": "Sello Ashcroft",
      "description": "Permite reclamar una salida que no existe.",
      "kind": "signal",
      "value": 18
    },
    "battery": {
      "id": "battery",
      "name": "Batería de emergencia",
      "description": "Reduce la Señal y recupera un poco de vida.",
      "kind": "battery",
      "value": 10
    }
  },
  "events": [
    {
      "id": "b-intercom",
      "case": "block404",
      "title": "El interfono conoce tu nombre",
      "text": "El telefonillo suena. Una voz infantil susurra: «No subas. Ya estás arriba». Todos los botones se iluminan.",
      "choices": [
        {
          "label": "Cortar la corriente",
          "outcome": {
            "doom": 4,
            "clue": 1,
            "log": "Los cables forman la cifra 404 detrás del panel."
          }
        },
        {
          "label": "Responder a la voz",
          "outcome": {
            "sanity": -7,
            "enemy": "intercom",
            "log": "La voz ríe desde el piso superior."
          }
        },
        {
          "label": "[Noa] Rastrear la llamada",
          "requiresPassive": "signalControl",
          "outcome": {
            "clue": 2,
            "signal": -3,
            "log": "La llamada procede de un servidor enterrado bajo el edificio."
          }
        }
      ]
    },
    {
      "id": "b-mirror",
      "case": "block404",
      "title": "El espejo del segundo piso",
      "text": "Tu reflejo tarda un segundo en copiarte. Después levanta una mano aunque tú no te mueves.",
      "choices": [
        {
          "label": "Romper el espejo",
          "outcome": {
            "health": -5,
            "clue": 1,
            "log": "Tras el cristal hay planos antiguos sin planta cuarta."
          }
        },
        {
          "label": "Imitar al reflejo",
          "outcome": {
            "sanity": -8,
            "item": "pills",
            "log": "El reflejo deja unas pastillas en tu bolsillo."
          }
        },
        {
          "label": "[Lucía] Fotografiar el retraso",
          "requiresPassive": "extraClue",
          "outcome": {
            "clue": 2,
            "log": "La secuencia revela una puerta visible solo entre fotogramas."
          }
        }
      ]
    },
    {
      "id": "b-neighbor",
      "case": "block404",
      "title": "La puerta 3B está abierta",
      "text": "Una mujer de espaldas remueve una olla vacía. La radio anuncia que llevas desaparecido siete días.",
      "choices": [
        {
          "label": "Preguntar por el ascensor",
          "outcome": {
            "enemy": "faceless",
            "log": "La mujer se gira. No tiene rostro."
          }
        },
        {
          "label": "Registrar el recibidor",
          "outcome": {
            "doom": 6,
            "item": "medkit",
            "log": "Encuentras un botiquín y una fotografía donde apareces tú."
          }
        },
        {
          "label": "[Matías] Pronunciar el rito de identidad",
          "requiresPassive": "spiritDamage",
          "outcome": {
            "sanity": 4,
            "clue": 1,
            "log": "La entidad recuerda por un instante quién fue."
          }
        }
      ]
    },
    {
      "id": "b-meter",
      "case": "block404",
      "title": "Cuarto de contadores",
      "text": "Los contadores eléctricos giran al revés. Uno está etiquetado con tu nombre y una fecha de mañana.",
      "choices": [
        {
          "label": "Extraer el fusible 404",
          "outcome": {
            "health": -4,
            "item": "fuse",
            "clue": 1,
            "log": "El ascensor gime al perder corriente."
          }
        },
        {
          "label": "Dejarlo intacto",
          "outcome": {
            "sanity": 4,
            "doom": 5,
            "log": "Decides no tocar algo que parece estar respirando."
          }
        }
      ]
    },
    {
      "id": "b-vhs",
      "case": "block404",
      "title": "La cinta 04:04",
      "text": "Un televisor reproduce la imagen en directo del ascensor. La grabación muestra una puerta detrás de la cabina.",
      "choices": [
        {
          "label": "Llevarte la cinta",
          "outcome": {
            "item": "tape",
            "clue": 1,
            "doom": 4,
            "log": "La cinta continúa grabando dentro de tu mochila."
          }
        },
        {
          "label": "Ver la grabación completa",
          "outcome": {
            "sanity": -10,
            "clue": 2,
            "log": "El último fotograma muestra cómo herir a la cabina."
          }
        }
      ]
    },
    {
      "id": "b-zero",
      "case": "block404",
      "title": "La puerta número 0",
      "text": "Entre el 5A y el 5B aparece una puerta estrecha marcada con un cero. Desde dentro llaman tres veces.",
      "choices": [
        {
          "label": "Abrir",
          "outcome": {
            "enemy": "shadow",
            "clue": 1,
            "log": "Al otro lado hay un pasillo vertical."
          }
        },
        {
          "label": "Marcarla con sal",
          "outcome": {
            "useItem": "salt",
            "sanity": 5,
            "signal": -5,
            "log": "La puerta se pliega sobre sí misma."
          }
        },
        {
          "label": "Ignorarla",
          "outcome": {
            "sanity": -4,
            "doom": 4,
            "log": "La puerta reaparece detrás de ti."
          }
        }
      ]
    },
    {
      "id": "h-reception",
      "case": "hospital",
      "title": "Admisión para fallecidos",
      "text": "La recepcionista sella un formulario con la hora exacta de tu muerte. La tinta aún está húmeda.",
      "choices": [
        {
          "label": "Robar el registro",
          "outcome": {
            "clue": 1,
            "doom": 4,
            "log": "La Sala 13 figura entre dos plantas que comparten el mismo pasillo."
          }
        },
        {
          "label": "Firmar con un nombre falso",
          "outcome": {
            "sanity": -5,
            "item": "keycard",
            "log": "La tarjeta acepta el nombre que acabas de inventar."
          }
        },
        {
          "label": "[Lucía] Comparar las firmas",
          "requiresPassive": "extraClue",
          "outcome": {
            "clue": 2,
            "log": "Todas las altas fueron firmadas por la misma mano durante cuarenta años."
          }
        }
      ]
    },
    {
      "id": "h-theater",
      "case": "hospital",
      "title": "Quirófano en directo",
      "text": "Una operación continúa tras el cristal. El paciente se incorpora y escribe «APAGA EL ECO» con su propia sangre.",
      "choices": [
        {
          "label": "Interrumpir la corriente",
          "outcome": {
            "health": -4,
            "enemy": "monitor",
            "clue": 1,
            "log": "Los monitores gritan con voces humanas."
          }
        },
        {
          "label": "Entrar en el quirófano",
          "outcome": {
            "enemy": "nurse",
            "item": "scalpel",
            "log": "La enfermera te entrega un bisturí antes de atacarte."
          }
        }
      ]
    },
    {
      "id": "h-nursery",
      "case": "hospital",
      "title": "Cunas numeradas",
      "text": "Las cunas están vacías. Los móviles musicales giran al revés y pronuncian apellidos de la ciudad.",
      "choices": [
        {
          "label": "Detener el mecanismo",
          "outcome": {
            "sanity": -5,
            "clue": 1,
            "log": "Bajo una cuna encuentras el plano del ala clausurada."
          }
        },
        {
          "label": "Escuchar hasta el final",
          "outcome": {
            "sanity": -9,
            "item": "sedative",
            "clue": 2,
            "log": "La última canción incluye las coordenadas del sótano."
          }
        },
        {
          "label": "[Matías] Bendecir la sala",
          "requiresPassive": "spiritDamage",
          "outcome": {
            "signal": -5,
            "sanity": 5,
            "log": "Las voces infantiles se despiden una a una."
          }
        }
      ]
    },
    {
      "id": "h-records",
      "case": "hospital",
      "title": "Historiales que respiran",
      "text": "Las carpetas se hinchan como pulmones. Una lleva tu fotografía y otra la de alguien que aún no conoces.",
      "choices": [
        {
          "label": "Abrir tu expediente",
          "outcome": {
            "sanity": -7,
            "clue": 2,
            "log": "Tu historial indica exposición previa al Universo 404."
          }
        },
        {
          "label": "Quemar los expedientes",
          "outcome": {
            "doom": -4,
            "enemy": "orderly",
            "log": "Un celador entra para impedir la destrucción."
          }
        },
        {
          "label": "[Noa] Digitalizar el índice",
          "requiresPassive": "signalControl",
          "outcome": {
            "clue": 2,
            "item": "battery",
            "log": "El servidor oculto contiene una ruta hacia la Sala 13."
          }
        }
      ]
    },
    {
      "id": "h-morgue",
      "case": "hospital",
      "title": "La cámara frigorífica 13",
      "text": "Todos los cajones están abiertos menos uno. Desde dentro, alguien tararea la música del menú principal.",
      "choices": [
        {
          "label": "Abrir el cajón",
          "outcome": {
            "enemy": "patient",
            "clue": 1,
            "log": "El paciente lleva décadas esperando el alta."
          }
        },
        {
          "label": "Bloquear la cámara",
          "outcome": {
            "health": 5,
            "signal": 4,
            "log": "Ganas tiempo, pero los golpes continúan dentro de las paredes."
          }
        }
      ]
    },
    {
      "id": "h-lift",
      "case": "hospital",
      "title": "Ascensor de servicio",
      "text": "El panel solo tiene botones de parada cardíaca. Uno palpita al ritmo de tu pulso.",
      "choices": [
        {
          "label": "Pulsar el latido irregular",
          "outcome": {
            "health": -7,
            "clue": 2,
            "log": "El ascensor desciende a una planta sin electricidad."
          }
        },
        {
          "label": "Usar la tarjeta de Sala 13",
          "outcome": {
            "useItem": "keycard",
            "sanity": 4,
            "clue": 1,
            "log": "La puerta se abre directamente al quirófano original."
          }
        },
        {
          "label": "Subir por las escaleras",
          "outcome": {
            "doom": 5,
            "log": "Cada tramo devuelve al mismo rellano."
          }
        }
      ]
    },
    {
      "id": "f-radio",
      "case": "forest",
      "title": "La frecuencia 104.04",
      "text": "Una torre forestal emite nombres y coordenadas. Cuando dices el tuyo, la señal responde: «RECIBIDO».",
      "choices": [
        {
          "label": "Anotar las coordenadas",
          "outcome": {
            "clue": 1,
            "doom": 4,
            "log": "Los puntos forman un círculo alrededor del santuario."
          }
        },
        {
          "label": "Romper el transmisor",
          "outcome": {
            "enemy": "pilgrim",
            "signal": -4,
            "log": "Un peregrino sale del bosque para proteger la emisión."
          }
        },
        {
          "label": "[Noa] Inyectar ruido blanco",
          "requiresPassive": "signalControl",
          "outcome": {
            "clue": 2,
            "signal": -6,
            "log": "Durante un segundo se escucha la voz original bajo la transmisión."
          }
        }
      ]
    },
    {
      "id": "f-trail",
      "case": "forest",
      "title": "El sendero duplicado",
      "text": "Dos caminos idénticos muestran tus propias huellas avanzando en direcciones opuestas.",
      "choices": [
        {
          "label": "Seguir las huellas más recientes",
          "outcome": {
            "enemy": "hound",
            "clue": 1,
            "log": "Las huellas terminan bajo un árbol hueco."
          }
        },
        {
          "label": "Usar la brújula",
          "outcome": {
            "useItem": "compass",
            "clue": 2,
            "log": "La aguja señala hacia abajo, no hacia el norte."
          }
        },
        {
          "label": "Crear un tercer camino",
          "outcome": {
            "health": -4,
            "sanity": 3,
            "log": "Abres paso entre espinos que intentan cerrarse."
          }
        }
      ]
    },
    {
      "id": "f-bells",
      "case": "forest",
      "title": "Campanas bajo el barro",
      "text": "El suelo vibra. Pequeñas campanas enterradas suenan cada vez que recuerdas a alguien.",
      "choices": [
        {
          "label": "Desenterrar una",
          "outcome": {
            "sanity": -6,
            "item": "bell",
            "clue": 1,
            "log": "La campana no tiene badajo, pero sigue sonando."
          }
        },
        {
          "label": "Taparte los oídos y correr",
          "outcome": {
            "doom": 5,
            "enemy": "rootling",
            "log": "Las raíces se levantan para detenerte."
          }
        },
        {
          "label": "[Matías] Recitar los nombres",
          "requiresPassive": "spiritDamage",
          "outcome": {
            "sanity": 5,
            "clue": 1,
            "log": "Las campanas responden con una ruta segura."
          }
        }
      ]
    },
    {
      "id": "f-cabin",
      "case": "forest",
      "title": "La cabaña del guarda",
      "text": "En la pared hay fotografías de visitantes. En todas, una polilla cubre el rostro de quien nunca regresó.",
      "choices": [
        {
          "label": "Encender la estufa",
          "outcome": {
            "item": "flare",
            "health": 5,
            "doom": 4,
            "log": "Encuentras bengalas y una nota carbonizada."
          }
        },
        {
          "label": "Examinar las fotografías",
          "outcome": {
            "sanity": -8,
            "clue": 2,
            "item": "compass",
            "enemy": "moth",
            "log": "Encuentras una brújula invertida antes de que el polvo de las alas empiece a borrar los nombres."
          }
        }
      ]
    },
    {
      "id": "f-well",
      "case": "forest",
      "title": "El pozo de voces",
      "text": "El agua refleja un cielo diurno. Voces conocidas te ofrecen una salida a cambio de un recuerdo.",
      "choices": [
        {
          "label": "Entregar un recuerdo",
          "outcome": {
            "sanity": -10,
            "clue": 2,
            "log": "Olvidas una canción, pero recuerdas la entrada al santuario."
          }
        },
        {
          "label": "Lanzar una piedra",
          "outcome": {
            "enemy": "rootling",
            "health": -3,
            "log": "Algo devuelve la piedra desde detrás de ti."
          }
        },
        {
          "label": "[Lucía] Grabar las voces",
          "requiresPassive": "extraClue",
          "outcome": {
            "clue": 2,
            "log": "Al invertir el audio, las voces revelan el patrón de las campanas."
          }
        }
      ]
    },
    {
      "id": "f-shrine",
      "case": "forest",
      "title": "El santuario de astas",
      "text": "Cientos de astas forman un arco. En cada una hay una placa con un nombre tachado.",
      "choices": [
        {
          "label": "Atravesar el arco",
          "outcome": {
            "enemy": "pilgrim",
            "clue": 1,
            "log": "El santuario reconoce tu presencia."
          }
        },
        {
          "label": "Encender una bengala",
          "outcome": {
            "useItem": "flare",
            "signal": -5,
            "clue": 1,
            "log": "La luz revela el transmisor enterrado."
          }
        },
        {
          "label": "Añadir tu nombre",
          "outcome": {
            "sanity": -4,
            "doom": 7,
            "clue": 2,
            "log": "Las raíces aceptan el contrato."
          }
        }
      ]
    },
    {
      "id": "m-gallery",
      "case": "mansion",
      "title": "La galería te ha pintado",
      "text": "Un cuadro recién barnizado muestra tu llegada desde un ángulo imposible. La figura de tu espalda no es humana.",
      "choices": [
        {
          "label": "Cortar el lienzo",
          "outcome": {
            "enemy": "portrait",
            "clue": 1,
            "log": "Detrás hay una carta de la última heredera."
          }
        },
        {
          "label": "Posar frente al cuadro",
          "outcome": {
            "sanity": -8,
            "item": "silverMirror",
            "log": "Tu reflejo entrega un espejo desde dentro del marco."
          }
        },
        {
          "label": "[Lucía] Comparar las pinceladas",
          "requiresPassive": "extraClue",
          "outcome": {
            "clue": 2,
            "log": "Las capas antiguas revelan cuatro versiones de la misma noche."
          }
        }
      ]
    },
    {
      "id": "m-dinner",
      "case": "mansion",
      "title": "La cena está servida",
      "text": "Doce platos humean. Las sillas ocupadas se hunden bajo invitados invisibles que brindan por tu regreso.",
      "choices": [
        {
          "label": "Sentarte a la mesa",
          "outcome": {
            "sanity": -6,
            "health": 10,
            "doom": 5,
            "log": "La comida sabe a un recuerdo de infancia que no es tuyo."
          }
        },
        {
          "label": "Volcar la mesa",
          "outcome": {
            "enemy": "butler",
            "clue": 1,
            "log": "El mayordomo aparece para corregir tus modales."
          }
        },
        {
          "label": "[Matías] Bendecir el vino",
          "requiresPassive": "spiritDamage",
          "outcome": {
            "signal": -5,
            "clue": 1,
            "log": "Los comensales invisibles abandonan sus asientos."
          }
        }
      ]
    },
    {
      "id": "m-clock",
      "case": "mansion",
      "title": "La habitación de los gemelos",
      "text": "Dos relojes marcan horas distintas. Entre cada tic, los gemelos envejecen y vuelven a ser niños.",
      "choices": [
        {
          "label": "Sincronizar los relojes",
          "outcome": {
            "health": -5,
            "clue": 2,
            "enemy": "twin",
            "log": "El tiempo se rompe y los gemelos intentan conservarte."
          }
        },
        {
          "label": "Detener ambos péndulos",
          "outcome": {
            "sanity": 4,
            "doom": 5,
            "log": "La habitación queda congelada, pero no podrás mantenerla así mucho tiempo."
          }
        },
        {
          "label": "[Noa] Medir la desincronización",
          "requiresPassive": "signalControl",
          "outcome": {
            "clue": 2,
            "signal": -4,
            "log": "El desfase coincide con la frecuencia 404 Hz."
          }
        }
      ]
    },
    {
      "id": "m-ballroom",
      "case": "mansion",
      "title": "El baile de los espejos",
      "text": "Los espejos muestran una fiesta que la sala vacía no contiene. Una pareja sin rostro te invita a bailar.",
      "choices": [
        {
          "label": "Aceptar el baile",
          "outcome": {
            "sanity": -9,
            "clue": 2,
            "log": "Cada vuelta te acerca a la noche del incendio."
          }
        },
        {
          "label": "Romper el espejo central",
          "outcome": {
            "enemy": "maid",
            "health": -4,
            "item": "portraitKey",
            "log": "Una llave cae entre los cristales."
          }
        },
        {
          "label": "Usar el espejo de plata",
          "outcome": {
            "useItem": "silverMirror",
            "signal": -6,
            "clue": 1,
            "log": "La fiesta se desvanece y queda una puerta secreta."
          }
        }
      ]
    },
    {
      "id": "m-stairs",
      "case": "mansion",
      "title": "La escalera de servicio",
      "text": "Los escalones terminan en el techo. Una doncella barre ceniza hacia arriba.",
      "choices": [
        {
          "label": "Seguirla",
          "outcome": {
            "enemy": "maid",
            "clue": 1,
            "log": "La escalera gira hasta el archivo de los sirvientes."
          }
        },
        {
          "label": "Bajar caminando hacia atrás",
          "outcome": {
            "sanity": -5,
            "item": "medkit",
            "log": "Llegas al vestíbulo antes de haber empezado a bajar."
          }
        }
      ]
    },
    {
      "id": "m-library",
      "case": "mansion",
      "title": "El libro de herederos",
      "text": "El último nombre del registro está en blanco. La pluma escribe sola cada vez que acercas la mano.",
      "choices": [
        {
          "label": "Leer las anotaciones marginales",
          "outcome": {
            "sanity": -7,
            "clue": 2,
            "log": "Lady Ashcroft intentó usar el Universo 404 como puerta de inmortalidad."
          }
        },
        {
          "label": "Cerrar el libro con la llave",
          "outcome": {
            "useItem": "portraitKey",
            "signal": -5,
            "clue": 1,
            "log": "El archivo secreto queda expuesto."
          }
        },
        {
          "label": "Firmar solo una inicial",
          "outcome": {
            "doom": 7,
            "item": "ashcroftSeal",
            "log": "La casa acepta el pago parcial."
          }
        }
      ]
    },
    {
      "id": "n-channel",
      "case": "nexus",
      "title": "El canal muerto",
      "text": "Todas las pantallas de Black Hollow muestran tu partida desde fuera. Un cursor selecciona decisiones antes que tú.",
      "choices": [
        {
          "label": "Apagar las pantallas",
          "outcome": {
            "enemy": "static",
            "clue": 1,
            "signal": -3,
            "log": "La imagen persiste en las superficies oscuras."
          }
        },
        {
          "label": "Observar la siguiente decisión",
          "outcome": {
            "sanity": -8,
            "clue": 2,
            "log": "Ves una versión de la ciudad donde nunca llegaste."
          }
        }
      ]
    },
    {
      "id": "n-copies",
      "case": "nexus",
      "title": "Tres investigadores más",
      "text": "Lucía, Matías y Noa esperan al otro lado de un cristal, incluso si uno de ellos eres tú. Afirman ser la partida original.",
      "choices": [
        {
          "label": "Romper el cristal",
          "outcome": {
            "enemy": "duplicate",
            "clue": 1,
            "log": "Las copias intentan ocupar tu lugar."
          }
        },
        {
          "label": "Comparar recuerdos",
          "outcome": {
            "sanity": -7,
            "knowledge": 1,
            "clue": 2,
            "log": "Solo una memoria coincide con el icono del Universo 404."
          }
        },
        {
          "label": "[Lucía] Buscar la contradicción",
          "requiresPassive": "extraClue",
          "outcome": {
            "clue": 2,
            "sanity": 3,
            "log": "Una fecha imposible delata a las copias."
          }
        }
      ]
    },
    {
      "id": "n-loop",
      "case": "nexus",
      "title": "La calle que se repite",
      "text": "Cada esquina conduce al mismo portal. Los carteles cambian de idioma, pero todos significan «CONTINUAR».",
      "choices": [
        {
          "label": "Caminar hasta agotar el bucle",
          "outcome": {
            "health": -7,
            "clue": 2,
            "log": "El bucle falla al amanecer un segundo antes de reiniciarse."
          }
        },
        {
          "label": "Marcar el suelo con tinta ritual",
          "outcome": {
            "useItem": "ritualInk",
            "signal": -6,
            "clue": 1,
            "log": "El símbolo permanece entre reinicios."
          }
        },
        {
          "label": "[Noa] Forzar un error de coordenadas",
          "requiresPassive": "signalControl",
          "outcome": {
            "clue": 2,
            "signal": -8,
            "log": "El mundo muestra durante un instante sus bordes sin renderizar."
          }
        }
      ]
    },
    {
      "id": "n-icon",
      "case": "nexus",
      "title": "El Universo 404",
      "text": "El icono cósmico flota en una sala sin paredes. Sus espirales naranjas son focos de anomalía; los planetas azules, recuerdos conservados.",
      "choices": [
        {
          "label": "Encajar el fragmento",
          "outcome": {
            "useItem": "universeShard",
            "clue": 2,
            "signal": -8,
            "log": "El icono se convierte en un mapa tridimensional."
          }
        },
        {
          "label": "Tocar la espiral central",
          "outcome": {
            "sanity": -10,
            "knowledge": 1,
            "clue": 2,
            "log": "Comprendes que la Señal no invade la realidad: la está soñando."
          }
        },
        {
          "label": "[Matías] Consagrar el símbolo",
          "requiresPassive": "spiritDamage",
          "outcome": {
            "seals": 1,
            "signal": -6,
            "clue": 1,
            "log": "Una parte del mapa queda fuera del alcance del Soñador."
          }
        }
      ]
    },
    {
      "id": "n-past",
      "case": "nexus",
      "title": "La habitación de tu pasado",
      "text": "Detrás de una puerta encuentras el momento exacto que convirtió a tu personaje en investigador. Puedes intervenir.",
      "choices": [
        {
          "label": "Cambiar el recuerdo",
          "outcome": {
            "health": 10,
            "sanity": 10,
            "corruption": 1,
            "doom": 7,
            "log": "El dolor desaparece, pero la persona que sale de la habitación no es exactamente la misma."
          }
        },
        {
          "label": "Aceptar lo ocurrido",
          "outcome": {
            "sanity": 8,
            "clue": 1,
            "signal": -4,
            "log": "El recuerdo pierde el poder de retenerte."
          }
        }
      ]
    },
    {
      "id": "n-threshold",
      "case": "nexus",
      "title": "El borde de la interfaz",
      "text": "Los medidores, botones y textos flotan como objetos físicos. Más allá no hay ciudad, solo una presencia esperando ser nombrada.",
      "choices": [
        {
          "label": "Atravesar el borde",
          "outcome": {
            "enemy": "observer",
            "clue": 2,
            "log": "El Observador intenta devolverte a la pantalla."
          }
        },
        {
          "label": "Desactivar el HUD",
          "outcome": {
            "sanity": -6,
            "clue": 1,
            "signal": -6,
            "log": "Sin números, el miedo deja de saber cuánto poder tiene."
          }
        },
        {
          "label": "Llamar al cuarto personaje",
          "outcome": {
            "enemy": "forgotten",
            "knowledge": 1,
            "item": "universeShard",
            "log": "Algo responde desde un espacio reservado que nunca estuvo vacío. Deja atrás un fragmento azul y naranja."
          }
        }
      ]
    }
  ],
  "achievements": [
    {
      "id": "first-blood",
      "name": "Algo te ha visto",
      "description": "Derrota a tu primera entidad."
    },
    {
      "id": "case-one",
      "name": "Primera grieta",
      "description": "Resuelve El Piso 404."
    },
    {
      "id": "all-cases",
      "name": "Cartografía imposible",
      "description": "Resuelve las cuatro anomalías de Black Hollow."
    },
    {
      "id": "final-dawn",
      "name": "Después de la estática",
      "description": "Obtén el final Amanecer 404."
    },
    {
      "id": "final-archive",
      "name": "El archivo mira de vuelta",
      "description": "Obtén el final El Archivista."
    },
    {
      "id": "final-vessel",
      "name": "Nuevo anfitrión",
      "description": "Obtén el final El Recipiente."
    },
    {
      "id": "final-offline",
      "name": "Fuera de cobertura",
      "description": "Obtén el final secreto Universo desconectado."
    },
    {
      "id": "survivor",
      "name": "Aún respiras",
      "description": "Derrota a un jefe conservando al menos 45 de vida."
    },
    {
      "id": "collector",
      "name": "Mochila imposible",
      "description": "Descubre doce objetos diferentes."
    },
    {
      "id": "no-rest",
      "name": "Insomnio voluntario",
      "description": "Resuelve un misterio sin descansar."
    },
    {
      "id": "low-signal",
      "name": "Silencio de radio",
      "description": "Completa un misterio con menos del 35 % de Señal."
    },
    {
      "id": "three-voices",
      "name": "Tres versiones de la verdad",
      "description": "Termina una campaña con cada investigador."
    }
  ]
};
