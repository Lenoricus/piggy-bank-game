const pig = document.getElementById('pig');
const permissionButton = document.getElementById('permissionButton');
const objectsContainer = document.getElementById('objects-container');
const coinCounter = document.getElementById('coin-counter');
const lifeCounter = document.getElementById('life-counter');

let coinsCollected = 0;
let lives = 5;
let gameInterval;

// Функция для создания падающих объектов
function createObject(type) {
    const object = document.createElement('div');
    object.classList.add('object', type);
    object.style.left = `${Math.random() * (window.innerWidth - 30)}px`;
    objectsContainer.appendChild(object);

    // Анимация падения объекта
    let fallInterval = setInterval(() => {
        const top = parseInt(object.style.top) || 0;
        object.style.top = `${top + 2}px`;

        // Проверка столкновения с свинкой
        if (checkCollision(pig, object)) {
            clearInterval(fallInterval);
            object.remove();

            if (type === 'coin') {
                coinsCollected++;
                coinCounter.textContent = coinsCollected;
            } else if (type === 'hammer') {
                lives--;
                lifeCounter.textContent = lives;

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

// Функция для завершения игры
function endGame() {
    clearInterval(gameInterval);
    alert(`Игра окончена! Вы собрали ${coinsCollected} монеток.`);
}

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

function handleOrientation(event) {
    const gamma = event.gamma; // Наклон влево/вправо
    const pig = document.getElementById('pig');
    const pigX = (gamma + 90) * (window.innerWidth / 180); // Преобразуем наклон в координаты
    pig.style.left = `${pigX}px`;
}

// Запрашиваем разрешение при загрузке страницы или по клику
window.addEventListener('load', () => {
    permissionButton.onclick = requestGyroPermission;
});

const desktopMessage = document.getElementById('desktop-message');
const gameContainer = document.getElementById('game-container');

// Функция для проверки ширины экрана
function checkScreenWidth() {
    if (window.innerWidth > 390) {
        // Показываем сообщение и скрываем игру
        desktopMessage.style.display = 'block';
        gameContainer.style.display = 'none';
    } else {
        // Показываем игру и скрываем сообщение
        desktopMessage.style.display = 'none';
        gameContainer.style.display = 'block';
    }
}

// Проверяем ширину экрана при загрузке страницы
checkScreenWidth();

// Проверяем ширину экрана при изменении размера окна
window.addEventListener('resize', checkScreenWidth);

// Запуск игры
function startGame() {
    gameInterval = setInterval(() => {
        const objectType = Math.random() > 0.2 ? 'coin' : 'hammer';
        createObject(objectType);
    }, 1000);
}

startGame();