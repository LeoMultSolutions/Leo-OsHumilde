// BACKEND DA API
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// BIBLIOTECAS UTILIZADAS PARA COMPOSIÇÃO DA API
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const express = require("express");
const { body, validationResult } = require("express-validator");
const socketIO = require("socket.io");
const qrcode = require("qrcode");
const http = require("http");
const fileUpload = require("express-fileupload");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
// PORTA ONDE O SERVIÇO SERÁ INICIADO
const port = 8003;
const idClient = "bot-zdg5";
//CRIAR PASTA AUTOMATICAMENTE
const path = require('path');
require('events').EventEmitter.defaultMaxListeners = 999; // ou qualquer número que você julgue necessário
//VAREAVEL GLOBAL Declaração das variáveis globais
//const { v4: uuidv4 } = require('uuid');
//let userStates = {}; // Objeto para armazenar estados dos usuários
let nome;
let etapaCadastro = 0;
const fs = require('fs');
let usuariosMensagemEnviada = [];
//const usuariosAvisoEnviado = [];
//let usuariosAvisoEnviado = lerArquivoChatHistory();
const numeroDestino = '558584460424@s.whatsapp.net';
let usuariosJaReceberamMensagemInicial = [];
const usuariosQueReceberamMensagem = {};
var horaMensagemString = "2024-04-26T12:30:00"; // Exemplo de string representando a hora
var horaMensagem = new Date(horaMensagemString);
global.maxEventListeners = 20;
// Declaração das variáveis globais
let dataAtual = new Date();
let diaDaSemana = dataAtual.getDay();

// SERVIÇO EXPRESS
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  fileUpload({
    debug: true,
  })
);
app.use("/", express.static(__dirname + "/"));
app.get("/", (req, res) => {
  res.sendFile("index.html", {
    root: __dirname,
  });
});

function delay(t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t);
  });
}

// function gerarProtocolo() {
//   return Math.floor(1000000000 + Math.random() * 9000000000).toString(); // Gera um número de 10 dígitos
// }


function verificaPalavrasNaFrase(frase, palavras) {
  const fraseMinuscula = frase.toLowerCase();

  for (let i = 0; i < palavras.length; i++) {
    const palavraMinuscula = palavras[i].toLowerCase();
    if (fraseMinuscula.indexOf(palavraMinuscula) >= 0) {
      return true;
    }
  }

  return false;
}

// PARÂMETROS DO CLIENT DO WPP
const client = new Client({
  authStrategy: new LocalAuth({ clientId: idClient }),
  puppeteer: { headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ] }, 
});

const numeroSuporte = '558584460424@s.whatsapp.net';
// INICIALIZAÇÃO DO CLIENTE
client.initialize();
// EVENTOS DE CONEXÃO EXPORTADOS PARA O INDEX.HTML VIA SOCKET
io.on("connection", function (socket) {
  socket.emit("message", "© BOT-OH - Iniciado");
  socket.emit("qr", "./icon.svg");
  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit("qr", url);
      socket.emit(
        "message",
        "© BOT-OH QRCode recebido, aponte a câmera  seu celular!"
      );
    });
  });

  client.on("ready", () => {
    // ENVIANDO MENSAGEM DE AVISO PARA O NÚMERO DE SUPORTE
    client.sendMessage(numeroSuporte, '© BOT-OH 7 está online!');
    // EMITINDO MENSAGEM PARA O CLIENTE
    socket.emit("ready", "© BOT-OH Dispositivo pronto!");
    socket.emit("message", "© BOT-OH Dispositivo pronto!");
    socket.emit("qr", "./check.svg");
    console.log("© BOT-OH Dispositivo pronto");
  });

  client.on("authenticated", () => {
    socket.emit("authenticated", "© BOT-OH Autenticado!");
    socket.emit("message", "© BOT-OH Autenticado!");
    console.log("© BOT-OH Autenticado");
  });

  client.on('ready', () => {
    console.log('Bot está online!');
  });

  client.on("auth_failure", function () {
    socket.emit("message", "© BOT-OH Falha na autenticação, reiniciando...");
    console.error("© BOT-OH Falha na autenticação");
  });

  client.on("change_state", (state) => {
    console.log("© BOT-OH Status de conexão: ", state);
  });

  client.on("disconnected", (reason) => {
    socket.emit("message", "© BOT-OH Cliente desconectado!");
    console.log("© BOT-OH Cliente desconectado", reason);
    client.initialize();
  });
});


// POST PARA ENVIO DE MENSAGEM
app.post(
  "/send-message",
  [body("number").notEmpty(), body("message").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req).formatWith(({ msg }) => {
      return msg;
    });

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped(),
      });
    }

    const number = req.body.number.replace(/\D/g, "");
    const numberDDD = number.substr(0, 2);
    const numberUser = number.substr(-8, 8);
    const message = req.body.message;

    if (numberDDD <= 30) {
      const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
      client
        .sendMessage(numberZDG, message)
        .then((response) => {
          res.status(200).json({
            status: true,
            message: "BOT-OH Mensagem enviada",
            response: response,
          });
        })
        .catch((err) => {
          res.status(500).json({
            status: false,
            message: "BOT-OH Mensagem não enviada",
            response: err.text,
          });
        });
    } else if (numberDDD > 30) {
      const numberZDG = "55" + numberDDD + numberUser + "@c.us";
      client
        .sendMessage(numberZDG, message)
        .then((response) => {
          res.status(200).json({
            status: true,
            message: "BOT-OH Mensagem enviada",
            response: response,
          });
        })
        .catch((err) => {
          res.status(500).json({
            status: false,
            message: "BOT-OH Mensagem não enviada",
            response: err.text,
          });
        });
    }
  }
);

// Caminho para o arquivo JSON que armazena o histórico de chat
const chatHistoryPath = path.join(__dirname, 'chatHistory/usuariosAvisoEnviado.json');
// Função para ler o arquivo JSON
function lerArquivoChatHistory() {
  if (fs.existsSync(chatHistoryPath)) {
    const data = fs.readFileSync(chatHistoryPath, 'utf8');
    return JSON.parse(data);
  }
  return {};
}

// Função para escrever no arquivo JSON
function escreverArquivoChatHistory(data) {
  fs.writeFileSync(chatHistoryPath, JSON.stringify(data, null, 2), 'utf8');
}
// Inicializa a lista de usuários que receberam o aviso a partir do arquivo JSON
let usuariosAvisoEnviado = lerArquivoChatHistory();
// Função para verificar se a mensagem foi recebida fora do horário de atendimento
function verificarHorarioAtendimento(horaMensagem) {
  return horaMensagem.getHours() < 8 || horaMensagem.getHours() >= 22;
}
// Função para enviar o aviso fora do horário de atendimento
async function enviarAvisoForaDoHorario(userId, horaMensagem) {
  const agora = new Date();
  const ultimoAviso = usuariosAvisoEnviado[userId];
// Formata a hora da mensagem recebida
const horaRecebida = horaMensagem.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
// Verifica se o usuário já recebeu o aviso nas últimas 24 horas
  if (!ultimoAviso || (agora - new Date(ultimoAviso.timestamp)) > 24 * 60 * 60 * 1000) {
    let mensagem;
    const foraDoHorario = verificarHorarioAtendimento(horaMensagem);

    if (foraDoHorario && horaMensagem.getHours() < 8) {
      mensagem = `Agradeço o seu contato. Infelizmente, recebi sua mensagem fora do meu horário de atendimento *(${horaRecebida})*\r\n\r\nNão se preocupe, entrarei em contato assim que possível.\r\n\r\n⏱️ O meu horário de atendimento:\r\n📆 Segunda à Sexta: 8:00 às 22:00\r\nSábados, Domingos e Feriados: 10:00 às 18:00\r\n\r\nPara agilizar seu atendimento, basta digitar MENU e selecionar a opção que deseja atendimento.`;
      console.log(`Mensagem recebida antes das 8 horas da manhã. Hora: ${horaMensagem}`);
    } else if (foraDoHorario && horaMensagem.getHours() >= 22) {
      mensagem = `Olá, bem vindo ao atendimento\r\ndo leomultsolutions.com.br 😀\r\n\r\n⏱️ O meu horário de atendimento:\r\n📆Segunda à Sexta: 8:00 às 22:00\r\nSábados, Domingos e Feriados: 10:00 às 18:00\r\n\r\nVocê me enviou msg às *${horaRecebida}* fora do meu atendimento humanizado.\r\n\r\n+ Basta digitar a palavra *MENU* e selecionar a opção desejada, que assim que iniciar meu atendimento entrarei em contato.`;
      console.log(`Mensagem recebida após as 22 horas. Hora: ${horaMensagem}`);
    } else {
      console.log(`Mensagem recebida dentro do horário de atendimento. Hora: ${horaMensagem}`);
      return;
    }

    // Envie a mensagem ao usuário
    await client.sendMessage(userId, mensagem);
    console.log("Mensagem enviada com sucesso!");

    // Atualiza a hora do último aviso enviado para o usuário e se foi fora do horário
    usuariosAvisoEnviado[userId] = {
      timestamp: agora.toISOString(),
      foraDoHorario: foraDoHorario
    };
    escreverArquivoChatHistory(usuariosAvisoEnviado);
    console.log(`Usuário ${userId} adicionado à lista de avisos enviados.`);
  } else {
    console.log(`Usuário ${userId} já recebeu um aviso nas últimas 24 horas.`);
  }
}

// Certifique-se de que o client está sendo importado corretamente de onde quer que esteja inicializado
client.on("message", async (msg) => {
  // Verifica se a mensagem foi recebida de um grupo
  if (msg.from.includes("@g.us")) {
    console.log("Mensagem recebida de um grupo, ignorando...");
    return;
  }
  // Verifica se a mensagem foi recebida fora do horário de atendimento
  const horaMensagem = new Date(msg.timestamp * 1000);
  console.log(`Nova mensagem recebida. Hora: ${horaMensagem}`);
  // Envia aviso se a mensagem foi recebida fora do horário de atendimento
  await enviarAvisoForaDoHorario(msg.from, horaMensagem);
  // Adicione aqui qualquer lógica adicional que precise para processar outras mensagens...
});

client.on("message", async (msg) => {
  // Ignorar mensagens de grupos e mensagens do próprio bot
  if (msg.type.toLocaleUpperCase() === "e2e_notification" || msg.from.includes("@g.us") || msg.from === client.info.wid._serialized) {
    return;
  }

  const horaMensagem = new Date(msg.timestamp * 1000);
  console.log(`Nova mensagem recebida. Hora: ${horaMensagem}`);

  // Verifica se está dentro do horário de atendimento
  const foraDoHorario = verificarHorarioAtendimento(horaMensagem);
  console.log(`Mensagem recebida ${foraDoHorario ? 'fora' : 'dentro'} do horário de atendimento. Hora: ${horaMensagem}`);

  const userId = msg.from;

  // Verifica se o usuário já recebeu a mensagem inicial
  const usuarioJaRecebeuMensagem = usuariosJaReceberamMensagemInicial.includes(userId);
  const contemMenu = msg.body.trim().toLowerCase() === "menu";
  console.log("Contém menu:", contemMenu);

  // Se o usuário ainda não recebeu a mensagem inicial e está dentro do horário, envia a mensagem
  if (!usuarioJaRecebeuMensagem && !foraDoHorario) {
    console.log("Enviando mensagem inicial...");

    // Marca o usuário como já tendo recebido a mensagem inicial imediatamente
    usuariosJaReceberamMensagemInicial.push(userId);

    const media1 = MessageMedia.fromFilePath("./leooh.png");
    const chat = await msg.getChat();

    console.log("Enviando estado de digitação...");
    await chat.sendStateTyping();

    // Envia a mensagem inicial após um pequeno delay
    setTimeout(async () => {
      const contact = await msg.getContact();
      const userName = contact && contact.name ? contact.name : "amigo(a)";
      const replyMessage = `Olá! ${userName} 👋 Obrigado por entrar em contato! Esta é uma mensagem automática do Leo, mas não se preocupe, em breve, ele assumirá o atendimento.\r\n\r\n🔢 Para agilizar seu atendimento, escolha a opção que melhor corresponde ao que deseja atendimento.\r\n\r\n1╠➢✍🏾 Criação de Sites\r\n◎ ══════ ❈ ══════ ◎\r\n2╠➢🚀 Gestão de Tráfego\r\n◎ ══════ ❈ ══════ ◎\r\n3╠➢📱 Ferramentas para WhatsApp\r\n◎ ══════ ❈ ══════ ◎\r\n4╠➢📢 Divulgador Digital\r\n◎ ══════ ❈ ══════ ◎\r\n5╠➢🎉 Entretenimento\r\n◎ ══════ ❈ ══════ ◎\r\n6╠➢🌐 Internet Ilimitada\r\n◎ ══════ ❈ ══════ ◎\r\n7╠➢📦 JÁ SOU CLIENTE\r\n\r\n*⚙️Digite o número da opção desejada e Leo estará pronto para ajudar!* 🤖✨`;

      await client.sendMessage(msg.from, media1, { caption: replyMessage });
      console.log('Mensagem inicial enviada com sucesso.');
    }, 1000);
  } else if (foraDoHorario) {
    console.log("Mensagem inicial não enviada. Fora do horário de atendimento.");
  }

  // Se a mensagem contém a palavra "menu", envie o menu independentemente do horário ou se já recebeu a mensagem inicial
  if (contemMenu) {
    console.log("Enviando menu...");
    const replyMessage = `🔢 Para agilizar seu atendimento, escolha a opção que melhor corresponde ao que deseja atendimento\r\n\r\n1╠➢🌐 Criação de Sites\r\n◎ ══════ ❈ ══════ ◎\r\n2╠➢🚀 Gestão de Tráfego\r\n◎ ══════ ❈ ══════ ◎\r\n3╠➢📱 Ferramentas para WhatsApp\r\n◎ ══════ ❈ ══════ ◎\r\n4╠➢📢 Divulgador Digital\r\n◎ ══════ ❈ ══════ ◎\r\n5╠➢🎉 Entretenimento\r\n◎ ══════ ❈ ══════ ◎\r\n6╠➢🌐 Internet Ilimitada\r\n◎ ══════ ❈ ══════ ◎\r\n7╠➢📦 JÁ SOU CLIENTE\r\n\r\n*⚙️Basta digitar o número, ou nome da opção que corresponde seu atendimento*🤖✨`;

    await client.sendMessage(msg.from, replyMessage);
  }


  if (
    msg.body.toLowerCase() === '1' ||
    msg.body.toLowerCase() === 'criação de sites' ||
    msg.body.toLowerCase() === 'criar site' ||
    msg.body.toLowerCase() === 'sites'
  ) {
    const chat = await msg.getChat();

    setTimeout(async () => {
      await chat.sendStateTyping(5000);

      const replyMessage = `🌐 Para uma presença online impactante, nossa opção de Criação de Sites é perfeita.\r\n\r\nDesenvolvemos sites únicos, alinhados à sua marca, para proporcionar uma experiência memorável aos seus visitantes.\r\n\r\n*🔢 Digite uma das opções*\r\n\r\n8╠➢ VER PROJETOS 📊\r\n◎ ══════ ❈ ══════ ◎\r\n9╠➢ AGENDAR REUNIÃO 📅\r\n◎ ══════ ❈ ══════ ◎\r\n\r\n♻️Escolha umas das opções para continuarmos nossa conversa!`;

      // Enviar a mensagem apenas com texto
      await chat.sendMessage(replyMessage);
    }, 8000);
}

  
  //Opção 2 do MENU
  

  
  if (msg.body === '5' || msg.body === 'entretenimento'|| msg.body === 'Entretenimento' || msg.body === 'canais') {
    const media1 = MessageMedia.fromFilePath("./icon66.png");
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    setTimeout(async () => {
      await client.sendMessage(msg.from, media1, { caption: "🌐 *Nova Dimensão de Entretenimento*\r\n════════════════ ❈\r\n_Agradeço muito por escolher a opção de Entretenimento! Estou entusiasmados para apresentar a você nossa gama exclusiva de serviços de Canais de *TV WEB*._\r\n════════════ ❈\r\n*TESTE GRATIS* 📺 🍿\r\n════════════ ❈\r\n╠➢Escolha os canais e programas que\r\n╠➢mais lhe interessam, criando uma experiência\r\n╠➢de visualização personalizada com:\r\n╠═══════════════ ❈\r\n╠➢ Aᴛᴜᴀʟɪᴢᴀᴄ̧ᴀ̃ᴏ ᴀᴜᴛᴏᴍᴀ́ᴛɪᴄᴀ\r\n╠➢ sᴇᴍ ғɪᴅᴇʟɪᴅᴀᴅᴇ\r\n╠➢ᴛeste 4 horas ɢʀᴀ́ᴛɪs\r\n╠═══════════════ ❈\r\n╠➕ de 9.600 CANAIS 🇧🇷 FUNCIONA EM TODO ╠BRASIL OU FORA SERVIÇO DE QUALIDADE\r\n╠═════════════════\r\n╠🖥️CANAIS 🎬FILMES 🎬SÉRIES\r\n╠🖥️CANAIS 🎬FILMES 🎬SÉRIES\r\n╠➢STAR+\r\n╠➢NETFLIX\r\n╠➢HBO MAX\r\n╠➢APPLE TV +\r\n╠➢GLOBO PLAY\r\n╠➢DISNEY PLUS\r\n╠➢DISCOVERY +\r\n╠➢PARAMOUNT +\r\n╠➢AMAZON PRIME\r\n╠📡 TODOS OS REALITY SHOWS\r\n╠═════════════════\r\n╠📡 CANAIS ABERTOS/FECHADOS\r\n╠═════════════════\r\n╠🎬 FILMES CARTAZ DE CINEMA\r\n╠═════════════════\r\n╠📺 GLOBO\r\n╠📺 SBT\r\n╠📺 RECORD\r\n╠🪂 ESPORTE (TODOS)\r\n╠🎭 INFANTIS\r\n╠📽️ REDE TELECINE\r\n╠💼 NOTÍCIAS\r\n╠⚽ PREMIERE\r\n╠💃 BBB\r\n╠🥊 COMBATE\r\n╠🧞 CARTOON NETWORK\r\n╠🚴 SPORT TV\r\n╠⛪ CANAIS RELIGIOSOS\r\n╠📻 RÁDIO\r\n╠🧛🏻‍♂️ NOVELA ANTIGA\r\n╠➕ de 1.600 CANAIS 🇧🇷 FUNCIONA EM\r\n╠➢TODO BRASIL OU FORA\r\n╠════════════════\r\n╠DISPOSITIVOS COMPATIVEIS\r\n╠════════════════\r\n╠➢SMART ROKU\r\n╠➢SMART TV\r\n╠➢CELULAR\r\n╠➢TABLET\r\n╠➢NOTEBOOK & PC\r\n╠➢TV BOX\r\n╠➢IPHONE\r\n╠════════════════\r\nOfereço teste de 4 horas para você testar sem compromisso.👇 Para solicitar seu teste basta digitar *Teste* ou Numero *(14)* e seguir com atendimento.",
      });

      setTimeout(async () => {
        await client.sendMessage(
          msg.from, "═════════════❈Bem-vindo(a) Sua jornada conosco começa agora. Por favor, digite o número ou nome da opção que aparece em nosso menu❈═══════════════\r\n\n\n13╠➢VALOR DOS PLANO\r\n◎ ══════ ❈ ══════ ◎\r\n14╠➢FAZER TESTE\r\n"
        ); }, 9000); }, 9000);}  





  if (msg.body === '2' || msg.body === 'gestor de trafego'|| msg.body === 'trafego pago' || msg.body === 'anuncio') {
          const media1 = MessageMedia.fromFilePath("./trafego.png");
          const chat = await msg.getChat();
          
          // Função para enviar uma mensagem com estado de "digitando" e um intervalo de tempo
          const sendMessageWithTyping = async (message, delay) => {
              await chat.sendStateTyping(); // Enviar estado de "digitando"
              await new Promise(resolve => setTimeout(resolve, delay)); // Esperar o tempo do delay
              await client.sendMessage(msg.from, message); // Enviar mensagem
          };
      
          // Mensagem 1 com a imagem
          await chat.sendStateTyping(); // Enviar estado de "digitando"
          await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
          await chat.sendMessage(media1, { caption: "*Você está pronto para levar sua presença online para o próximo nível?*\n\nNosso serviço de Gestão de Tráfego Pago é a chave para aumentar a visibilidade, atrair clientes relevantes e impulsionar suas conversões.\n\nO QUE PODEMOS FAZER POR VOCÊ?" });
      
          // Mensagem 2
          const message2 = "╔═════ ≪ °❈° ≫ ═════╗\n🌀 CAMPANHAS ESTRATÉGICAS: 🌀\n╚═════ ≪ °❈° ≫ ═════╝\nDesenvolvemos campanhas personalizadas para atingir seu público-alvo, maximizando o retorno sobre o investimento.";
          await sendMessageWithTyping(message2, 2000);
      
          // Mensagem 3
          const message3 = "╔═════ ≪ °❈° ≫ ═════╗\n🌀 OTIMIZAÇÃO CONTÍNUA:     🌀\n╚═════ ≪ °❈° ≫ ═════╝\nMonitoramos, analisamos e ajustamos constantemente suas campanhas para garantir resultados consistentes e eficazes.";
          await sendMessageWithTyping(message3, 5000);
      
          // Mensagem 4
          const message4 = "╔═════ ≪ °❈° ≫ ═════╗\n🌀 SEGMENTAÇÃO PRECISA:     🌀\n╚═════ ≪ °❈° ≫ ═════╝\nAlcance as pessoas certas no momento certo. Utilizamos segmentação avançada para direcionar seu tráfego para os clientes mais propensos a converter";
          await sendMessageWithTyping(message4, 9000);
      
          // Mensagem 5
          const message5 = "╔═════ ≪ °❈° ≫ ═════╗\n🌀 RELATÓRIOS DETALHADOS: 🌀\n╚═════ ≪ °❈° ≫ ═════╝\nMantenha-se informado sobre o desempenho de suas campanhas com relatórios detalhados, proporcionando transparência total.";
          await sendMessageWithTyping(message5, 13000);
      
          // Mensagem 6
          const message6 = "╔═════ ≪ °❈° ≫ ═════╗\n🌀 ESTRATÉGIAS MULTICANAL: 🌀\n╚═════ ≪ °❈° ≫ ═════╝\nAproveitamos plataformas diversas para alcançar seu público em todos os lugares, desde redes sociais até anúncios de pesquisa.";
          await sendMessageWithTyping(message6, 15000);
      
          // Mensagem 7
          const message7 = "Convido você a agendar uma reunião conosco. Entendendo melhor o seu negócio, poderemos criar uma estratégia personalizada que atenda aos seus objetivos exclusivos.";
          await sendMessageWithTyping(message7, 18000);
      
          // Mensagem 8
          const message8 = "Garantimos uma gestão de tráfego pago que vai além das expectativas, otimizando resultados e maximizando o impacto online de sua marca. Juntos, podemos transformar sua presença online e alcançar resultados extraordinários.";
          await sendMessageWithTyping(message8, 21000);
      
          // Mensagem 9
          const message9 = "Para agendar sua reunião agora! 📆🚀 basta digitar a opção!\n\n═══════════════\n9╠➢AGENDAR REUNIÃO\n◎ ══════ ❈ ══════ ◎\n#╠➢FALAR COM ESPECIALISTA";
          await sendMessageWithTyping(message9, 25000);
      }

  //Opção 4 do MENU
  if (msg.body === "4") {
    const media1 = MessageMedia.fromFilePath("./leo2027.png");
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    setTimeout(async () => {
      await client.sendMessage(msg.from, media1, {
        caption:
          "◎ ══════ ≪ °❈° ≫ ══════ ◎\r\nDestaque Sua Marca com Nossa Divulgação em Mais de 5 Mil Grupos no WhatsApp🚀\r\n\r\nVocê está pronto para destacar sua marca, produtos ou serviços no mundo digital? Seu anúncio merece visibilidade máxima, e estou aqui para garantir que ele seja notado!\r\n\r\nNosso serviço de Divulgador Digital é a resposta para impulsionar sua visibilidade online e alcançar um público mais amplo.\r\n\r\n◎ ══════ ❈ ══════ ◎\r\n*🚀 O QUE OFERECEMOS:*\r\n◎ ══════ ❈ ══════ ◎\r\n\r\nCom nosso serviço exclusivo, divulgamos seu anúncio automaticamente em mais de 5 mil grupos do WhatsApp com marcação fantasma, 24 horas por dia.\r\n\r\nPlanos Irresistíveis:\r\n▫️ 1 Dia: R$ 10\r\n◎ ════ ❈ ════ ◎\r\n▫️ 15 Dias: R$ 50\r\n◎ ════ ❈ ════ ◎\r\n▫️ 30 Dias: R$ 70\r\n\r\nAlcance um público amplo e potencialize seus resultados com a nossa divulgação estratégica.\r\n\r\nDestaque-se na multidão e conquiste a atenção que sua marca merece! Digete *(22 ou Contratar)* agora para impulsionar sua visibilidade online! 📲✨",
      });

      setTimeout(async () => {
        await client.sendMessage(
          msg.from,"══════ ❈ ══════ \r\n*Destaque-se no Mundo Digital*\n\r══════ ❈ ══════\r\nAproveite nosso serviço para alcançar novos horizontes e conquistar a atenção do seu público-alvo.\r\n\r\nDesenvolvemos abordagens personalizadas para promover sua marca, adaptadas às características exclusivas do seu negócio.\r\n\r\n📆🚀 *Digite a opção desejada*\r\n═══════════════\r\n22╠➢CONTRATAR\r\n◎ ══════ ❈ ══════ ◎\r\n#╠➢FALAR COM ESPECIALISTA\r\n");
      }, 8000); // Atraso de 8 segundos (8000 milissegundos) antes da próxima mensagem
    }, 8000); // Atraso de 8 segundos (8000 milissegundos) antes da mensagem inicial
  } 


    else if (
    msg.body === "nao" ||
    msg.body.toLowerCase() === "Não" ||
    msg.body.toLowerCase() === "NÃO" ||
    msg.body.toLowerCase() === "não"
  ) {
    const media1 = MessageMedia.fromFilePath("./icon1.png");
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    setTimeout(async () => {
      await client.sendMessage(msg.from, media1, {
        caption:
          "Compreendo perfeitamente a sua decisão e agradeço por considerar nossa oferta.\r\n\r\n😊 _Se surgirem dúvidas ou se você reconsiderar no futuro, não hesite em entrar em contato._                        ",
      });

      // Use setTimeout para adicionar um atraso antes de enviar a próxima mensagem 
      setTimeout(async () => {
        await client.sendMessage(
          msg.from,
          "*Por favor, sinta-se à vontade para nos contactar* a qualquer moment, basta digitar *(MENU)* _Sua satisfação é importante para me e estou disposto a encontrar a melhor solução para você._"
        );
      }, 8000); // Atraso de 8 segundos (8000 milissegundos) antes da próxima mensagem
    }, 8000); // Atraso de 8 segundos (8000 milissegundos) antes da mensagem inicial
  }

  // //Opção 5 do MENU
    if (msg.body === "13") {
    const media1 = MessageMedia.fromFilePath("./icon7.png");

    // Enviar estado "digitando" por 8 segundos
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    // Use setTimeout para adicionar um atraso de 8 segundos
    setTimeout(async () => {
      // Após o atraso de 8 segundos, envie a mensagem
      await client.sendMessage(msg.from, media1, {
        caption:
          "*🤩Agora, digite o número do plano que mais se encaixa no seu estilo de vida:*\r\n\r\n╠═════════════❈\r\n15. *💼Plano Mensal 35.00$:* Perfeito para experimentar\r\n╠═════════════❈\r\n16 *📅Plano Trimestral 95.00 R$:*\r\nMais economia a cada trimestre\r\n╠═════════════❈\r\n17. *📆Plano Semestral 185.00 R$:*\r\nA escolha da estabilidade\r\n╠═════════════❈\r\n18. *📈Plano Anual 250.00 R$*\r\nA opção mais vantajosa.\r\n",
      });
    }, 8000);
  }
  // //Mostrar valores dos planos
  if (
    msg.body === "15" ||
    msg.body.toLowerCase() === "Plano mensal" ||
    msg.body.toLowerCase() === "10 Plano mensal" ||
    msg.body.toLowerCase() === "PLANO MENSAL" ||
    msg.body.toLowerCase() === "plano mensal" ||
    msg.body.toLowerCase() === "Plano Mensal"
  ) {
    // O cliente escolheu o Plano Mensal
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    setTimeout(async () => {
      const replyMessage =
        "*Você escolheu o Plano Mensal📅 35$*\r\n════════════════REAIS\r\nEste é um ótimo plano para começar. _Você Gostaria de fazer o Teste?_ digite *SIM* ou *Não*\r\n";
      client.sendMessage(msg.from, replyMessage);
    }, 5000); // Atraso de 5 segundos
  } 
  
  else if (msg.body === "16") {
    // O cliente escolheu o Plano Trimestral
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    setTimeout(async () => {
      const replyMessage =
        "*Você escolheu o Plano Trimestral📅 95$*\r\n════════════════REAIS\r\nEconomize ainda mais a cada trimestre. _Você Gostaria de fazer o Teste?_ digite *SIM* ou *Não*\r\n";
      client.sendMessage(msg.from, replyMessage);
    }, 5000); // Atraso de 5 segundos
  } 
  
  else if (msg.body === "17") {
    // O cliente escolheu o Plano Semestral
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    setTimeout(async () => {
      const replyMessage =
        "*Você escolheu o Plano Semestral.📅 185$*\r\n════════════════REAIS\r\nA escolha da estabilidade. _Você Gostaria de fazer o Teste?_ digite *SIM* ou *Não*\r\n";
      client.sendMessage(msg.from, replyMessage);
    }, 5000);
  }
  
  else if (msg.body === "18") {
    // O cliente escolheu o Plano Anual
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    setTimeout(async () => {
      const replyMessage =
        "*Você escolheu o Plano Anual.📅 250$*\r\n════════════════REAIS\r\nA opção mais vantajosa para economizar _Você Gostaria de fazer o Teste?_ digite *SIM* ou *Não*\r\n";
      client.sendMessage(msg.from, replyMessage);
    }, 5000); // Atraso de 5 segundos
  }


  if (msg.body === 'fazer teste' || msg.body.toLowerCase() === '14' || msg.body.toLowerCase() === 'Sim' || msg.body.toLowerCase() === 'SIM') {
    // Etapa inicial: pergunte ao usuário sobre o dispositivo
    const media1 = MessageMedia.fromFilePath('./icon5.png');
    const chat = await msg.getChat();
  
    setTimeout(async () => {
        await chat.sendStateTyping(8000);
        const replyMessage = `*📱Em qual dispositivo você gostaria de testar?* Basta digitar o nome do dispositivo das listas abaixo:\r\n\r\n╔═════🖥️═════╗\r\n╠➢ *Funciona Em:*\r\n╠➢ 6. Computador e Not\r\n╠➢ 7. TVs Smart\r\n╠➢ 8. TV Box\r\n╠➢ 9. Celular\r\n═════════════\r\n\r\n_🔢Digite o número correspondente ao dispositivo que deseja testar nosso serviço TV WEB._`;
        await client.sendMessage(msg.from, media1, { caption: replyMessage });
    }, 8000);}
  


    if (/^(computador|tv\sbox|tv\ssmart|tv\slg|tv\ssamsung|celular|iphone|android|tcl|notbook)$/i.test(msg.body))
    {  // Captura a escolha do dispositivo do usuário
      const chosenDevice = msg.body;
    
      // Etapa secundária: continue com base na escolha do dispositivo
      // Neste exemplo, você pode adaptar a mensagem de acordo com a escolha do dispositivo
    
      setTimeout(async () => {
        // Antes de enviar a mensagem, configure o estado "digitando" por 5 segundos
        const chat = await msg.getChat();
        await chat.sendStateTyping(5000);
    
        // Captura o nome do remetente
        const contact = await msg.getContact();
    
        const responseMessage = `Ótima escolha, *${contact.name || 'amigo'}*!\r\n\r\nVocê escolheu o dispositivo *${chosenDevice}* para testar nossos canais, *Assista o video enquanto eu encaminho seu contato* para o _Léo, nosso especialista._ *Aproveite!🚀*`;
        const media1 = MessageMedia.fromFilePath('./video1.mp4');
        await client.sendMessage(msg.from, media1, {
          caption: responseMessage + "\r\n\r\n*Assista o vídeo até o final🚀*"
        });
    
        // Adicionar uma mensagem após o vídeo
        setTimeout(async () => {
          await client.sendMessage(msg.from, 'Obrigado(a) seu contato foi transferido para o *Leo TV WEB* e em alguns minutos ele vai entrar em contato com você enviando seu teste.');
          const contact = await msg.getContact();
          await client.sendMessage('558584460424@c.us', `Cliente ${contact.name} solicitando atendimento na opção teste! ${chosenDevice} https://wa.me/${contact.number}`);
          await msg.reply(`Pronto! Seu contato já foi *encaminhado para o Leonardo.* Se precisar de alguma informação do MENU, *basta digitar (MENU).*`);
        }, 8000); // Espere 8 segundos após o vídeo antes de enviar a mensagem
      }, 8000);}

      
//MENSAGEM ENCAMINHADA PARA ATENDENTE
    if (msg.body === '9' || msg.body.toLowerCase() === 'Agendar reunião'|| msg.body.toLowerCase() === 'reunião') {
      const media1 = MessageMedia.fromFilePath('./suporteleo.png');
    
      // Enviar estado "digitando" por 8 segundos
      const chat = await msg.getChat();
      await chat.sendStateTyping();
    
      // Use setTimeout para adicionar um atraso de 8 segundos
      setTimeout(async () => {
        // Após o atraso de 8 segundos, envie a mensagem
        await client.sendMessage(msg.from, media1, {
          caption: 'Obrigado(a) seu contato será transfirido para o Leonardo, em alguns minutos ele vai entrar em contato com você!'
        });
        const contact = await msg.getContact();
        setTimeout(function () {
          msg.reply(`@${contact.number}` + ' *Pronto! seu contato já foi encaminhado para o Leonardo,* se precisar de alguma informação do MENU basta digitar (MENU)');
          client.sendMessage('558584460424@c.us', 'Cliente solicitando atendimento na OPÇAO 9 REUNIÃO. https://wa.me/' + `${contact.number}`);
        }, 8000); }, 8000); }
    


    if (msg.body === '22' || msg.body.toLowerCase() === 'Contratar'|| msg.body.toLowerCase() === 'CONTRATAR') {
          const media1 = MessageMedia.fromFilePath('./suporteleo.png');
        
          // Enviar estado "digitando" por 8 segundos
          const chat = await msg.getChat();
          await chat.sendStateTyping();
        
          // Use setTimeout para adicionar um atraso de 8 segundos
          setTimeout(async () => {
            // Após o atraso de 8 segundos, envie a mensagem
            await client.sendMessage(msg.from, media1, {
              caption: 'Obrigado(a) seu contato será transfirido para o Leonardo, em alguns minutos ele vai entrar em contato com você!'
            });
            const contact = await msg.getContact();
            setTimeout(function () {
              msg.reply(`@${contact.number}` + ' *Pronto! seu contato já foi encaminhado para o Leonardo,* se precisar de alguma informação basta digitar (MENU)');
              client.sendMessage('558584460424@c.us', 'Cliente solicitando atendimento na OPÇAO 4 CONTRATAR. https://wa.me/' + `${contact.number}`);
            }, 8000); }, 8000); }
        
     

            if (msg.body === '#' || msg.body.toLowerCase() === 'Falar com especialista'|| msg.body.toLowerCase() === 'reunião') {
              const media1 = MessageMedia.fromFilePath('./suporteleo.png');
            
              // Enviar estado "digitando" por 8 segundos
              const chat = await msg.getChat();
              await chat.sendStateTyping();
            
              // Use setTimeout para adicionar um atraso de 8 segundos
              setTimeout(async () => {
                // Após o atraso de 8 segundos, envie a mensagem
                await client.sendMessage(msg.from, media1, {
                  caption: 'Obrigado(a) seu contato será transfirido para o Leonardo, em alguns minutos ele vai entrar em contato com você!'
                });
                const contact = await msg.getContact();
                setTimeout(function () {
                  msg.reply(`@${contact.number}` + ' *Pronto! seu contato já foi encaminhado para o Leonardo,* se precisar de alguma informação basta digitar (MENU)');
                  client.sendMessage('558584460424@c.us', 'Cliente solicitando atendimento na OPÇAO # FALAR COM ATENDENTE. https://wa.me/' + `${contact.number}`);
                }, 8000); }, 8000); }
            
        
// Verificação do fluxo do chat
if (msg.body.toUpperCase() === "7" || msg.body.toUpperCase() === "JÁ SOU CLIENTE") {
  etapaCadastro = 1; // Define a etapa inicial do cadastro
  await client.sendMessage(
    msg.from,
    "👋 Olá! 😊 Para garantir que eu possa oferecer o suporte mais eficaz, gostaría de obter algumas informações essenciais.\r\n\r\n📝 Poderia gentilmente fornecer *SEU NOME* para que eu possa me dirigir a você corretamente?"
  );
} else if (etapaCadastro === 1) {
  nome = msg.body.trim(); // Remove a palavra-chave const
  await client.sendMessage(
    msg.from,
    `Blz! _${nome},_ *🌟Agora digite em poucas palavras* o motivo do seu contato para um atendimento mais eficiente e direcionado.\r\n\r\n💡 *Saber exatamente do que você precisa* me ajuda a otimizar meu tempo e garantir uma solução rápida e precisa para seu suporte.`
  );
  etapaCadastro = 2; // Avança para a próxima etapa do cadastro após enviar a mensagem
} else if (etapaCadastro === 2) {
  const motivo = msg.body.trim(); // Obtém o motivo fornecido pelo usuário
  etapaCadastro = 0; // Reinicia a etapa do cadastro
  await client.sendMessage(
    msg.from,
    `Entendi *${nome}!* 🤔 Você deseja falar sobre ${motivo}.\r\n\r\nVamos cuidar disso para você! Em breve, entrarei em contato para confirmar os detalhes.\r\n\r\n*Obrigado pela sua paciência e confiança! 🙏*`
  );

  // Chamada da função de encaminhamento de mensagem
  await encaminharMensagem(msg, motivo);
}


//OPÇÃO 7 JA SOU CLIENTE
async function encaminharMensagem(msg, motivo) {
  const media1 = MessageMedia.fromFilePath('./suporteleo.png');
  const chat = await msg.getChat();
  await chat.sendStateTyping();
  setTimeout(async () => {
    await client.sendMessage(msg.from, media1, {
      caption: 'Obrigado(a) seu contato será transferido para o Leonardo, em alguns minutos ele vai entrar em contato com você!'
    });
    const contact = await msg.getContact();
    setTimeout(function () {
      msg.reply(`@${contact.number}` + ' *Pronto! Seu contato já foi encaminhado para o Leonardo,* se precisar de alguma informação basta digitar (MENU)');
      client.sendMessage('558584460424@c.us', `Cliente solicitando atendimento na OPÇÃO JÁ SOU CLIENTE. Motivo: ${motivo} https://wa.me/${contact.number}`);
    }, 8000);
  }, 8000);
}


  //Opção 8 do MENU
  if (msg.body.toLowerCase() === "ver projetos" || msg.body === "8") {
    const chat = await msg.getChat();

    // Enviar a mensagem inicial
    await chat.sendMessage("📊 *Veja alguns de meus Projetos*\r\n════════════════ ❈\r\nAgradeço muito pelo seu interesse em meu serviço de criação de sites.\r\n\r\nFavor me informar se há algo específico que chamou sua atenção ou se precisar de mais informações para tomar uma decisão, gostaria de convidar VOCÊ para uma reunião para você me falar do seu projeto, basta digitar (9) ");
    
    const media2 = MessageMedia.fromFilePath("./Sitedesafio10d.pdf");
    const media3 = MessageMedia.fromFilePath("./Advogacia.pdf");
    const media4 = MessageMedia.fromFilePath("./Portfolio.pdf");
    const media5 = MessageMedia.fromFilePath("./Sitetvweb.pdf");
    const media6 = MessageMedia.fromFilePath("./LojaOnline.pdf");

    // Enviar os PDFs com intervalos ajustados
    setTimeout(() => {
        client.sendMessage(msg.from, media2, { caption: "SITE EMAGRECIMENTO" });
    }, 5000); // 5 segundos

    setTimeout(() => {
        client.sendMessage(msg.from, media3, { caption: "SITE ADVOGACIA" });
    }, 7000); // 7 segundos

    setTimeout(() => {
        client.sendMessage(msg.from, media4, { caption: "PORTFOLIO" });
    }, 9000); // 9 segundos

    setTimeout(() => {
        client.sendMessage(msg.from, media5, { caption: "ENTRETENIMENTO" });
    }, 11000); // 11 segundos

    setTimeout(() => {
        client.sendMessage(msg.from, media6, { caption: "LOJA ONLINE" });
    }, 13000); // 13 segundos

    // Enviar a mensagem de texto após todos os PDFs
    setTimeout(() => {
        client.sendMessage(msg.from, "🔍 Eu estou a disposição para discutir qualquer aspecto específico, responder a perguntas ou ajustar detalhes conforme suas preferências.\r\n\r\n🔐 Quero muito garantir que o projeto final atenda totalmente às suas expectativas, basta digitar *9╠➢ PARA AGENDAR UMA REUNIÃO GRATUITA 📅.*");
    }, 15000); // 15 segundos após o último PDF
}


if (msg.body === '6') {
    const media1 = MessageMedia.fromFilePath('./icon8.png');
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    setTimeout(async () => {
      await client.sendMessage(msg.from, media1, {
        caption: '🌐 𝗜𝗡𝗧𝗘𝗥𝗡𝗘𝗧🚀 𝗜𝗟𝗜𝗠𝗜𝗧𝗔𝗗𝗔 🌐\r\n\r*Operadora*\r\n\r🔴 VIVO 🔴\r\n🔵 TIM 🔵\r\n➖➖➖➖➖➖➖➖\r\n✅ 𝟭-𝕃𝕆𝔾𝕌𝕀ℕ / 𝗥$ 25,𝟬𝟬\r\n\r\n⏳ 𝗗𝘂𝗿𝗮𝗰̧𝗮̃𝗼 𝟯𝟬 𝗱𝗶𝗮𝘀 ⏳\r\n🌐 - 𝗡𝗮𝘃𝗲𝗴𝗮𝗰̧𝗮̃𝗼 𝗜𝗹𝗶𝗺𝗶𝘁𝗮𝗱𝗮\r\n\🎬 - 𝗩𝗶𝗱𝗲𝗼𝘀 𝗢𝗻𝗹𝗶𝗻𝗲\r\n🎭 - 𝗥𝗲𝗱𝗲𝘀 𝗦𝗼𝗰𝗶𝗮𝗶𝘀\r\n🎮 - 𝗝𝗼𝗴𝗼𝘀 𝗢𝗻𝗹𝗶𝗻𝗲 \r\n🙌   E muito mais\r\n📡 𝗩𝗶𝗮 𝗔𝗣𝗟𝗜𝗖𝗔𝗧𝗜𝗩𝗢\r\n📲 𝗖𝗲𝗹𝘂𝗹𝗮𝗿𝗲𝘀/𝗔𝗡𝗗𝗥𝗢𝗜𝗗\r\n🚀 𝗔𝗹𝘁𝗮 𝘃𝗲𝗹𝗼𝗰𝗶𝗱𝗮𝗱𝗲\r\n🔰 𝗧𝗘𝗦𝗧𝗘 𝗚𝗥𝗔́𝗧𝗜𝗦 🔰 Duração 2 horas🌟\r\n\r\n*Obtenha Internet Ilimitada Agora*\r\n_Sua experiência de internet está prestes a mudar para sempre, Aproveite essa oportunidade para liberar todo o potencial do seu celular Android!🚀📱_'
      });
  
      // Use setTimeout para adicionar um atraso antes de enviar a próxima mensagem
      setTimeout(async () => {
        await client.sendMessage(msg.from, 'Se tiver interesse em fazer o teste, Funciona nas seguintes operadoras 🔵TIM,🟣VIVO: *Basta dizer qual é sua operadora que enviarei seu teste*');
      }, 8000); // Atraso de 8 segundos (8000 milissegundos) antes da próxima mensagem
    }, 8000); // Atraso de 8 segundos (8000 milissegundos) antes da mensagem inicial
  } 

});

// INITIALIZE DO SERVIÇO
server.listen(port, function () {
  console.log("© Comunidade OH - Aplicativo rodando na porta *: " + port);
});
