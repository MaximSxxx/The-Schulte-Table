document.addEventListener("DOMContentLoaded", function() {
  
  // Получение ссылок на необходимые элементы
  const startButton = document.getElementById("start-btn");
  const stopButton = document.getElementById("stop-btn");
  const gameTable = document.getElementById("game-table");
  const timerContainer = document.getElementById("timer-container");
  const timer = document.getElementById("timer");
  const playerNameInput = document.getElementById("player-name-input");
  const resultTableBody = document.querySelector("#result-table tbody");
  createOrReplaceCanvas();
  
  // Инициализация переменных
  let numbers = [];
  let currentNumber = 1;
  let startTime;
  let timerInterval;

  // Обработчик события клика по ячейке игрового поля
  function handleCellClick(event) {
    const selectedNumber = parseInt(event.target.textContent);
    if (selectedNumber === currentNumber) {
      event.target.textContent = "";
      currentNumber++;
      checkWin();
    } else {
      alert("Вы должны выбирать числа в порядке возрастания!");
    }
  }

  // Проверка условия победы
  function checkWin() {
    if (currentNumber > numbers.length) {
      clearInterval(timerInterval);
      const endTime = new Date().getTime();
      const gameTime = (endTime - startTime) / 1000;
      const playerName = playerNameInput.value.trim() || "Аноним";
      const bestResult = getBestResult(playerName);
      const currentTime = parseFloat(gameTime.toFixed(2));
      if (!bestResult || currentTime < bestResult.time) {
        if (bestResult) {
          bestResult.row.remove();
        }
        updateResultTable(playerName, currentTime);
        sortResultTable();
        saveResultsToLocalStorage();
        createOrReplaceCanvas();
      }
      showGameOverModal(playerName, currentTime);
    }
  }

  // Отображение модального окна с результатами игры
  function showGameOverModal(playerName, gameTime) {
    const playerNameElement = document.getElementById("player-name");
    const gameTimeElement = document.getElementById("game-time");
    const gameOverModal = document.getElementById("game-over-modal");
    playerNameElement.textContent = `Игрок: ${playerName}`;
    gameTimeElement.textContent = `Время: ${gameTime} сек.`;
    gameOverModal.classList.remove("hidden");
  }

  // Запуск таймера
  function startTimer() {
    startTime = new Date().getTime();
    timerInterval = setInterval(function() {
      const currentTime = new Date().getTime();
      const timePassed = (currentTime - startTime) / 1000;
      const minutes = Math.floor(timePassed / 60);
      const seconds = Math.floor(timePassed % 60);
      timer.textContent = `${formatTime(minutes)}:${formatTime(seconds)}`;
    }, 1000);
  }

  // Начало игры
  function startGame() {
    //console.log(loadResultsFromLocalStorage());
    const playerName = playerNameInput.value.trim() || "Аноним";
    numbers = generateNumbers();
    currentNumber = 1;
    gameTable.innerHTML = "";
    buildGameTable();
    addCenterDot();
    playerNameInput.disabled = true;
    startButton.classList.add("hidden");
    stopButton.classList.remove("hidden");
    timerContainer.classList.remove("hidden");
    startTimer();
  }

  // Остановка игры
  function stopGame() {
    playerNameInput.disabled = false;
    startButton.classList.remove("hidden");
    stopButton.classList.add("hidden");
    timerContainer.classList.add("hidden");
    clearInterval(timerInterval);
  }

  // Генерация случайного порядка чисел
  function generateNumbers() {
    const size = 6;
    const totalNumbers = size * size;
    const numbers = [];
    for (let i = 1; i <= totalNumbers; i++) {
      numbers.push(i);
    }
    shuffleArray(numbers);
    return numbers;
  }

  // Перемешивание элементов в массиве
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Создание игрового поля
  function buildGameTable() {
    const size = 6;
    for (let i = 0; i < size; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < size; j++) {
        const cell = document.createElement("td");
        cell.textContent = numbers[i * size + j];
        cell.addEventListener("click", handleCellClick);
        row.appendChild(cell);
      }
      gameTable.appendChild(row);
    }
  }

  // Добавление центральной точки на игровое поле
  function addCenterDot() {
    const centerDot = document.createElement("div");
    centerDot.classList.add("center-dot");
    gameTable.appendChild(centerDot);
  }

  // Форматирование времени (добавление ведущего нуля)
  function formatTime(time) {
    return time < 10 ? `0${time}` : time;
  }

  // Обновление таблицы результатов
  function updateResultTable(playerName, gameTime) {
    const row = document.createElement("tr");
    const placeCell = document.createElement("td");
    const nameCell = document.createElement("td");
    const timeCell = document.createElement("td");
    placeCell.textContent = getPlace();
    nameCell.textContent = playerName;
    timeCell.textContent = `${gameTime} сек.`;
    row.appendChild(placeCell);
    row.appendChild(nameCell);
    row.appendChild(timeCell);
    resultTableBody.appendChild(row);
  }

  // Получение текущей позиции в таблице результатов
  function getPlace() {
    const rows = resultTableBody.querySelectorAll("tr");
    if (rows.length === 0) {
      return 1;
    } else {
      const lastRow = rows[rows.length - 1];
      const lastPlace = parseInt(lastRow.firstElementChild.textContent);
      return lastPlace + 1;
    }
  }

  // Сортировка таблицы результатов
  function sortResultTable() {
    const rows = resultTableBody.querySelectorAll("tr");
    const sortedRows = Array.from(rows).sort((a, b) => {
      const timeA = parseFloat(a.lastElementChild.textContent);
      const timeB = parseFloat(b.lastElementChild.textContent);
      return timeA - timeB;
    });
    resultTableBody.innerHTML = "";
    sortedRows.forEach((row, index) => {
      row.firstElementChild.textContent = index + 1;
      resultTableBody.appendChild(row);
    });
  }

  // Получение лучшего результата для указанного игрока
  function getBestResult(playerName) {
    const rows = resultTableBody.querySelectorAll("tr");
    for (let i = 0; i < rows.length; i++) {
      const nameCell = rows[i].querySelector("td:nth-child(2)");
      if (nameCell.textContent === playerName) {
        return {
          row: rows[i],
          time: parseFloat(rows[i].lastElementChild.textContent)
        };
      }
    }
    return null;
  }

  // Сохранение результатов в локальное хранилище
  function saveResultsToLocalStorage() {
    const rows = resultTableBody.querySelectorAll("tr");
    const results = [];
    rows.forEach(row => {
      const playerName = row.querySelector("td:nth-child(2)").textContent;
      const time = parseFloat(row.lastElementChild.textContent);
      results.push({ playerName, time });
    });
    localStorage.setItem("results", JSON.stringify(results));
  }

  // Загрузка результатов из локального хранилища
  function loadResultsFromLocalStorage() {
    const results = JSON.parse(localStorage.getItem("results"));
    if (results) {
      results.forEach(result => {
        updateResultTable(result.playerName, result.time);
      });
      sortResultTable();
    }
  }

  // Назначение обработчиков событий
  startButton.addEventListener("click", startGame);
  stopButton.addEventListener("click", stopGame);
  document.getElementById("close-modal-btn").addEventListener("click", function() {
  document.getElementById("game-over-modal").classList.add("hidden");
  });

  // Загрузка результатов из локального хранилища при запуске приложения
  loadResultsFromLocalStorage();
});

class CanvasPointer {
  static renderChart(canvas, ctx, items) {
      let MAX_PERCENTAGE = items.at(-1).value;
      let Gap = {
          HORIZONTAL: 50,
          VERTICAL: 30
      }
      let BarCoordinate = {
          INITIAL_X: 80,
          INITIAL_Y: 220
      }
      let BarSize = {
          MAX_HEIGHT: 200,
          WIDTH: 30
      };
      let LabelCoordinate = {
          INITIAL_X: 30,
          INITIAL_Y: 100
      }
      let Font = {
          SIZE: `12px`,
          FAMILY: `Tahoma`
      };
      // Очищаем всю область холста
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.canvas.width  = '500';
      ctx.canvas.height = '300';

      //рисуем горизонталньые полоски
      let steps = 5;
      let heightStep = Math.floor(ctx.canvas.height / steps);
      let percentStep = Math.floor(MAX_PERCENTAGE / steps);
      ctx.fillStyle = '#000';
      ctx.font = `${Font.SIZE} ${Font.FAMILY}`;
      let currentHeight = 0;
      let currentPercent = 0;
      let startX = 20;
      for (; currentPercent <= MAX_PERCENTAGE; currentPercent+=percentStep, currentHeight+=heightStep) {
          const barHeight = (currentPercent * BarSize.MAX_HEIGHT) / MAX_PERCENTAGE;
          let currentY = BarCoordinate.INITIAL_Y-barHeight;
          ctx.fillRect(startX, currentY, ctx.canvas.width, -2);
          ctx.fillText(currentPercent, startX, currentY-4);
      }
      //Текст попытки
      ctx.translate(0, canvas.height);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Количество секунд', canvas.height/2.3, startX-5);
      ctx.rotate(Math.PI / 2);
      ctx.translate(0, -canvas.height);
      //ctx.restore();
      //
      let currentBarX = BarCoordinate.INITIAL_X;
      let currentLabelY = LabelCoordinate.INITIAL_Y;
      const gapBetweenBars = BarSize.WIDTH + Gap.HORIZONTAL;
      for (const item of items) {
          const barHeight = (item.value * BarSize.MAX_HEIGHT) / MAX_PERCENTAGE;
          ctx.fillStyle = item.color;
          ctx.font = `${Font.SIZE} ${Font.FAMILY}`;
          ctx.save();
          ctx.translate(0, canvas.height);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(item.name.toUpperCase(), LabelCoordinate.INITIAL_X, currentLabelY);
          ctx.restore();//otmena smeщения и поворота
          ctx.fillRect(currentBarX, BarCoordinate.INITIAL_Y, BarSize.WIDTH, -barHeight);
          currentBarX += gapBetweenBars;
          currentLabelY += gapBetweenBars;
      }
  }
  
  static getData(inputElements){
      return Array.from(inputElements).map((input, index) => ({
        name: input.playerName,
        value: input.time,
        color: `#9e291d`
      })).sort((a, b) => a.time-b.time).slice(0, 5);
  };

  static getDiagramNode() {
      let currentCanvasNode = document.createElement('canvas');
      const ctx = currentCanvasNode.getContext(`2d`);
      if (localStorage['results'] == undefined)
        return '';
      let a = JSON.parse(localStorage['results']);
      if (a == undefined || a == null)
          return '';
      let elements = this.getData(a);
      this.renderChart(currentCanvasNode, ctx, elements);
      //-------------
      return currentCanvasNode;
  }
}

function createOrReplaceCanvas(){
  let lastCanvasNode = document.querySelector('.my_class');
  if (lastCanvasNode != null)
    lastCanvasNode.remove();

  let canvasNode = CanvasPointer.getDiagramNode();
  if (canvasNode !== '')
    canvasNode.classList.add('my_class');
  document.body.append(canvasNode);
}
