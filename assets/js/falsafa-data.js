/**
 * Falsafa Quiz Game - Question Bank & Metadata
 * doniyorbek.uz/falsafa
 *
 * Jamoa: Turg'unboyeva Sevinch, Rahimberdiyeva Muslima, Maxsudjonova Maftuna
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FalsafaData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TOPICS = [
    {
      id: 'falsafa-asoslari',
      name: 'Falsafa asoslari',
      shortName: 'Asoslar',
      badge: '🏛️',
      description: 'Falsafaning ta\'rifi, kelib chiqishi va asosiy masalalari'
    },
    {
      id: 'antik-yunon',
      name: 'Antik Yunon falsafasi',
      shortName: 'Antik davr',
      badge: '🏺',
      description: 'Suqrot, Aflotun, Arastu va Milet maktabi'
    },
    {
      id: 'sharq-falsafasi',
      name: 'Sharq falsafasi',
      shortName: 'Sharq hikmati',
      badge: '📜',
      description: 'Forobiy, Ibn Sino, Konfutsiy, Dao va Buddaviylik'
    },
    {
      id: 'etika-adolat',
      name: 'Etika va adolat',
      shortName: 'Etika',
      badge: '⚖️',
      description: 'Axloq mezonlari, Kant, Utilitarizm va adolat nazariyalari'
    },
    {
      id: 'mantiq-tafakkur',
      name: 'Mantiq va tafakkur',
      shortName: 'Mantiq',
      badge: '🧩',
      description: 'Sillogizmlar, deduksiya, induksiya va mantiqiy xatolar'
    },
    {
      id: 'epistemologiya',
      name: 'Epistemologiya (Bilim nazariyasi)',
      shortName: 'Epistemologiya',
      badge: '🔍',
      description: 'Bilim manbalari, ratsionalizm, empirizm va haqiqat mezonlari'
    },
    {
      id: 'metafizika',
      name: 'Metafizika va borliq',
      shortName: 'Metafizika',
      badge: '🌌',
      description: 'Ontologiya, substansiya, dualizm va reallik tabiati'
    },
    {
      id: 'stoisizm-ekzistensializm',
      name: 'Stoisizm va Ekzistensializm',
      shortName: 'Stoisizm',
      badge: '🗿',
      description: 'Markus Avreliy, Seneka, Sartr, Kamyu va hayot ma\'nosi'
    },
    {
      id: 'fikriy-tajribalar',
      name: 'Falsafiy fikriy tajribalar',
      shortName: 'Fikriy tajribalar',
      badge: '💡',
      description: 'Tezey kemasi, Trolleybus muammosi, G\'or afsonasi va boshqalar'
    }
  ];

  var ACHIEVEMENTS = [
    {
      id: 'birinchi_qadam',
      title: 'Birinchi qadam',
      desc: 'Ilk bor falsafa viktorinasini yakunlang',
      icon: '🌱',
      condition: function (stats) {
        return stats.completedGames >= 1;
      }
    },
    {
      id: 'bilimdon',
      title: 'Bilimdon',
      desc: 'Jami 10 ta savolga to‘g‘ri javob bering',
      icon: '📚',
      condition: function (stats) {
        return stats.totalCorrect >= 10;
      }
    },
    {
      id: 'ketma_ketlik',
      title: 'Ketma-ketlik ustasi',
      desc: 'Ketma-ket 5 ta savolga to‘g‘ri javob bering',
      icon: '🔥',
      condition: function (stats) {
        return stats.bestStreak >= 5;
      }
    },
    {
      id: 'faylasuf',
      title: 'Faylasuf',
      desc: 'Qiyin darajadagi testni kamida 70% natija bilan bajaring',
      icon: '🦉',
      condition: function (stats, game) {
        return game && game.difficulty === 'qiyin' && game.accuracy >= 70;
      }
    },
    {
      id: 'mukammallik',
      title: 'Mukammallik',
      desc: 'Testni 100% aniqlik bilan muvaffaqiyatli yakunlang',
      icon: '👑',
      condition: function (stats, game) {
        return game && game.totalQuestions >= 5 && game.accuracy === 100;
      }
    },
    {
      id: 'mutafakkir',
      title: 'Keng qamrovli mutafakkir',
      desc: 'Kamida 4 xil mavzuda test topshiring',
      icon: '🌐',
      condition: function (stats) {
        return stats.topicsPlayed && Object.keys(stats.topicsPlayed).length >= 4;
      }
    },
    {
      id: 'kun_qahramoni',
      title: 'Kun hikmati sohibi',
      desc: '«Kun savoli»ga to‘g‘ri javob toping',
      icon: '⭐',
      condition: function (stats, game) {
        return game && game.isDaily && game.isCorrect;
      }
    }
  ];

  var RANKS = [
    { minXP: 0, title: 'Boshlovchi o‘quvchi', icon: '📜' },
    { minXP: 50, title: 'Izlanuvchi shogird', icon: '🕯️' },
    { minXP: 150, title: 'Mantiq bilimdoni', icon: '⚖️' },
    { minXP: 300, title: 'Fikrlash ustasi', icon: '🏛️' },
    { minXP: 500, title: 'Donishmand', icon: '🦉' },
    { minXP: 800, title: 'Buyuk faylasuf', icon: '✨' }
  ];

  var QUESTIONS = [
    // -------------------------------------------------------------
    // TOPIC 1: FALSAFA ASOSLARI (8 questions)
    // -------------------------------------------------------------
    {
      id: 'fa-01',
      topic: 'falsafa-asoslari',
      topicName: 'Falsafa asoslari',
      difficulty: 'oson',
      question: '«Falsafa» (yunoncha philosophia) so‘zining so‘zma-so‘z tarjimasi qaysi javobda to‘g‘ri berilgan?',
      options: [
        'Donishmandlikka muhabbat',
        'Tabiat sirlari bayoni',
        'Inson ruhiyati haqidagi ilm',
        'Mantiqiy xulosalar majmuasi'
      ],
      correctAnswer: 0,
      explanation: '«Falsafa» qadimgi yunoncha «phileo» (sevmoq, do‘st tutmoq) va «sophia» (donolik, hikmat) so‘zlarining birikuvidan hosil bo‘lib, «donishmandlikni sevish» ma\'nosini anglatadi.',
      source: 'Klassik falsafa tarixi'
    },
    {
      id: 'fa-02',
      topic: 'falsafa-asoslari',
      topicName: 'Falsafa asoslari',
      difficulty: 'oson',
      question: 'Tarixda ilk bor o‘zini «filosof» (donishmandlikni sevuvchi) deb atagan antik mutafakkir kim hisoblanadi?',
      options: [
        'Pifagor',
        'Suqrot',
        'Fales',
        'Arastu'
      ],
      correctAnswer: 0,
      explanation: 'Qadimgi manbalarga (jumladan Geraklid Pontiyalik asarlariga) ko‘ra, Pifagor birinchi bo‘lib «Men donishmand emasman, balki donishmandlikni sevuvchi (faylasuf)man» degan fikrni bildirgan.',
      source: 'Sitseron, Tusculanae Disputationes'
    },
    {
      id: 'fa-03',
      topic: 'falsafa-asoslari',
      topicName: 'Falsafa asoslari',
      difficulty: 'o\'rta',
      question: 'Milet falsafiy maktabining asoschisi va ilk yunon faylasufi deb kim e\'tirof etiladi?',
      options: [
        'Fales',
        'Geraklit',
        'Demokrit',
        'Epikur'
      ],
      correctAnswer: 0,
      explanation: 'Miletlik Fales (mil. avv. VII-VI asrlar) qadimgi Yunonistonning ilk faylasufi sanaladi. U tabiat hodisalarini mifologik emas, aqliy-mantiqiy yo‘l bilan tushuntirishga uringan.',
      source: 'Arastu, Metafizika I kitob'
    },
    {
      id: 'fa-04',
      topic: 'falsafa-asoslari',
      topicName: 'Falsafa asoslari',
      difficulty: 'o\'rta',
      question: 'Fales ta\'limotiga ko‘ra, barcha narsalarning moddiy asosi va birlamchi ibtidosi (arxe) nima?',
      options: [
        'Suv',
        'Olov',
        'Havo',
        'Tuproq'
      ],
      correctAnswer: 0,
      explanation: 'Fales barcha mavjudotlar suvdan vujudga keladi va qaytib unga aylanadi, hayot namlik bilan bevosita bog‘liq degan xulosaga kelgan.',
      source: 'Arastu, Metafizika'
    },
    {
      id: 'fa-05',
      topic: 'falsafa-asoslari',
      topicName: 'Falsafa asoslari',
      difficulty: 'qiyin',
      question: 'Anaksimandr barcha narsalarning asosi sifatida qaysi cheksiz, sifat jihatdan noaniq ibtidoni ilgari surgan?',
      options: [
        'Apeyron',
        'Atoma',
        'Gomeomeriya',
        'Pnevma'
      ],
      correctAnswer: 0,
      explanation: 'Anaksimandr olamning ibtidosi aniq bir moddiy unsur (suv yoki havo) bo‘lolmaydi, balki u chegarasiz, cheksiz va ajralmas «apeyron» bo‘lishi lozim deb hisoblagan.',
      source: 'Simplikiy sharhlari'
    },
    {
      id: 'fa-06',
      topic: 'falsafa-asoslari',
      topicName: 'Falsafa asoslari',
      difficulty: 'o\'rta',
      question: '«Hamma narsa oqadi, hamma narsa o‘zgaradi» hamda «Bir daryoga ikki marta tushib bo‘lmaydi» ta\'limotining muallifi kim?',
      options: [
        'Geraklit',
        'Parmenid',
        'Zenon',
        'Anaksimen'
      ],
      correctAnswer: 0,
      explanation: 'Efeslik Geraklit olam doimiy o‘zgarishda (dialektikada) ekanligini, qarama-qarshiliklar kurashi va birligi borliqning asosi ekanini ta\'kidlagan.',
      source: 'Geraklit parchalari'
    },
    {
      id: 'fa-07',
      topic: 'falsafa-asoslari',
      topicName: 'Falsafa asoslari',
      difficulty: 'qiyin',
      question: 'Olamning asosida «sonlar va ularning o‘zaro mutanosib uyg‘unligi» yotadi degan ta\'limot qaysi maktabga xos?',
      options: [
        'Pifagorchilar',
        'Eleyliklar',
        'Kyniklar',
        'Skeptiklar'
      ],
      correctAnswer: 0,
      explanation: 'Pifagorchilar sonlarni borliqning tub mohiyati va olam garmoniyasining mezonidir deb e\'lon qilganlar.',
      source: 'Pifagor ittifoqi ta\'limoti'
    },
    {
      id: 'fa-08',
      topic: 'falsafa-asoslari',
      topicName: 'Falsafa asoslari',
      difficulty: 'oson',
      question: 'Borliqning eng umumiy qonuniyatlari, mohiyati va shakllarini o‘rganuvchi falsafa bo‘limi qanday nomlanadi?',
      options: [
        'Ontologiya',
        'Aksiologiya',
        'Germenevtika',
        'Pedagogika'
      ],
      correctAnswer: 0,
      explanation: 'Ontologiya (yunoncha on, ontos — borliq va logos — ta\'limot) borliq haqidagi falsafiy fan hisoblanadi.',
      source: 'Falsafa ensiklopediyasi'
    },

    // -------------------------------------------------------------
    // TOPIC 2: ANTIK YUNON FALSAFASI (8 questions)
    // -------------------------------------------------------------
    {
      id: 'ay-01',
      topic: 'antik-yunon',
      topicName: 'Antik Yunon falsafasi',
      difficulty: 'oson',
      question: '«Men shuni bilamanki, men hech narsani bilmayman» degan chuqur iqror qaysi faylasufga tegishli?',
      options: [
        'Suqrot (Sokrat)',
        'Arastu (Aristotel)',
        'Epikur',
        'Protagor'
      ],
      correctAnswer: 0,
      explanation: 'Suqrot o‘zining cheklanganligini anglash haqiqiy donolikka eltuvchi ilk qadam ekanligini ta\'kidlab, shu fikrni ilgari surgan.',
      source: 'Aflotun, «Suqrot oqlanishi»'
    },
    {
      id: 'ay-02',
      topic: 'antik-yunon',
      topicName: 'Antik Yunon falsafasi',
      difficulty: 'o\'rta',
      question: 'Suqrot suhbatdoshidan savol-javob orqali haqiqatni yuzaga chiqarish usulini nima deb atagan?',
      options: [
        'Mayevtika',
        'Katarzis',
        'Apatizm',
        'Eristika'
      ],
      correctAnswer: 0,
      explanation: 'Mayevtika — so‘zma-so‘z «doyalik san\'ati» degani. Suqrot inson ruhida yashirin haqiqat tug‘ilishiga ko‘maklashishini bildirgan.',
      source: 'Aflotun, «Teetet»'
    },
    {
      id: 'ay-03',
      topic: 'antik-yunon',
      topicName: 'Antik Yunon falsafasi',
      difficulty: 'oson',
      question: 'Aflotun (Platon) mil. avv. 387-yilda Afinada asos solgan mashhur ta\'lim dargohi qanday nomlangan?',
      options: [
        'Akademiya',
        'Likey',
        'Bog\' (Epikur)',
        'Stoya'
      ],
      correctAnswer: 0,
      explanation: 'Aflotun qahramon Akadem sharafiga atalgan zaytun bog‘ida o‘z maktabini ochgan bo‘lib, u «Akademiya» nomi bilan tarixga kirdi.',
      source: 'Diogen Laertiy'
    },
    {
      id: 'ay-04',
      topic: 'antik-yunon',
      topicName: 'Antik Yunon falsafasi',
      difficulty: 'o\'rta',
      question: 'Aflotunning mashhur «G‘or afsonasi»dagi (Allegory of the Cave) devordagi soyalar nimani anglatadi?',
      options: [
        'His-tuyg‘ular orqali qabul qilinuvchi o‘tkinchi moddiy dunyoni',
        'Abadiy g‘oyalar (eydoslar) olamini',
        'Insonning sof mantiqiy tafakkurini',
        'Faqat tushdagi xayollarni'
      ],
      correctAnswer: 0,
      explanation: 'G‘ordagi zanjirlangan bandilar ko‘rayotgan soyalar — odamlarning his-tuyg‘ular orqali ko‘rgan xomxayol dunyosi bo‘lib, asl haqiqat g‘or tashqarisidagi quyosh nuri (haqiqiy g‘oyalar)dir.',
      source: 'Aflotun, «Davlat», VII kitob'
    },
    {
      id: 'ay-05',
      topic: 'antik-yunon',
      topicName: 'Antik Yunon falsafasi',
      difficulty: 'o\'rta',
      question: 'Aflotunning «Davlat» asariga ko‘ra, ideal va adolatli jamiyatni kimlar boshqarishi lozim?',
      options: [
        'Faylasuf-hukmdorlar',
        'Boy savdogarlar',
        'Harbiy qo‘mondonlar',
        'Xalq ommasi (to‘liq demokratiya)'
      ],
      correctAnswer: 0,
      explanation: 'Aflotun jamiyatni faqat ezgulik g‘oyasini va adolat mohiyatini tushungan donishmand faylasuflar boshqargandagina adolat qaror topadi deb uqtirgan.',
      source: 'Aflotun, «Davlat», V kitob'
    },
    {
      id: 'ay-06',
      topic: 'antik-yunon',
      topicName: 'Antik Yunon falsafasi',
      difficulty: 'oson',
      question: 'Arastu (Aristotel) asos solgan va sayr qilib dars o‘tiladigan maktab qanday atalgan?',
      options: [
        'Likey (Peripatetiklar maktabi)',
        'Akademiya',
        'Kyniklar maktabi',
        'Panteon'
      ],
      correctAnswer: 0,
      explanation: 'Arastu Afinada Likey maktabiga asos solgan. Ular sayr qilib bahslashganlari uchun «peripatetiklar» (sayr qiluvchilar) deb nom olgan.',
      source: 'Falsafa tarixi'
    },
    {
      id: 'ay-07',
      topic: 'antik-yunon',
      topicName: 'Antik Yunon falsafasi',
      difficulty: 'qiyin',
      question: 'Arastuning «To‘rt sabab» ta\'limotiga ko‘ra, marmar haykal yasashda marmar tosh qaysi sabab hisoblanadi?',
      options: [
        'Moddiy sabab (causa materialis)',
        'Shakliy sabab (causa formalis)',
        'Harakatlantiruvchi sabab (causa efficiens)',
        'Maqsadli sabab (causa finalis)'
      ],
      correctAnswer: 0,
      explanation: 'Arastu borliqning 4 sababini ko‘rsatadi: moddiy (marmar), shakliy (haykal loyihasi), harakatlantiruvchi (haykaltarosh mehnati) va maqsadli (go‘zallik yaratish).',
      source: 'Arastu, «Fizika» va «Metafizika»'
    },
    {
      id: 'ay-08',
      topic: 'antik-yunon',
      topicName: 'Antik Yunon falsafasi',
      difficulty: 'qiyin',
      question: '«Platon mening do‘stim, ammo haqiqat undan ham qadrliroqdir» ma\'nosidagi mashhur ibora kimga tegishli?',
      options: [
        'Arastuga',
        'Suqrotga',
        'Pifagorga',
        'Sitseronga'
      ],
      correctAnswer: 0,
      explanation: 'Arastu o‘z ustozi Aflotunning g‘oyalar olami ta\'limotini tanqid qilganida, shaxsiy hurmatdan ko‘ra ob\'yektiv haqiqat ustun turishini shunday ifodalagan.',
      source: 'Arastu, «Nikomax etikasi» I, 6'
    },

    // -------------------------------------------------------------
    // TOPIC 3: SHARQ FALSAFASI VA ALLOMALARI (8 questions)
    // -------------------------------------------------------------
    {
      id: 'shf-01',
      topic: 'sharq-falsafasi',
      topicName: 'Sharq falsafasi',
      difficulty: 'oson',
      question: 'Sharq madaniyatida Arastudan keyingi buyuk aqliy xizmatlari uchun «Ikkinchi muallim» (al-Muallim as-soniy) unvonini olgan mutafakkir kim?',
      options: [
        'Abu Nasr Forobiy',
        'Abu Ali ibn Sino',
        'Abu Rayhon Beruniy',
        'Al-Xorazmiy'
      ],
      correctAnswer: 0,
      explanation: 'Abu Nasr Forobiy Arastu falsafasini chuqur sharhlab, fanlar tasnifini yaratgani uchun Islom olamida «al-Muallim as-soniy» deb ulug‘langan.',
      source: 'Sharq mutafakkirlari merosi'
    },
    {
      id: 'shf-02',
      topic: 'sharq-falsafasi',
      topicName: 'Sharq falsafasi',
      difficulty: 'o\'rta',
      question: 'Abu Nasr Forobiyning ideal ijtimoiy tuzum va adolatli davlat konsepsiyasini bayon etgan asari qanday ataladi?',
      options: [
        'Fozil odamlar shahri',
        'Al-Qonun fit-tibb',
        'Hikmatul-ishroq',
        'Qutadg‘u bilig'
      ],
      correctAnswer: 0,
      explanation: '«Fozil odamlar shahrining qarashlari» asarida Forobiy insonlar faqat o‘zaro hamkorlik va aql boshqaruvi ostida haqiqiy baxtga erisha olishini yozgan.',
      source: 'Forobiy, Risolalar to‘plami'
    },
    {
      id: 'shf-03',
      topic: 'sharq-falsafasi',
      topicName: 'Sharq falsafasi',
      difficulty: 'oson',
      question: 'G‘arbda «Avitsenna» nomi bilan mashhur, falsafiy «Kitob ash-shifo» va «Donishnoma» asarlari muallifi kim?',
      options: [
        'Abu Ali ibn Sino',
        'Ibn Rushd',
        'Ibn Xaldun',
        'Umar Xayyom'
      ],
      correctAnswer: 0,
      explanation: 'Abu Ali ibn Sino nafaqat buyuk tabib, balki peripatetik falsafaning yirik namoyandasi bo‘lib, uning falsafiy qomusi «Kitob ash-shifo» hisoblanadi.',
      source: 'Sharq falsafasi tarixi'
    },
    {
      id: 'shf-04',
      topic: 'sharq-falsafasi',
      topicName: 'Sharq falsafasi',
      difficulty: 'o\'rta',
      question: 'Ibn Sino ontologiyasida borliq qaysi ikki asosiy toifaga ajratiladi?',
      options: [
        'Vojib ul-vujud (zaruriy) va mumkin ul-vujud (ehtimoliy)',
        'Statik borliq va kinetik borliq',
        'Tabiiy borliq va sun\'iy borliq',
        'Chekli borliq va nisbiy borliq'
      ],
      correctAnswer: 0,
      explanation: 'Ibn Sino borliqni o‘z-o‘zidan mavjud bo‘lishi zarur bo‘lgan «Vojib ul-vujud» (Alloh) va mavjud bo‘lishi sababga bog‘liq bo‘lgan «Mumkin ul-vujud»ga (barcha yaralgan olam) ajratadi.',
      source: 'Ibn Sino, «Al-Ishorat vat-tanbihat»'
    },
    {
      id: 'shf-05',
      topic: 'sharq-falsafasi',
      topicName: 'Sharq falsafasi',
      difficulty: 'o\'rta',
      question: 'Qadimgi Xitoyda «Dao» (tabiatning tabiiy qonuni, yo‘li) va harakatsizlik orqali uyg‘unlik («U-vey») ta\'limotining asoschisi kim?',
      options: [
        'Lao-szi',
        'Konfutsiy',
        'Shan Yan',
        'Sun Szi'
      ],
      correctAnswer: 0,
      explanation: 'Lao-szi «Dao De Szin» asarida inson tabiatning tabiiy oqimiga (Dao) qarshi bormasdan, ortiqcha zo‘riqishsiz yashashi lozimligini ta\'lim bergan.',
      source: 'Dao De Szin'
    },
    {
      id: 'shf-06',
      topic: 'sharq-falsafasi',
      topicName: 'Sharq falsafasi',
      difficulty: 'oson',
      question: 'Konfutsiychilik falsafasida insonning eng oliy axloqiy burchi va insonparvarlik fazilati qanday tushuncha bilan ifodalanadi?',
      options: [
        'Jen (Insoniylik)',
        'Nirvana',
        'Karma',
        'Samsara'
      ],
      correctAnswer: 0,
      explanation: '«Jen» (insonparvarlik, xayrixohlik) Konfutsiy ta\'limotidagi markaziy fazilat bo‘lib, «o‘zingga ravo ko‘rmaganni o‘zgaga qilma» tamoyiliga tayanadi.',
      source: 'Konfutsiy, «Lun Yuy»'
    },
    {
      id: 'shf-07',
      topic: 'sharq-falsafasi',
      topicName: 'Sharq falsafasi',
      difficulty: 'qiyin',
      question: 'Imom al-G‘azzoliy o‘zining qaysi mashhur asarida peripatetik faylasuflarning ratsionalistik qarashlarini tanqid qilgan?',
      options: [
        'Tahofut al-falosifa (Faylasuflarning o‘zboshimchaligi)',
        'Ihyou ulumid-din',
        'Al-Muniqz min ad-dalol',
        'Kimyoi saodat'
      ],
      correctAnswer: 0,
      explanation: 'G‘azzoliy «Tahofut al-falosifa» kitobida Arastu, Forobiy va Ibn Sinoning 20 ta asosiy metafizik masalasini mantiqiy jihatdan tanqid ostiga olgan.',
      source: 'Al-G‘azzoliy falsafasi'
    },
    {
      id: 'shf-08',
      topic: 'sharq-falsafasi',
      topicName: 'Sharq falsafasi',
      difficulty: 'qiyin',
      question: 'G‘azzoliyning asariga javoban Ibn Rushd (Averroes) ratsional falsafani himoya qilib qaysi asarni yozgan?',
      options: [
        'Tahofut at-tahofut (O‘zboshimchalikni rad etish)',
        'Fasl al-maqol',
        'Kitob al-Kulliyot',
        'Kashf an-manohij'
      ],
      correctAnswer: 0,
      explanation: 'Kordovalik Ibn Rushd «Tahofut at-tahofut» asarida falsafa va din bir-biriga zid emasligini, ikkisi ham bir haqiqatga olib boruvchi yo‘l ekanligini isbotlagan.',
      source: 'Ibn Rushd, Tahofut at-tahofut'
    },

    // -------------------------------------------------------------
    // TOPIC 4: ETIKA VA ADOLAT (8 questions)
    // -------------------------------------------------------------
    {
      id: 'ea-01',
      topic: 'etika-adolat',
      topicName: 'Etika va adolat',
      difficulty: 'oson',
      question: 'Xatti-harakatning oqibatlariga emas, insonning qat\'iy burch va axloqiy qonunlariga asoslangan etika yo‘nalishi nima deyiladi?',
      options: [
        'Deontologiya',
        'Utilitarizm',
        'Gedonizm',
        'Pragmatizm'
      ],
      correctAnswer: 0,
      explanation: 'Deontologiya (yunoncha deon — burch) axloqiy mezon harakatning foydasi yoki oqibatida emas, balki burchga sadoqatda deb hisoblaydi (Immanuil Kant asosiy namoyandasi).',
      source: 'Etika asoslari'
    },
    {
      id: 'ea-02',
      topic: 'etika-adolat',
      topicName: 'Etika va adolat',
      difficulty: 'o\'rta',
      question: 'Immanuil Kantning «Faqat shunday qoida asosidagina harakat qilki, u umuminsoniy qonunga aylanishini istay olgin» tamoyili nima deb ataladi?',
      options: [
        'Kategorik imperativ',
        'Gipotetik imperativ',
        'Nisbiylik tamoyili',
        'Foydalilik aksiomasi'
      ],
      correctAnswer: 0,
      explanation: 'Kategorik imperativ — hech qanday shartlarsiz barcha ongli mavjudotlar uchun majburiy bo‘lgan oliy axloqiy qonundir.',
      source: 'Immanuil Kant, «Axloq metafizikasining asoslari»'
    },
    {
      id: 'ea-03',
      topic: 'etika-adolat',
      topicName: 'Etika va adolat',
      difficulty: 'o\'rta',
      question: '«Eng ko‘p odamga eng katta baxt va naf keltiradigan xatti-harakat axloqiydir» degan tamoyil qaysi ta\'limotga tegishli?',
      options: [
        'Utilitarizm',
        'Stoisizm',
        'Asketizm',
        'Ekzistensializm'
      ],
      correctAnswer: 0,
      explanation: 'Utilitarizm (lotincha utilis — foyda) harakatning qiymatini uning keltirgan umumiy ijobiy oqibati va lazzati bilan o‘lchaydi.',
      source: 'I. Bentam, J. St. Mill'
    },
    {
      id: 'ea-04',
      topic: 'etika-adolat',
      topicName: 'Etika va adolat',
      difficulty: 'oson',
      question: 'Faqat rohat-farog‘at va huzurni hayotning yagona oliy ezguligi deb biluvchi axloqiy qarash nima deyiladi?',
      options: [
        'Gedonizm',
        'Kinizm',
        'Ratsionalizm',
        'Altruizm'
      ],
      correctAnswer: 0,
      explanation: 'Gedonizm (yunoncha hedone — rohat) inson xatti-harakatining bosh maqsadi jismoniy yoki ruhiy lazzatga erishish deb biladi.',
      source: 'Kirena maktabi'
    },
    {
      id: 'ea-05',
      topic: 'etika-adolat',
      topicName: 'Etika va adolat',
      difficulty: 'qiyin',
      question: 'Jon Rolz (John Rawls) adolatli jamiyat qoidalarini yaratish uchun qaysi mashhur tushunchani taklif etgan?',
      options: [
        'Beparvolik pardasi (Veil of Ignorance)',
        'Ijtimoiy shartnoma',
        'Mutlaq g‘oya',
        'Sinflar kurashi'
      ],
      correctAnswer: 0,
      explanation: 'Jon Rolz taklifiga ko‘ra, qonun chiqaruvchilar o‘zlarining jamiyatdagi kelajakdagi o‘rni, boyligi va maqomini bilmagan holda («beparvolik pardasi» ortida) eng adolatli tenglik qoidalarini tanlaydilar.',
      source: 'John Rawls, «A Theory of Justice» (1971)'
    },
    {
      id: 'ea-06',
      topic: 'etika-adolat',
      topicName: 'Etika va adolat',
      difficulty: 'o\'rta',
      question: 'Arastuning etika ta\'limotiga ko‘ra, «fazilat» nima?',
      options: [
        'Ikki chekkaning — yetishmovchilik va me\'yorsiz ortiqlikning o‘rtasidagi oltin o‘rtaliq',
        'Dunyoviy lazzatlardan butunlay voz kechish',
        'Faqat jamiyatning qonunlariga ko‘r-ko‘rona bo‘ysunish',
        'Taqdir oldida butunlay ojizlik'
      ],
      correctAnswer: 0,
      explanation: 'Arastu bo‘yicha masalan mardlik — qo‘rqoqlik (yetishmovchilik) va telba jasurlik (ortiqchalik) o‘rtasidagi me\'yordir.',
      source: 'Arastu, «Nikomax etikasi»'
    },
    {
      id: 'ea-07',
      topic: 'etika-adolat',
      topicName: 'Etika va adolat',
      difficulty: 'qiyin',
      question: 'Epikur ta\'limotiga ko‘ra, inson erishishi lozim bo‘lgan ruhiy xotirjamlik va qo‘rquvlardan xoli bo‘lish holati nima deyiladi?',
      options: [
        'Ataraksiya',
        'Apatizm',
        'Katarzis',
        'Genezis'
      ],
      correctAnswer: 0,
      explanation: 'Epikur fikricha, jismoniy azoblarning yo‘qligi (aponiya) va qalbning tashvishsiz osoyishtaligi (ataraksiya) eng oliy saodatdir.',
      source: 'Epikur, «Menekeyga maktub»'
    },
    {
      id: 'ea-08',
      topic: 'etika-adolat',
      topicName: 'Etika va adolat',
      difficulty: 'oson',
      question: 'Dunyodagi barcha yirik ma\'naviy ta\'limotlarda uchraydigan «Axloqning oltin qoidasi» qaysi fikrni ifodalaydi?',
      options: [
        'O‘zingga ravo ko‘rgan munosabatni boshqalarga ham ko‘rsat',
        'O‘zing uchun har qanday foydani qo‘lga kirit',
        'Kuchli har doim haqdir',
        'O‘tmish xatolarini unutib yashash kerak'
      ],
      correctAnswer: 0,
      explanation: '«O‘zingga nimaiki ravo ko‘rmasang, o‘zgaga ham qilma» qoidasi insoniyatning eng qadimiy umumaxloqiy mezonidir.',
      source: 'Umumjahon axloq merosi'
    },

    // -------------------------------------------------------------
    // TOPIC 5: MANTIQ VA TAFAKKUR (8 questions)
    // -------------------------------------------------------------
    {
      id: 'mt-01',
      topic: 'mantiq-tafakkur',
      topicName: 'Mantiq va tafakkur',
      difficulty: 'oson',
      question: 'Formal mantiq fanining otasi va birinchi bo‘lib mantiqiy qonunlarni tizimlashtirgan alloma kim?',
      options: [
        'Arastu (Aristotel)',
        'Suqrot',
        'Platon',
        'Leybnits'
      ],
      correctAnswer: 0,
      explanation: 'Arastuning mantiqqa oid 6 ta asari «Organon» (qurol, vosita) umumiy nomi ostida birlashtirilgan.',
      source: 'Arastu, «Organon»'
    },
    {
      id: 'mt-02',
      topic: 'mantiq-tafakkur',
      topicName: 'Mantiq va tafakkur',
      difficulty: 'o\'rta',
      question: 'Ikki asosiy hukmdan (muqaddimadan) zaruriy yangi xulosa keltirib chiqaradigan mantiqiy xulosa chiqarish shakli nima?',
      options: [
        'Sillogizm',
        'Analogiya',
        'Tavtologiya',
        'Sofizm'
      ],
      correctAnswer: 0,
      explanation: 'Masalan: «Barcha odamlar foniydir. Suqrot odamdir. Demak, Suqrot foniydir» — klassik kategorik sillogizm namunasidir.',
      source: 'Arastu, «Birinchi analitika»'
    },
    {
      id: 'mt-03',
      topic: 'mantiq-tafakkur',
      topicName: 'Mantiq va tafakkur',
      difficulty: 'oson',
      question: 'Umumiy qoidalardan xususiy faktlarga qarab xulosa chiqarish usuli qanday nomlanadi?',
      options: [
        'Deduksiya',
        'Induksiya',
        'Abduksiya',
        'Reduksiya'
      ],
      correctAnswer: 0,
      explanation: 'Deduksiya (lotincha deductio — olib chiqish) umumiy qonuniyatdan aniq xususiy holatga mantiqiy xulosa chiqarishdir.',
      source: 'Mantiq darsliklari'
    },
    {
      id: 'mt-04',
      topic: 'mantiq-tafakkur',
      topicName: 'Mantiq va tafakkur',
      difficulty: 'oson',
      question: 'Alohida yakka tajriba va faktlarni umumlashtirish orqali umumiy xulosaga kelish usuli nima?',
      options: [
        'Induksiya',
        'Deduksiya',
        'Dialektika',
        'Intuisiya'
      ],
      correctAnswer: 0,
      explanation: 'Frensis Bekon ta\'kidlagan empirik fanlarning asosiy quroli induksiya — xususiydan umumiyga qarab boruvchi bilish usulidir.',
      source: 'Frensis Bekon, «Yangi Organon»'
    },
    {
      id: 'mt-05',
      topic: 'mantiq-tafakkur',
      topicName: 'Mantiq va tafakkur',
      difficulty: 'o\'rta',
      question: 'Bahsda raqib fikrini rad eta olmay, uning shaxsiy fazilatlari, kelib chiqishi yoki kamchiliklariga hujum qilish qanday mantiqiy xato deyiladi?',
      options: [
        'Argumentum ad hominem',
        'Petitio principii',
        'Non sequitur',
        'Post hoc ergo propter hoc'
      ],
      correctAnswer: 0,
      explanation: '«Ad hominem» lotincha «shaxsga qarshi» degani bo‘lib, argumentni emas, argument keltirayotgan shaxsni kamsitish orqali xulosa chiqarishdir.',
      source: 'Mantiqiy xatolar klassifikatsiyasi'
    },
    {
      id: 'mt-06',
      topic: 'mantiq-tafakkur',
      topicName: 'Mantiq va tafakkur',
      difficulty: 'qiyin',
      question: '«Hodisani tushuntirishda zarurat bo‘lmasa, yangi tushuncha va mohiyatlarni ko‘paytirmaslik kerak» degan tamoyil qanday ataladi?',
      options: [
        'Okkam ustarasi (Occam\'s Razor)',
        'Gyodel teoremasi',
        'Paskal pul tikishi',
        'Laplas demoni'
      ],
      correctAnswer: 0,
      explanation: 'Uilyam Okkam taklif qilgan tamoyilga ko‘ra, bir xil natijani tushuntiruvchi bir necha farazdan eng soddasi va ortiqcha taxminsizrog‘i afzaldir.',
      source: 'Uilyam Okkam merosi'
    },
    {
      id: 'mt-07',
      topic: 'mantiq-tafakkur',
      topicName: 'Mantiq va tafakkur',
      difficulty: 'o\'rta',
      question: 'Bahslashayotganda raqibning fikrini o‘ta bo‘rttirib, zaif va kulgili holatga keltirib, so‘ng o‘sha yasama fikrni oson yengish qaysi mantiqiy xatodir?',
      options: [
        'Qo‘g‘irchoq argumenti (Straw Man)',
        'Silliq qiyalik (Slippery Slope)',
        'Soxta dilemma',
        'Avtoritetga tayanish'
      ],
      correctAnswer: 0,
      explanation: 'Straw Man («Qo‘g‘irchoq») xatosida haqiqiy fikr bilan emas, balki qasddan buzib ko‘rsatilgan osongina ag‘dariladigan yasama obraz bilan bahslashiladi.',
      source: 'Tanqidiy fikrlash qo‘llanmasi'
    },
    {
      id: 'mt-08',
      topic: 'mantiq-tafakkur',
      topicName: 'Mantiq va tafakkur',
      difficulty: 'qiyin',
      question: '«Ushbu jumla yolg‘ondir» ifodasi mantiqda qaysi mashhur aqliy muammoning klassik namunasidir?',
      options: [
        'Yolg‘onchi paradoksi',
        'Zenon aporiyasi',
        'Buran eshagi',
        'Epimenid jumboqi'
      ],
      correctAnswer: 0,
      explanation: 'Agar bu jumla rost bo‘lsa, u holda u aytganidek yolg‘on bo‘ladi; agar u yolg‘on bo‘lsa, demak uning «yolg‘on» ekani rost bo‘lib chiqadi va cheksiz ziddiyat vujudga keladi.',
      source: 'Formal mantiq paradokslari'
    },

    // -------------------------------------------------------------
    // TOPIC 6: EPISTEMOLOGIYA (8 questions)
    // -------------------------------------------------------------
    {
      id: 'ep-01',
      topic: 'epistemologiya',
      topicName: 'Epistemologiya',
      difficulty: 'oson',
      question: 'Inson bilishining tabiati, chegaralari, ishonchliligi va haqiqat mezonlarini o‘rganuvchi falsafa bo‘limi nima deyiladi?',
      options: [
        'Epistemologiya (Gnoseologiya)',
        'Eskatologiya',
        'Teologiya',
        'Semiotika'
      ],
      correctAnswer: 0,
      explanation: 'Epistemologiya (yunoncha episteme — bilim va logos — so‘z) bilish nazariyasi hisoblanadi.',
      source: 'Falsafa ensiklopediyasi'
    },
    {
      id: 'ep-02',
      topic: 'epistemologiya',
      topicName: 'Epistemologiya',
      difficulty: 'o\'rta',
      question: '«Fikrlayapman, demak, mavjudman» (Cogito, ergo sum) g‘oyasi qaysi buyuk mutafakkirga tegishli?',
      options: [
        'Rene Dekart',
        'Frensis Bekon',
        'Barux Spinoza',
        'Tomas Gobbs'
      ],
      correctAnswer: 0,
      explanation: 'Rene Dekart har qanday narsadan shubhalanish mumkinligini, lekin shubhalanayotgan «men»ning ayni daqiqadagi fikrlash jarayonidan shubhalanish mantiqan imkonsiz ekanini asoslagan.',
      source: 'Rene Dekart, «Metod haqida mulohazalar»'
    },
    {
      id: 'ep-03',
      topic: 'epistemologiya',
      topicName: 'Epistemologiya',
      difficulty: 'oson',
      question: 'Inson ongida tug‘ma bilimlar yo‘q, barcha bilim faqat his-tuyg‘ular va tashqi tajriba orqali olinadi deb hisoblovchi ta\'limot qaysi?',
      options: [
        'Empirizm',
        'Ratsionalizm',
        'Solipsizm',
        'Dogmatizm'
      ],
      correctAnswer: 0,
      explanation: 'Empirizm (yunoncha empeiria — tajriba) bilishning birdan-bir manbasi sezgi a\'zolari tajribasi deb ta\'kidlaydi (Jon Lokk, Devid Yum).',
      source: 'Epistemologiya tarixi'
    },
    {
      id: 'ep-04',
      topic: 'epistemologiya',
      topicName: 'Epistemologiya',
      difficulty: 'o\'rta',
      question: 'Jon Lokk inson tug‘ilgan paytdagi ongini qaysi ifoda bilan ta\'riflagan?',
      options: [
        'Tabula rasa (Toza taxta)',
        'Anamnezis (Eslash)',
        'Mutlaq aql',
        'A priori bilim'
      ],
      correctAnswer: 0,
      explanation: 'Jon Lokk inson ruhi tug‘ilganda hech narsa yozilmagan toza qog‘oz (tabula rasa) ekani, barcha tasavvurlar tajriba orqali yozilishini uqtirgan.',
      source: 'Jon Lokk, «Inson aqli to‘g‘risida tajriba»'
    },
    {
      id: 'ep-05',
      topic: 'epistemologiya',
      topicName: 'Epistemologiya',
      difficulty: 'qiyin',
      question: 'Immanuil Kant «Noumen» (O‘zidagi narsa / Ding an sich) tushunchasi orqali nimani tushuntirgan?',
      options: [
        'Inson sezgilariga bog‘liq bo‘lmagan, lekin aql bevosita idrok eta olmaydigan narsalarning asl mohiyatini',
        'Bizning ko‘zimizga ko‘ringan tashqi hodisalarni (fenomenlarni)',
        'Inson ongida tajribagacha mavjud tushunchalarni',
        'Faqat matematik teoremalarni'
      ],
      correctAnswer: 0,
      explanation: 'Kant inson faqat narsalarning bizga ko‘rinishini (fenomenlarni) bilishi mumkin, lekin narsaning o‘zidagi asl mohiyati (noumen) tajribamizdan tashqarida qoladi degan.',
      source: 'Immanuil Kant, «Sof aql tanqidi»'
    },
    {
      id: 'ep-06',
      topic: 'epistemologiya',
      topicName: 'Epistemologiya',
      difficulty: 'qiyin',
      question: 'Aflotundan buyon epistemologiyada keng qabul qilingan «Bilim»ning klassik ta\'rifi qanday?',
      options: [
        'Asoslangan chin ishonch (Justified True Belief)',
        'Faqat ko‘z bilan ko‘rilgan dalil',
        'Ko‘pchilik tomonidan ma\'qullangan fikr',
        'Foyda keltiruvchi har qanday taxmin'
      ],
      correctAnswer: 0,
      explanation: 'Klassik JTB (Justified True Belief) formulasiga ko‘ra, biror narsa bilim bo‘lishi uchun u: 1) ishonch bo‘lishi, 2) chin (haqiqat) bo‘lishi, 3) mustahkam dalil bilan asoslangan bo‘lishi zarur.',
      source: 'Aflotun, «Menon» va «Teetet»'
    },
    {
      id: 'ep-07',
      topic: 'epistemologiya',
      topicName: 'Epistemologiya',
      difficulty: 'qiyin',
      question: '1963-yilda klassik «Asoslangan chin ishonch» formulasi to‘liq emasligini qarshi misollar bilan ko‘rsatgan amerikalik faylasuf kim?',
      options: [
        'Edmund Gettier',
        'Uillard Van Orman Kuayn',
        'Tomas Kun',
        'Karl Popper'
      ],
      correctAnswer: 0,
      explanation: '«Gettier muammosi» ba\'zan insonning chin va asoslangan e\'tiqodi shunchaki tasodif tufayli to‘g‘ri chiqib qolishi mumkinligini va buni haqiqiy bilim deb atash qiyinligini isbotlagan.',
      source: 'Edmund Gettier, «Is Justified True Belief Knowledge?»'
    },
    {
      id: 'ep-08',
      topic: 'epistemologiya',
      topicName: 'Epistemologiya',
      difficulty: 'o\'rta',
      question: 'Karl Popper bo‘yicha, ilmiy nazariyaning haqiqiy mezonini belgilovchi tamoyil nima?',
      options: [
        'Falsifikatsiya (Rad etila olish imkoniyati)',
        'Verifikatsiya (Faqat tasdiqlanish)',
        'Abadiylik',
        'Keng ommaga tushunarlilik'
      ],
      correctAnswer: 0,
      explanation: 'Karl Popper ta\'kidlagan: har qanday chinakam ilmiy faraz tajriba yo‘li bilan rad etilishi (falsifikatsiya qilinishi) mumkin bo‘lgan sharoitni ko‘rsata olishi shart.',
      source: 'Karl Popper, «Ilmiy kashfiyotlar mantig‘i»'
    },

    // -------------------------------------------------------------
    // TOPIC 7: METAFIZIKA VA BORLIQ (8 questions)
    // -------------------------------------------------------------
    {
      id: 'mf-01',
      topic: 'metafizika',
      topicName: 'Metafizika va borliq',
      difficulty: 'oson',
      question: 'Borliqning asosi moddiy zarralardan iborat, ong esa materiyaning xossasidir deb hisoblovchi yo‘nalish nima?',
      options: [
        'Materializm',
        'Idealizm',
        'Solipsizm',
        'Agnostitsizm'
      ],
      correctAnswer: 0,
      explanation: 'Materializm materiyani birlamchi, ong va ruhiyatni esa uning oliy mahsuli deb biladi (Demokrit, Marks, Feyerbax).',
      source: 'Falsafiy ensiklopediya'
    },
    {
      id: 'mf-02',
      topic: 'metafizika',
      topicName: 'Metafizika va borliq',
      difficulty: 'oson',
      question: 'Borliqning tub asosi g‘oya, oliy aql, ruh yoki mutlaq ong deb hisoblovchi falsafiy dunyoqarash qaysi?',
      options: [
        'Idealizm',
        'Pozitivizm',
        'Mexanitsizm',
        'Naturalizm'
      ],
      correctAnswer: 0,
      explanation: 'Idealizm (ob\'yektiv yoki sub\'yektiv) ma\'naviy ibtidoni moddiy olamdan ustun va birlamchi deb biladi (Platon, Gegel, Berkli).',
      source: 'Gegel falsafasi'
    },
    {
      id: 'mf-03',
      topic: 'metafizika',
      topicName: 'Metafizika va borliq',
      difficulty: 'o\'rta',
      question: 'Olamda ikkita teng huquqli, mustaqil ibtido — moddiy jism va tafakkur ruhiyati mavjud deb qarovchi ta\'limot nima?',
      options: [
        'Dualizm',
        'Monizm',
        'Plyuralizm',
        'Panteizm'
      ],
      correctAnswer: 0,
      explanation: 'Dualizm (lotincha dualis — ikkili) ruhiy va jismoniy substansiyani bir-biriga bog‘liq bo‘lmagan ikki alohida olam deb biladi (Rene Dekart).',
      source: 'Dekart falsafasi'
    },
    {
      id: 'mf-04',
      topic: 'metafizika',
      topicName: 'Metafizika va borliq',
      difficulty: 'qiyin',
      question: 'Barux Spinoza o‘zining panteistik metafizikasida qaysi mashhur iborani ilgari surgan?',
      options: [
        'Deus sive Natura (Xudo yoki Tabiat)',
        'Tabula rasa',
        'Homo homini lupus est',
        'Cogito ergo sum'
      ],
      correctAnswer: 0,
      explanation: 'Spinoza Xudo va tabiat alohida emas, butun koinot yagona ilohiy substansiyadan iborat deb hisoblagan.',
      source: 'Barux Spinoza, «Etika»'
    },
    {
      id: 'mf-05',
      topic: 'metafizika',
      topicName: 'Metafizika va borliq',
      difficulty: 'qiyin',
      question: 'Gotfrid Vilgelm Leybnits olamning asosida bo‘linmas, faol, ma\'naviy «kuch markazlari» yotadi degan. Ular qanday ataladi?',
      options: [
        'Monadalar',
        'Atomlar',
        'Kvarklar',
        'Kvintessensiyalar'
      ],
      correctAnswer: 0,
      explanation: 'Leybnits «Monadologiya» asarida moddiy atomlar emas, balki fazosiz va derazasiz ma\'naviy birliklar — monadalar borliq asosi ekanini yozgan.',
      source: 'Leybnits, «Monadologiya» (1714)'
    },
    {
      id: 'mf-06',
      topic: 'metafizika',
      topicName: 'Metafizika va borliq',
      difficulty: 'o\'rta',
      question: 'Koinotdagi barcha hodisalar qat\'iy sabab-oqibat qonuniyatlari bilan bog‘langan va tasodiflar yo‘q deb qarovchi falsafiy qarash nima?',
      options: [
        'Determinizm',
        'Indeterminizm',
        'Fatalizm',
        'Solipsizm'
      ],
      correctAnswer: 0,
      explanation: 'Determinizm (lotincha determinare — belgilamoq) har bir hodisa o‘zidan oldingi sabablar natijasida muqarrar sodir bo‘ladi deb o‘rgatadi.',
      source: 'Laplas determinizmi'
    },
    {
      id: 'mf-07',
      topic: 'metafizika',
      topicName: 'Metafizika va borliq',
      difficulty: 'o\'rta',
      question: 'Faqat mening shaxsiy onggim mavjud, qolgan butun tashqi dunyo esa mening onggimdagi tasavvurlar xolos degan keskin falsafiy pozitsiya nima deyiladi?',
      options: [
        'Solipsizm',
        'Ekklektizm',
        'Nigilizm',
        'Panteizm'
      ],
      correctAnswer: 0,
      explanation: 'Solipsizm (lotincha solus — yolg‘iz va ipse — o‘zi) shaxsiy ongdan tashqaridagi har qanday voqelikning borligini shubha ostiga oladi.',
      source: 'Sub\'yektiv idealizm tarixi'
    },
    {
      id: 'mf-08',
      topic: 'metafizika',
      topicName: 'Metafizika va borliq',
      difficulty: 'qiyin',
      question: 'Vaqt va makon ob\'yektiv moddiy narsa emas, balki inson his-tuyg‘ularining tajribagacha bo‘lgan (a priori) sof shakllaridir deb kim ta\'lim bergan?',
      options: [
        'Immanuil Kant',
        'Isaak Nyuton',
        'Jon Lokk',
        'Foma Akvinskiy'
      ],
      correctAnswer: 0,
      explanation: 'Kant «Sof aql tanqidi» asarining Transsendental estetika qismida fazo va vaqt bizning sezgilarimiz qolipidir deb isbotlagan.',
      source: 'Immanuil Kant, «Sof aql tanqidi»'
    },

    // -------------------------------------------------------------
    // TOPIC 8: STOISIZM VA EKZISTENSIALIZM (8 questions)
    // -------------------------------------------------------------
    {
      id: 'se-01',
      topic: 'stoisizm-ekzistensializm',
      topicName: 'Stoisizm va Ekzistensializm',
      difficulty: 'oson',
      question: 'Rim imperatori bo‘la turib, «O‘y-fikrlar» (Meditations) nomli samimiy stoik asar yozgan faylasuf kim?',
      options: [
        'Markus Avreliy',
        'Seneka',
        'Yuliy Sezar',
        'Neron'
      ],
      correctAnswer: 0,
      explanation: 'Markus Avreliy taxtda o‘tirgan holda ham o‘z nafsi bilan kurashib, burch, sabr-toqat va xotirjamlikni oliy qadriyat deb bilgan.',
      source: 'Markus Avreliy, «O‘y-fikrlar»'
    },
    {
      id: 'se-02',
      topic: 'stoisizm-ekzistensializm',
      topicName: 'Stoisizm va Ekzistensializm',
      difficulty: 'o\'rta',
      question: 'Stoisizm falsafasidagi «Nazorat dixotomiyasi» (Epiktet ta\'limoti) qaysi muhim farqni ko‘rsatadi?',
      options: [
        'Bizning to‘liq nazoratimizdagi narsalar (fikr, harakat) va nazoratimizda bo‘lmagan narsalar (obro‘, boylik, taqdir)',
        'Do‘stlar va dushmanlar o‘rtasidagi farq',
        'Tana va jonning ajralishi',
        'O‘tmish va kelajakdagi xatolar'
      ],
      correctAnswer: 0,
      explanation: 'Epiktet ta\'kidlagan: baxtli bo‘lishning birdan-bir yo‘li — o‘z ixtiyorimizdagi fikrlarni tarbiyalash va nazorat qilib bo‘lmaydigan tashqi voqealarga befarq xotirjam bo‘lishdir.',
      source: 'Epiktet, «Enxiridion» (Qo‘llanma)'
    },
    {
      id: 'se-03',
      topic: 'stoisizm-ekzistensializm',
      topicName: 'Stoisizm va Ekzistensializm',
      difficulty: 'oson',
      question: 'Qul bo‘lib tug‘ilib, keyinchalik Rimdagi eng nufuzli stoik ustoziga aylangan mutafakkir kim?',
      options: [
        'Epiktet',
        'Zenon Kitiylik',
        'Xrisipp',
        'Lukretsiy Kar'
      ],
      correctAnswer: 0,
      explanation: 'Epiktet ozodlik ichki ruhiy holat ekanligini, tashqi zanjirlar qalb erkinligini bog‘lay olmasligini shaxsiy hayoti bilan isbotlagan.',
      source: 'Epiktet merosi'
    },
    {
      id: 'se-04',
      topic: 'stoisizm-ekzistensializm',
      topicName: 'Stoisizm va Ekzistensializm',
      difficulty: 'oson',
      question: '«Mavjudlik mohiyatdan oldin keladi» (L\'existence précède l\'essence) tamoyili qaysi oqimning shioridir?',
      options: [
        'Ekzistensializm',
        'Stoisizm',
        'Strukturalizm',
        'Sxolastika'
      ],
      correctAnswer: 0,
      explanation: 'Inson oldindan tayyor taqdir yoki mohiyat bilan tug‘ilmaydi; u o‘z tanlovlari va harakatlari orqali o‘z «men»ini o‘zi yaratadi.',
      source: 'Jan-Pol Sartr, «Ekzistensializm — bu gumanizm»'
    },
    {
      id: 'se-05',
      topic: 'stoisizm-ekzistensializm',
      topicName: 'Stoisizm va Ekzistensializm',
      difficulty: 'o\'rta',
      question: '«Inson erkinlikka mahkumdir» (L\'homme est condamné à être libre) degan keskin xulosa muallifi kim?',
      options: [
        'Jan-Pol Sartr',
        'Alber Kamyu',
        'Fridrix Nitsshe',
        'Martin Xaydegger'
      ],
      correctAnswer: 0,
      explanation: 'Sartr inson erkinlikdan qochib qutula olmasligini, har qanday tanlov (hatto tanlamaslik ham) uchun to‘liq shaxsiy mas\'uliyat borligini ta\'kidlagan.',
      source: 'Jan-Pol Sartr, «Borliq va yo‘qlik»'
    },
    {
      id: 'se-06',
      topic: 'stoisizm-ekzistensializm',
      topicName: 'Stoisizm va Ekzistensializm',
      difficulty: 'o\'rta',
      question: 'Alber Kamyu «Sizif haqida afsona» asarida insonning ma\'no izlashi bilan sovuq koinot o‘rtasidagi ziddiyatni nima deb ataydi?',
      options: [
        'Absurd (Bema\'nilik)',
        'Anatema',
        'Entropiya',
        'Nirvana'
      ],
      correctAnswer: 0,
      explanation: 'Kamyu fikricha, inson ma\'no izlaydi, ammo koinot jimjit va befarq. Shunga qaramay, Sizif toshni cho‘qqiga itarishda davom etib, hayotga isyon va go‘zallik baxsh etadi.',
      source: 'Alber Kamyu, «Sizif haqida afsona» (1942)'
    },
    {
      id: 'se-07',
      topic: 'stoisizm-ekzistensializm',
      topicName: 'Stoisizm va Ekzistensializm',
      difficulty: 'qiyin',
      question: '«Zardusht tavallosi» asarida «Oliy inson» (Übermensch) konsepsiyasini va barcha qadriyatlarni qayta baholash g‘oyasini kim yaratgan?',
      options: [
        'Fridrix Nitsshe',
        'Artur Shopengauer',
        'Seren Kyerkegor',
        'Teodor Adorno'
      ],
      correctAnswer: 0,
      explanation: 'Fridrix Nitsshe olomon axloqini yengib o‘tib, o‘z hayotiga o‘zi yangi qadriyatlar bag‘ishlovchi kuchli irodali insonni («Übermensch») orzu qilgan.',
      source: 'Fridrix Nitsshe, «Zardusht tavallosi»'
    },
    {
      id: 'se-08',
      topic: 'stoisizm-ekzistensializm',
      topicName: 'Stoisizm va Ekzistensializm',
      difficulty: 'o\'rta',
      question: 'Ekzistensializm falsafasining ilk kashshofi hisoblangan, insonning Alloh oldidagi yolg‘izligi va qo‘rquvini («Qo‘rquv va titroq») tadqiq etgan daniyalik mutafakkir kim?',
      options: [
        'Seren Kyerkegor',
        'Karl Yaspers',
        'Lev Shestov',
        'Emil Sioran'
      ],
      correctAnswer: 0,
      explanation: 'Seren Kyerkegor ratsional tizimlardan (ayniqsa Gegeldan) voz kechib, tirik insonning individual ichki iztiroblari va e\'tiqod sakrashini markazga qo‘ygan.',
      source: 'Seren Kyerkegor, «Qo‘rquv va titroq» (1843)'
    },

    // -------------------------------------------------------------
    // TOPIC 9: FALSAFIY FIKRIY TAJRIBALAR (8 questions)
    // -------------------------------------------------------------
    {
      id: 'ft-01',
      topic: 'fikriy-tajribalar',
      topicName: 'Falsafiy fikriy tajribalar',
      difficulty: 'o\'rta',
      question: '«Tezey kemasi» (Ship of Theseus) fikriy tajribasi asosan qaysi falsafiy jumboqni o‘rganadi?',
      options: [
        'Ayniyat va o‘zlik (Identity) — barcha qismlari asta-sekin almashtirilgan jism o‘sha jism bo‘lib qoladimi?',
        'Dengizda suzish tezligi qonuniyatlarini',
        'Davlat boshqaruvining xatolarini',
        'Inson xotirasining chegaralarini'
      ],
      correctAnswer: 0,
      explanation: 'Plutarx bayon etgan ushbu tajribada kemaning barcha taxtalari yangilangach, u avvalgi Tezey kemasimi yoki yangi kemami degan ontologik muammo o‘rtaga tashlanadi.',
      source: 'Plutarx, «Tezey hayoti»'
    },
    {
      id: 'ft-02',
      topic: 'fikriy-tajribalar',
      topicName: 'Falsafiy fikriy tajribalar',
      difficulty: 'o\'rta',
      question: 'Mashhur «Trolleybus muammosi» (Trolley Problem) asosan qaysi ikki axloqiy qarash o‘rtasidagi to‘qnashuvni namoyish qiladi?',
      options: [
        'Utilitarizm (5 kishini qutqarish uchun 1 kishini qurbon qilish) va Deontologiya (begunohni o‘ldirish qat\'iy taqiqlanishi)',
        'Gedonizm va asketizm',
        'Determinizm va erkin iroda',
        'Empirizm va ratsionalizm'
      ],
      correctAnswer: 0,
      explanation: 'Filippa Fut (1967) ilgari surgan bu masala oqibatga qarab harakat qilish (utilitarizm) bilan mutlaq axloqiy taqiq (burch etikasi) orasidagi ziddiyatni ochib beradi.',
      source: 'Philippa Foot, «The Problem of Abortion and the Doctrine of the Double Effect»'
    },
    {
      id: 'ft-03',
      topic: 'fikriy-tajribalar',
      topicName: 'Falsafiy fikriy tajribalar',
      difficulty: 'qiyin',
      question: 'Jon Syorlning (John Searle) «Xitoy xonasi» (Chinese Room) fikriy tajribasi nimani isbotlash uchun yaratilgan?',
      options: [
        'Kompyuter ramzlarni qoidalar asosida to‘g‘ri almashtirsa ham, ularning ma\'nosini chinakamiga anglamaydi (sintaksis semantika emas)',
        'Xitoy tilini o‘rganish eng murakkab ekanini',
        'Sun\'iy intellekt inson ongidan to‘liq ustun ekanini',
        'Inson xotirasi cheksiz ekanini'
      ],
      correctAnswer: 0,
      explanation: 'Xonada o‘tirgan odam kitobdagi qoidalar bo‘yicha iyerogliflarga to‘g‘ri javob qaytarsa-da, biror so‘zni tushunmaydi. Dastur ham faqat ramzlar bilan ishlaydi, ong hosil qilmaydi.',
      source: 'John Searle, «Minds, Brains, and Programs» (1980)'
    },
    {
      id: 'ft-04',
      topic: 'fikriy-tajribalar',
      topicName: 'Falsafiy fikriy tajribalar',
      difficulty: 'qiyin',
      question: 'Frank Jeksonning «Bilimdon Meri» (Mary\'s Room) tajribasi sub\'yektiv ongning qaysi xususiyatini isbotlashga qaratilgan?',
      options: [
        'Kvalia (Qualia) — shaxsiy his-tuyg‘u va kechinmalar fizik ma\'lumotlar bilan cheklanmasligini',
        'Ranglarni tanish faqat ko‘zga bog‘liqligini',
        'Xotira yo‘qolishining sabablarini',
        'Fizika fani barcha sirlarni yechganini'
      ],
      correctAnswer: 0,
      explanation: 'Meri qora-oq xonada optika va ranglar fizikasi bo‘yicha barcha bilimlarga ega, ammo birinchi bor xonadan chiqib qizil atirgulni ko‘rganida yangi sub\'yektiv kechinmaga (kvaliaga) ega bo‘ladi.',
      source: 'Frank Jackson, «Epiphenomenal Qualia» (1982)'
    },
    {
      id: 'ft-05',
      topic: 'fikriy-tajribalar',
      topicName: 'Falsafiy fikriy tajribalar',
      difficulty: 'o\'rta',
      question: 'Aflotunning «Davlat» asaridagi «Giges uzugi» afsonasi qaysi chuqur axloqiy savolni o‘rtaga qo‘yadi?',
      options: [
        'Agar inson ko‘rinmas bo‘lib qolsa va hech qachon jazolanmasligi aniq bo‘lsa, u adolatli bo‘lib qoladimi?',
        'Sehrli buyumlar davlatni boyita oladimi?',
        'Oltin uzuklar hukmdorlarga qanday ta\'sir qiladi?',
        'Urushlarda g‘alaba qozonish sirlari nima?'
      ],
      correctAnswer: 0,
      explanation: 'Glavkon bu hikoya orqali odamlar adolatni uning o‘zi uchun emas, balki jazodan qo‘rqqani va obro‘ saqlash uchun bajaradilar degan da\'voni tekshiradi.',
      source: 'Aflotun, «Davlat», II kitob'
    },
    {
      id: 'ft-06',
      topic: 'fikriy-tajribalar',
      topicName: 'Falsafiy fikriy tajribalar',
      difficulty: 'qiyin',
      question: 'Robert Nozikning «Tajriba mashinasi» (Experience Machine) tajribasi qaysi ta\'limotga qarshi jiddiy zarba bo‘ldi?',
      options: [
        'Gedonizm — chunki inson shunchaki sun\'iy yoqimli tuyg‘ularni emas, haqiqiy voqelik bilan bog‘lanishni istaydi',
        'Materializm',
        'Ratsionalizm',
        'Skeptitsizm'
      ],
      correctAnswer: 0,
      explanation: 'Agar miyaga mukammal lazzat signallarini uzatuvchi mashina bo‘lsa ham, ko‘pchilik unga ulanishni rad etadi. Demak, inson uchun shaxsiy haqiqiy yashash quruq lazzatdan muhimroqdir.',
      source: 'Robert Nozick, «Anarchy, State, and Utopia» (1974)'
    },
    {
      id: 'ft-07',
      topic: 'fikriy-tajribalar',
      topicName: 'Falsafiy fikriy tajribalar',
      difficulty: 'o\'rta',
      question: '«Buridan eshagi» paradoksi qanday muammoni ifodalaydi?',
      options: [
        'Ikkita mutlaqo bir xil va teng masofadagi pichan g‘arami o‘rtasida tanlov qilolmay och qolgan iroda falaji',
        'Uy hayvonlarining aqlsizligini',
        'Tabiatdagi ozuqa yetishmovchiligini',
        'Mantiqiy xulosalarning bexatoligini'
      ],
      correctAnswer: 0,
      explanation: 'Jan Buridan nomi bilan bog‘liq bu fikriy tajriba erkin iroda va mutlaq ratsional tanlov muammosini ko‘rsatadi.',
      source: 'Sxolastik falsafa bahslari'
    },
    {
      id: 'ft-08',
      topic: 'fikriy-tajribalar',
      topicName: 'Falsafiy fikriy tajribalar',
      difficulty: 'o\'rta',
      question: 'Hilari Patnemning (Hilary Putnam) «Probirkadagi miya» (Brain in a Vat) tajribasi qaysi qadimiy falsafiy g‘oyaning zamonaviy shaklidir?',
      options: [
        'Rene Dekartning «Ayyor iblis» (Evil Demon) shubhasi va umumiy skeptitsizm',
        'Arastuning to‘rt sababi',
        'Falesning suv ibtidosi',
        'Lao-szining U-vey ta\'limoti'
      ],
      correctAnswer: 0,
      explanation: 'Agar miyangiz olimlar tomonidan eritmada saqlanib, unga tashqi dunyo elektr signallari berib turilgan bo‘lsa, buni qanday bila olasiz? Bu Dekart shubhasining zamonaviy talqinidir.',
      source: 'Hilary Putnam, «Reason, Truth and History» (1981)'
    }
  ];

  return {
    TOPICS: TOPICS,
    QUESTIONS: QUESTIONS,
    ACHIEVEMENTS: ACHIEVEMENTS,
    RANKS: RANKS
  };
});
