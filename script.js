const pig = document.getElementById('pig');
const permissionButton = document.getElementById('permissionButton');
const objectsContainer = document.getElementById('objects-container');
const desktopMessage = document.getElementById('desktop-message');
const gameContainer = document.getElementById('game-container');
const livesCounter = document.getElementById('lives-container');
const coinCounter = document.getElementById('coin-counter');
const zerosElement = document.querySelector('.zeros');

let coinsCollected = 0;
let lives = 5;
let gameInterval;

// Функция для обновления отображения жизней
function updateLives() {
    // Очищаем контейнер
    livesCounter.innerHTML = '';

    // Добавляем иконки сердечек
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('img');
        if (i < lives) {
            heart.src = 'img/heart-fill.png'; // Полное сердечко
        } else {
            heart.src = 'img/heart-stroke.png'; // Пустое сердечко
        }
        livesCounter.appendChild(heart);
    }
}

// Функция для обновления счётчика
function updateCoinCounter() {
    // Форматируем число так, чтобы оно всегда было 7 цифр (например, 0000005)
    const formattedCoins = String(coinsCollected).padStart(7, '0');

    // Находим индекс первой не нулевой цифры
    const firstNonZeroIndex = formattedCoins.split('').findIndex((char) => char !== '0');

    // Если все цифры нули (например, 0000000), то белым будет только последний ноль
    const zeros = formattedCoins.slice(0, firstNonZeroIndex === -1 ? 6 : firstNonZeroIndex); // Серые нули
    const coins = formattedCoins.slice(firstNonZeroIndex === -1 ? 6 : firstNonZeroIndex); // Белые цифры

    // Обновляем текст в элементах
    zerosElement.textContent = zeros; // Серые нули
    coinCounter.textContent = coins; // Белые цифры
}

// Функция для проверки столкновения
function checkCollision(pig, object) {
    const pigRect = pig.getBoundingClientRect();
    const objectRect = object.getBoundingClientRect();

    return !(
        pigRect.top > objectRect.bottom ||
        pigRect.bottom < objectRect.top ||
        pigRect.left > objectRect.right ||
        pigRect.right < objectRect.left
    );
}

// Запрос доступа к гироскопу
function requestGyroPermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Запрашиваем разрешение
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    // Разрешение предоставлено
                    window.addEventListener('deviceorientation', handleOrientation);
                    alert("Доступ к гироскопу разрешен");
                } else {
                    // Разрешение не предоставлено
                    alert("Доступ к гироскопу запрещен");
                }
            })
            .catch(console.error);
    } else {
        // Если функция requestPermission недоступна (например, на Android или старых iOS)
        window.addEventListener('deviceorientation', handleOrientation);
        alert("Запрос разрешения не требуется");
    }
}

// Движение свинки
function handleOrientation(event) {
    const gamma = event.gamma; // Наклон влево/вправо
    const pig = document.getElementById('pig');
    const pigX = (gamma + 90) * (window.innerWidth / 180); // Преобразуем наклон в координаты
    pig.style.left = `${pigX}px`;
}

// Запуск игры
function startGame() {
    gameInterval = setInterval(() => {
        const objectType = Math.random() > 0.2 ? 'coin' : 'hammer';
        createObject(objectType);
    }, 1000);
}

// Функция для завершения игры
function endGame() {
    clearInterval(gameInterval);
    alert(`Игра окончена! Вы собрали ${coinsCollected} монеток.`);
    lives = 5;
    updateLives();
    coinsCollected = 0;
    updateCoinCounter();
    startGame()
}

function createObject(type) {
    const object = document.createElement('div');
    object.classList.add('object', type);

    // Если объект — монетка, задаем случайный цвет, размер и поворот
    if (type === 'coin') {
        const coinImages = ['img/coin-green.png', 'img/coin-blue.png', 'img/coin-purple.png', 'img/coin-yellow.png'];
        const coinSizes = [{ width: 20, height: 20 }, { width: 28, height: 28 }, { width: 36, height: 36 }];
        const randomImage = coinImages[Math.floor(Math.random() * coinImages.length)];
        const randomSize = coinSizes[Math.floor(Math.random() * coinSizes.length)];
        const randomRotation = Math.floor(Math.random() * 360);

        object.style.backgroundImage = `url('${randomImage}')`;
        object.style.width = `${randomSize.width}px`;
        object.style.height = `${randomSize.height}px`;
        object.style.backgroundSize = 'cover';
        object.style.transform = `rotate(${randomRotation}deg)`;
    }

    // Задаем начальную позицию объекта
    object.style.left = `${Math.random() * (window.innerWidth - 30)}px`;
    object.style.top = '0px';
    objectsContainer.appendChild(object);

    // Определяем скорость падения
    const fallSpeed = type === 'hammer' ? 4 : 2; // Молотки падают быстрее (4px/кадр), монетки — медленнее (2px/кадр)

    // Анимация падения объекта
    let fallInterval = setInterval(() => {
        const top = parseInt(object.style.top) || 0;
        object.style.top = `${top + fallSpeed}px`;

        // Проверка столкновения с игроком
        if (checkCollision(pig, object)) {
            clearInterval(fallInterval);
            object.remove();

            if (type === 'coin') {
                coinsCollected++;
                updateCoinCounter();
            } else if (type === 'hammer') {
                lives--;
                updateLives();

                if (lives === 0) {
                    endGame();
                }
            }
        }

        // Удаление объекта, если он упал за пределы экрана
        if (top > window.innerHeight) {
            clearInterval(fallInterval);
            object.remove();
        }
    }, 20);
}

function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Функция для проверки ширины экрана
function checkScreenWidth() {
    if (!isMobileDevice()) {
        // Показываем сообщение и скрываем игру
        desktopMessage.style.display = 'block';
        gameContainer.style.display = 'none';
    } else {
        // Показываем игру и скрываем сообщение
        desktopMessage.style.display = 'none';
        gameContainer.style.display = 'block';
        updateLives();
        updateCoinCounter();
        startGame();
    }
}

// Проверяем ширину экрана при загрузке страницы
checkScreenWidth();

// Запрашиваем разрешение при загрузке страницы или по клику
window.addEventListener('load', () => {
    permissionButton.onclick = requestGyroPermission;
});

// Проверяем ширину экрана при изменении размера окна
window.addEventListener('resize', checkScreenWidth);