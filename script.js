const pig = document.getElementById('pig');
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

// Запуск игры
function startGame() {
    gameInterval = setInterval(() => {
        const objectType = Math.random() > 0.2 ? 'coin' : 'hammer';
        createObject(objectType);
    }, 1000);
}

function requestGyroPermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    console.log("Доступ к гироскопу разрешен");
                } else {
                    alert("Для игры необходим доступ к гироскопу. Пожалуйста, предоставьте разрешение.");
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener('deviceorientation', handleOrientation);
        console.log("Запрос разрешения не требуется");
    }
}

function handleOrientation(event) {
    const gamma = event.gamma; // Наклон влево/вправо
    const pigX = parseInt(pig.style.left) || (window.innerWidth / 2 - 30);

    let newX = pigX + gamma * 2;

    // Ограничение движения свинки в пределах экрана
    if (newX < 0) newX = 0;
    if (newX > window.innerWidth - 60) newX = window.innerWidth - 60;

    pig.style.left = `${newX}px`;
}

// Запрашиваем разрешение при загрузке страницы или по клику
window.addEventListener('load', () => {
    const button = document.createElement('button');
    button.textContent = "Разрешить доступ к гироскопу";
    button.style.position = "fixed";
    button.style.top = "20px";
    button.style.left = "50%";
    button.style.transform = "translateX(-50%)";
    button.style.padding = "10px 20px";
    button.style.fontSize = "16px";
    button.style.zIndex = "1000";
    button.onclick = requestGyroPermission;
    document.body.appendChild(button);
});

startGame();