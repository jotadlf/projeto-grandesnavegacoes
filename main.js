// ==================== CLASSES ====================

class InputManager {
  constructor() {
    this.keys = {};
    this.setupListeners();
  }

  setupListeners() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === "Escape") closeScreen();
    });
    document.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  isKeyPressed(key) {
    return this.keys[key.toLowerCase()] || false;
  }

  isSprinting() {
    return this.isKeyPressed("shift");
  }

  getDirection() {
    const dir = { x: 0, y: 0 };
    if (this.isKeyPressed("w")) dir.y -= 1;
    if (this.isKeyPressed("s")) dir.y += 1;
    if (this.isKeyPressed("a")) dir.x -= 1;
    if (this.isKeyPressed("d")) dir.x += 1;
    return dir;
  }
}

class Player {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.normalSpeed = 5;
    this.sprintSpeed = 8;
    this.currentSpeed = this.normalSpeed;
  }

  update(inputManager, deltaTime) {
    const direction = inputManager.getDirection();
    const speed = inputManager.isSprinting()
      ? this.sprintSpeed
      : this.normalSpeed;

    if (direction.x !== 0 || direction.y !== 0) {
      const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
      const normalizedDir = {
        x: direction.x / magnitude,
        y: direction.y / magnitude,
      };

      this.x += normalizedDir.x * speed * deltaTime;
      this.y += normalizedDir.y * speed * deltaTime;
      this.currentSpeed = speed;
    }
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
}

class MapArea {
  constructor(id, name, x, y, width, height, music = null, background = null) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.music = music;
    this.background = background;
    this.npcs = [];
    this.quests = [];
  }

  addNPC(npc) {
    this.npcs.push(npc);
  }

  addQuest(quest) {
    this.quests.push(quest);
  }

  isPlayerInside(playerX, playerY) {
    return (
      playerX >= this.x &&
      playerX <= this.x + this.width &&
      playerY >= this.y &&
      playerY <= this.y + this.height
    );
  }

  getNPCById(npcId) {
    return this.npcs.find((npc) => npc.id === npcId);
  }
}

class Map {
  constructor(gameWidth = 2000, gameHeight = 2000) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.areas = [];
    this.currentArea = null;
    this.createAreas();
  }

  createAreas() {
    // Portugal - Porto de partida
    this.addArea(
      new MapArea(
        "portugal",
        "Portugal - Porto",
        100,
        100,
        400,
        300,
        "vento",
        "igrejaportugal.png",
      ),
    );

    // Oceano Atlântico
    this.addArea(
      new MapArea(
        "atlantico",
        "Oceano Atlântico",
        600,
        50,
        700,
        400,
        "ondasdomar",
        null,
      ),
    );

    // Brasil - Descoberta
    this.addArea(
      new MapArea(
        "brasil",
        "Brasil - Mata Brasileira",
        1400,
        100,
        400,
        350,
        "papagaio",
        "brasilepoca1500.png",
      ),
    );

    // Índia - Calicute
    this.addArea(
      new MapArea(
        "india",
        "Índia - Calicute",
        1650,
        600,
        300,
        300,
        "especiarias",
        "igrejacatolicacenario.png",
      ),
    );

    // Espanha - Corte de Colombo
    this.addArea(
      new MapArea(
        "espanha",
        "Espanha - Corte Real",
        200,
        700,
        350,
        300,
        "corte",
        "entradadeportugal.png",
      ),
    );

    this.currentArea = this.areas[0];
  }

  addArea(area) {
    this.areas.push(area);
  }

  getAreaByPosition(x, y) {
    return this.areas.find((area) => area.isPlayerInside(x, y));
  }

  updatePlayerArea(playerX, playerY) {
    const newArea = this.getAreaByPosition(playerX, playerY);
    if (newArea && newArea !== this.currentArea) {
      this.currentArea = newArea;
      return true;
    }
    return false;
  }

  getAreaById(id) {
    return this.areas.find((area) => area.id === id);
  }
}

class DialogNode {
  constructor(id, text, speaker, choices = []) {
    this.id = id;
    this.text = text;
    this.speaker = speaker;
    this.choices = choices; // [{text: '...', nextNodeId: '...'}]
  }
}

class DialogTree {
  constructor(characterName) {
    this.characterName = characterName;
    this.nodes = {};
    this.currentNodeId = null;
  }

  addNode(node) {
    this.nodes[node.id] = node;
  }

  start(nodeId) {
    this.currentNodeId = nodeId;
    return this.nodes[nodeId];
  }

  goToNode(nodeId) {
    if (this.nodes[nodeId]) {
      this.currentNodeId = nodeId;
      return this.nodes[nodeId];
    }
    return null;
  }

  getCurrentNode() {
    return this.nodes[this.currentNodeId];
  }
}

class DialogManager {
  constructor() {
    this.dialogs = {};
    this.currentDialog = null;
    this.loadDialogs();
  }

  loadDialogs() {
    // Colombo
    const colomboTree = new DialogTree("Cristóvão Colombo");

    colomboTree.addNode(
      new DialogNode(
        "colombo_start",
        "...O oceano...\n\nUm vazio imenso... que muitos temiam atravessar.\n\nDiga-me, navegador... o que você procura?",
        "Colombo",
        [
          {
            text: "Quero entender sua jornada.",
            nextNodeId: "colombo_journey",
          },
          { text: "Quero riqueza e poder.", nextNodeId: "colombo_wealth" },
          {
            text: "Quero a verdade sobre a Índia.",
            nextNodeId: "colombo_truth",
          },
          { text: "Quem és tu?", nextNodeId: "colombo_who" },
        ],
      ),
    );

    colomboTree.addNode(
      new DialogNode(
        "colombo_journey",
        "Então escute... com atenção.\n\nEu não era o homem mais rico... nem o mais respeitado.\n\nMas tinha uma convicção...\n\nQue era possível chegar às Índias navegando para o oeste.",
        "Colombo",
        [
          {
            text: "Por que ninguém acreditava em você?",
            nextNodeId: "colombo_belief",
          },
          { text: "Como conseguiu apoio?", nextNodeId: "colombo_support" },
        ],
      ),
    );

    colomboTree.addNode(
      new DialogNode(
        "colombo_belief",
        "Porque o desconhecido assusta.\n\nEles temiam cair no fim do mundo... ou nunca mais voltar.\n\nMas eu via oportunidade... onde outros viam medo.",
        "Colombo",
        [{ text: "Continuar...", nextNodeId: "colombo_end" }],
      ),
    );

    colomboTree.addNode(
      new DialogNode(
        "colombo_support",
        "Anos de rejeição... portas fechadas.\n\nAté que a Espanha ouviu meu plano.\n\nFinalmente... alguém disposto a arriscar.",
        "Colombo",
        [{ text: "Continuar...", nextNodeId: "colombo_end" }],
      ),
    );

    colomboTree.addNode(
      new DialogNode(
        "colombo_wealth",
        "Ah... então você é movido pela ambição.\n\nNão está sozinho.\n\nEspeciarias... ouro... rotas comerciais...\n\nEra isso que movia os reinos da Europa durante as Grandes Navegações.",
        "Colombo",
        [
          { text: "Você encontrou ouro?", nextNodeId: "colombo_gold" },
          { text: "O que encontrou então?", nextNodeId: "colombo_found" },
        ],
      ),
    );

    colomboTree.addNode(
      new DialogNode(
        "colombo_gold",
        "Pouco... menos do que esperavam.\n\nIsso trouxe problemas... e desconfiança.",
        "Colombo",
        [{ text: "Continuar...", nextNodeId: "colombo_end" }],
      ),
    );

    colomboTree.addNode(
      new DialogNode(
        "colombo_found",
        "Terras desconhecidas.\n\nPovos que nunca haviam visto europeus.\n\nUm novo mundo... embora eu não soubesse disso na época.",
        "Colombo",
        [{ text: "Continuar...", nextNodeId: "colombo_end" }],
      ),
    );

    colomboTree.addNode(
      new DialogNode(
        "colombo_truth",
        "A Índia...\n\nEu acreditava ter chegado lá.\n\nMas estava enganado.",
        "Colombo",
        [
          {
            text: "Então o que você descobriu?",
            nextNodeId: "colombo_discovery",
          },
          { text: "Isso foi um erro?", nextNodeId: "colombo_mistake" },
        ],
      ),
    );

    colomboTree.addNode(
      new DialogNode(
        "colombo_discovery",
        "Um continente inteiro... desconhecido para nós.\n\nHoje vocês o chamam de América.",
        "Colombo",
        [{ text: "Continuar...", nextNodeId: "colombo_end" }],
      ),
    );

    colomboTree.addNode(
      new DialogNode(
        "colombo_mistake",
        "Erro... ou destino?\n\nMesmo enganado... minha viagem mudou o mundo.",
        "Colombo",
        [{ text: "Continuar...", nextNodeId: "colombo_end" }],
      ),
    );

    colomboTree.addNode(
      new DialogNode(
        "colombo_who",
        "Fui um navegador, explorador, cartógrafo e almirante.\n\nLiderei a frota que alcançou o continente americano em 12 de outubro de 1492.\n\nPartei sob o comando dos Reis Católicos da Espanha... em busca de uma nova rota para as Índias.",
        "Colombo",
        [{ text: "Continuar...", nextNodeId: "colombo_end" }],
      ),
    );

    colomboTree.addNode(
      new DialogNode(
        "colombo_end",
        "O oceano ainda guarda mistérios...\n\nE agora... é a sua vez.\n\nVocê navegaria por glória... riqueza... ou descoberta?",
        "Colombo",
        [
          { text: "Glória", nextNodeId: "colombo_start" },
          { text: "Riqueza", nextNodeId: "colombo_start" },
          { text: "Descoberta", nextNodeId: "colombo_start" },
          { text: "Finalizar diálogo", nextNodeId: null },
        ],
      ),
    );

    this.dialogs["colombo"] = colomboTree;

    // Infante D. Henrique
    const henriqueTree = new DialogTree("Infante D. Henrique");

    henriqueTree.addNode(
      new DialogNode(
        "henrique_start",
        "Portugal é pequeno, mas o mar não tem fronteiras.\n\nVai, e traz-me o que os mapas ainda não mostram.\n\nNão temas o horizonte. O que os homens chamam de fim do mundo, eu chamo de começo.",
        "Infante D. Henrique",
        [
          { text: "Dar uma missão", nextNodeId: "henrique_mission" },
          { text: "Ouvir reflexão", nextNodeId: "henrique_reflect" },
          { text: "Despedir-se", nextNodeId: null },
        ],
      ),
    );

    henriqueTree.addNode(
      new DialogNode(
        "henrique_mission",
        "Os mouros bloqueiam as rotas de terra. Encontra um caminho pelo mar — e a glória será tua e de Portugal.\n\nHá um cabo ao sul que nenhum cristão dobrou. Chama-se Bojador. Vai lá chegar.",
        "Infante D. Henrique",
        [{ text: "Voltar", nextNodeId: "henrique_start" }],
      ),
    );

    henriqueTree.addNode(
      new DialogNode(
        "henrique_reflect",
        "Dizem que sou o Navegador. Ironia — nunca embarquei. Mas cada nau que parte leva um pedaço da minha alma.\n\nDeus deu-nos olhos para ver além do horizonte. O medo é o único mapa falso.",
        "Infante D. Henrique",
        [{ text: "Voltar", nextNodeId: "henrique_start" }],
      ),
    );

    this.dialogs["henrique"] = henriqueTree;

    // Vasco da Gama
    const gamaTree = new DialogTree("Vasco da Gama");

    gamaTree.addNode(
      new DialogNode(
        "gama_start",
        "Deixa os medos no porto. No mar só cabem coragem e obediência.\n\nJá doblamos o Cabo das Tormentas. O que vem a seguir não pode ser pior.",
        "Vasco da Gama",
        [
          { text: "Receber missão", nextNodeId: "gama_mission" },
          { text: "Ouvir sobre rivais", nextNodeId: "gama_rivals" },
          { text: "Despedir-se", nextNodeId: null },
        ],
      ),
    );

    gamaTree.addNode(
      new DialogNode(
        "gama_mission",
        "Preciso de alguém que chegue a Calicute antes de mim e saiba o que nos espera. Esse alguém és tu.\n\nOs especiarias valem ouro em Lisboa. Cada grão de pimenta que trouxeres paga o salário de dez homens.",
        "Vasco da Gama",
        [{ text: "Voltar", nextNodeId: "gama_start" }],
      ),
    );

    gamaTree.addNode(
      new DialogNode(
        "gama_rivals",
        "Os árabes dominam o comércio do Índico há séculos. Hoje isso muda.\n\nVeneza lucra com cada especiaria que passa pelo Mediterrâneo. Vamos cortar esse caminho pela raiz.",
        "Vasco da Gama",
        [{ text: "Voltar", nextNodeId: "gama_start" }],
      ),
    );

    this.dialogs["gama"] = gamaTree;
  }

  startDialog(characterId) {
    const startNodes = {
      colombo: "colombo_start",
      henrique: "henrique_start",
      gama: "gama_start",
    };

    const tree = this.dialogs[characterId];
    if (tree) {
      this.currentDialog = tree;
      return tree.start(startNodes[characterId]);
    }
    return null;
  }

  getCurrentDialog() {
    return this.currentDialog;
  }

  goToNode(nodeId) {
    if (this.currentDialog) {
      return this.currentDialog.goToNode(nodeId);
    }
    return null;
  }

  endDialog() {
    this.currentDialog = null;
  }
}

class Quest {
  constructor(id, title, description, reward = 100) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.completed = false;
    this.reward = reward;
  }

  complete() {
    this.completed = true;
  }
}

class GameManager {
  constructor() {
    this.inputManager = new InputManager();
    this.player = new Player(250, 250);
    this.map = new Map();
    this.dialogManager = new DialogManager();
    this.lastTime = Date.now();
    this.gameRunning = true;
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.viewportX = 0;
    this.viewportY = 0;
    this.cameraZoom = 0.5; // Zoom out para ver mais do mapa
    this.setupUI();
    this.gameLoop();
  }

  setupUI() {
    // Criar containers necessários
    const gameContainer = document.createElement("div");
    gameContainer.id = "game-container";
    gameContainer.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 100;
      pointer-events: none;
    `;

    const hud = document.createElement("div");
    hud.id = "hud";
    hud.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      color: #f2e4c4;
      font-family: 'IM Fell English', serif;
      z-index: 101;
      background: rgba(10, 22, 40, 0.7);
      padding: 12px 16px;
      border: 1px solid #c9a84c;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.6;
    `;

    const dialogBox = document.createElement("div");
    dialogBox.id = "dialog-box";
    dialogBox.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      max-width: 800px;
      background: rgba(10, 22, 40, 0.95);
      border: 2px solid #c9a84c;
      padding: 20px;
      border-radius: 10px;
      color: #f2e4c4;
      font-family: 'IM Fell English', serif;
      z-index: 101;
      display: none;
      pointer-events: all;
      max-height: 300px;
      overflow-y: auto;
    `;

    const mapToggle = document.createElement("button");
    mapToggle.id = "map-toggle-btn";
    mapToggle.innerHTML = "🗺️ Mostrar Mapa";
    mapToggle.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      padding: 10px 16px;
      background: rgba(201, 168, 76, 0.3);
      border: 1px solid #c9a84c;
      color: #f2e4c4;
      font-family: 'IM Fell English', serif;
      cursor: pointer;
      border-radius: 4px;
      z-index: 101;
      pointer-events: all;
    `;
    mapToggle.addEventListener("click", () => this.toggleMapView());
    mapToggle.addEventListener("mouseover", (e) => {
      e.target.style.background = "rgba(201, 168, 76, 0.5)";
    });
    mapToggle.addEventListener("mouseout", (e) => {
      e.target.style.background = "rgba(201, 168, 76, 0.3)";
    });

    document.body.appendChild(gameContainer);
    document.body.appendChild(hud);
    document.body.appendChild(dialogBox);
    document.body.appendChild(mapToggle);
  }

  toggleMapView() {
    const ocean = document.getElementById("ocean");
    const canvas = this.canvas;
    const ui = document.getElementById("ui");

    if (canvas.style.display === "none") {
      canvas.style.display = "block";
      ocean.style.display = "none";
      ui.style.display = "none";
      document.getElementById("compass").style.display = "none";
      document.querySelector(".coords").style.display = "none";
      document.querySelector(".version").style.display = "none";
    } else {
      canvas.style.display = "none";
      ocean.style.display = "block";
      ui.style.display = "block";
      document.getElementById("compass").style.display = "block";
      document.querySelector(".coords").style.display = "block";
      document.querySelector(".version").style.display = "block";
    }
  }

  updateHUD() {
    const hud = document.getElementById("hud");
    const pos = this.player.getPosition();
    hud.innerHTML = `
      <div><strong>Grandes Navegações</strong></div>
      <div style="margin-top: 8px; font-size: 12px; opacity: 0.8;">
        Posição: ${Math.round(pos.x)}, ${Math.round(pos.y)}<br/>
        Área: <strong style="color: #c9a84c;">${this.map.currentArea?.name || "Desconhecida"}</strong><br/>
        <br/>
        <strong>Controles:</strong><br/>
        WASD: Mover | Shift: Correr<br/>
        E: Interagir | Esc: Fechar | 🗺️: Mapa
      </div>
    `;
  }

  drawMap() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Limpar canvas
    this.ctx.fillStyle = "#0a1628";
    this.ctx.fillRect(0, 0, w, h);

    // Desenhar grid
    this.ctx.strokeStyle = "rgba(201, 168, 76, 0.1)";
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.map.gameWidth; i += 100) {
      const x = (i - this.viewportX) * this.cameraZoom + w / 2;
      if (x > 0 && x < w) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, h);
        this.ctx.stroke();
      }
    }
    for (let j = 0; j < this.map.gameHeight; j += 100) {
      const y = (j - this.viewportY) * this.cameraZoom + h / 2;
      if (y > 0 && y < h) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(w, y);
        this.ctx.stroke();
      }
    }

    // Desenhar áreas
    this.map.areas.forEach((area) => {
      const screenX = (area.x - this.viewportX) * this.cameraZoom + w / 2;
      const screenY = (area.y - this.viewportY) * this.cameraZoom + h / 2;
      const screenW = area.width * this.cameraZoom;
      const screenH = area.height * this.cameraZoom;

      // Fundo da área
      this.ctx.fillStyle =
        area === this.map.currentArea
          ? "rgba(139, 26, 26, 0.3)"
          : "rgba(26, 58, 92, 0.2)";
      this.ctx.fillRect(screenX, screenY, screenW, screenH);

      // Border da área
      this.ctx.strokeStyle =
        area === this.map.currentArea ? "#8b1a1a" : "rgba(201, 168, 76, 0.3)";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(screenX, screenY, screenW, screenH);

      // Nome da área
      this.ctx.fillStyle =
        area === this.map.currentArea ? "#8b1a1a" : "#c9a84c";
      this.ctx.font = "bold 12px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        area.name,
        screenX + screenW / 2,
        screenY + screenH / 2,
      );
    });

    // Desenhar NPCs
    const npcPositions = {
      espanha: { id: "colombo", x: 350, y: 820, icon: "🧭", color: "#c9a84c" },
      portugal: {
        id: "henrique",
        x: 250,
        y: 200,
        icon: "⚓",
        color: "#f0d080",
      },
      india: { id: "gama", x: 1800, y: 700, icon: "🛳️", color: "#8b1a1a" },
    };

    Object.values(npcPositions).forEach((npc) => {
      const screenX = (npc.x - this.viewportX) * this.cameraZoom + w / 2;
      const screenY = (npc.y - this.viewportY) * this.cameraZoom + h / 2;

      // Círculo do NPC
      this.ctx.fillStyle = npc.color;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
      this.ctx.fill();

      // Label
      this.ctx.fillStyle = npc.color;
      this.ctx.font = "bold 10px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(npc.icon, screenX, screenY + 15);
    });

    // Desenhar player
    const playerScreenX =
      (this.player.x - this.viewportX) * this.cameraZoom + w / 2;
    const playerScreenY =
      (this.player.y - this.viewportY) * this.cameraZoom + h / 2;

    // Círculo maior (aura)
    this.ctx.fillStyle = "rgba(201, 168, 76, 0.2)";
    this.ctx.beginPath();
    this.ctx.arc(playerScreenX, playerScreenY, 12, 0, Math.PI * 2);
    this.ctx.fill();

    // Personagem
    this.ctx.fillStyle = "#f2e4c4";
    this.ctx.beginPath();
    this.ctx.arc(playerScreenX, playerScreenY, 8, 0, Math.PI * 2);
    this.ctx.fill();

    // Outline
    this.ctx.strokeStyle = "#c9a84c";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(playerScreenX, playerScreenY, 8, 0, Math.PI * 2);
    this.ctx.stroke();

    // Velocidade indicator
    const speed = this.inputManager.isSprinting() ? "SPRINT" : "NORMAL";
    this.ctx.fillStyle = this.inputManager.isSprinting()
      ? "#8b1a1a"
      : "#c9a84c";
    this.ctx.font = "bold 10px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(speed, playerScreenX, playerScreenY + 20);
  }

  updateCamera() {
    // Câmera segue o player
    this.viewportX = this.player.x;
    this.viewportY = this.player.y;
  }

  showDialog(characterId) {
    const node = this.dialogManager.startDialog(characterId);
    if (node) {
      this.displayDialogNode(node);
    }
  }

  displayDialogNode(node) {
    const dialogBox = document.getElementById("dialog-box");
    dialogBox.style.display = "block";

    let html = `<div style="margin-bottom: 15px;">
      <strong style="color: #c9a84c; font-size: 16px;">${node.speaker}</strong>
      <p style="margin-top: 10px; line-height: 1.6; font-size: 14px;">${node.text}</p>
    </div>`;

    if (node.choices && node.choices.length > 0) {
      html +=
        '<div style="display: flex; flex-direction: column; gap: 8px; margin-top: 15px;">';
      node.choices.forEach((choice, index) => {
        html += `<button class="dialog-choice" data-node-id="${choice.nextNodeId}" style="
          background: rgba(201, 168, 76, 0.2);
          border: 1px solid #c9a84c;
          color: #f2e4c4;
          padding: 8px 12px;
          cursor: pointer;
          font-family: 'IM Fell English', serif;
          border-radius: 4px;
          transition: all 0.3s;
          text-align: left;
        ">→ ${choice.text}</button>`;
      });
      html += "</div>";
    }

    dialogBox.innerHTML = html;

    document.querySelectorAll(".dialog-choice").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const nodeId = e.target.dataset.nodeId;
        if (nodeId === "null" || nodeId === null) {
          this.closeDialog();
        } else {
          const nextNode = this.dialogManager.goToNode(nodeId);
          if (nextNode) {
            this.displayDialogNode(nextNode);
          }
        }
      });
      btn.addEventListener("mouseover", (e) => {
        e.target.style.background = "rgba(201, 168, 76, 0.4)";
      });
      btn.addEventListener("mouseout", (e) => {
        e.target.style.background = "rgba(201, 168, 76, 0.2)";
      });
    });
  }

  closeDialog() {
    const dialogBox = document.getElementById("dialog-box");
    dialogBox.style.display = "none";
    this.dialogManager.endDialog();
  }

  checkNPCInteraction() {
    // NPCs por área (para simplificar, colocamos posições fixas)
    const npcPositions = {
      espanha: { id: "colombo", x: 350, y: 820, range: 80 },
      portugal: { id: "henrique", x: 250, y: 200, range: 80 },
      india: { id: "gama", x: 1800, y: 700, range: 80 },
    };

    const currentAreaNPC = npcPositions[this.map.currentArea?.id];
    if (currentAreaNPC) {
      const pos = this.player.getPosition();
      const distance = Math.sqrt(
        Math.pow(pos.x - currentAreaNPC.x, 2) +
          Math.pow(pos.y - currentAreaNPC.y, 2),
      );

      if (distance < currentAreaNPC.range) {
        // NPC próximo - pode interagir
        if (this.inputManager.isKeyPressed("e")) {
          this.showDialog(currentAreaNPC.id);
          this.inputManager.keys["e"] = false; // Previne spam
        }
      }
    }
  }

  gameLoop() {
    if (!this.gameRunning) return;

    const now = Date.now();
    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Atualizar player
    this.player.update(this.inputManager, deltaTime);

    // Limitar movimento às bordas do mapa
    this.player.x = Math.max(0, Math.min(this.player.x, this.map.gameWidth));
    this.player.y = Math.max(0, Math.min(this.player.y, this.map.gameHeight));

    // Atualizar área atual
    this.map.updatePlayerArea(this.player.x, this.player.y);

    // Verificar interações
    this.checkNPCInteraction();

    // Atualizar câmera
    this.updateCamera();

    // Atualizar HUD
    this.updateHUD();

    // Desenhar mapa se visível
    if (this.canvas.style.display !== "none") {
      this.drawMap();
    }

    requestAnimationFrame(() => this.gameLoop());
  }
}

// ==================== UI FUNCTIONS ====================

function openScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById("screen-" + id)?.classList.add("active");
}

function closeScreen() {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
}

// ==================== INITIALIZATION ====================

let game = null;

document.addEventListener("DOMContentLoaded", () => {
  game = new GameManager();
  console.log(
    "Jogo iniciado! Use WASD para mover, Shift para correr, E para interagir com NPCs.",
  );
});
