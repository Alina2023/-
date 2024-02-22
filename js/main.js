// Объявление переменных для хранения элементов сцены
var container;
var camera, scene, renderer;
var imagedata;

// Инициализация сцены
function init() {
    console.log("Initializing...");

    // Получение контейнера из DOM
    container = document.getElementById('container');
    if (!container) {
        console.error("Container element not found!"); // Вывод ошибки, если контейнер не найден
        return;
    }

    // Создание сцены
    scene = new THREE.Scene();
    console.log("Scene created.");

    // Создание камеры с параметрами: угол обзора, соотношение сторон, ближняя и дальняя плоскости отсечения
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 100, 100); // Установка позиции камеры
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Направление камеры на точку (0, 0, 0)
    console.log("Camera created.");

    // Создание рендерера с параметрами: сглаживание, размеры окна
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight); // Установка размеров рендерера
    renderer.setClearColor(0xffffff, 1); // Установка цвета фона
    container.appendChild(renderer.domElement); // Добавление элемента рендеринга в контейнер
    console.log("Renderer created.");

    // Обработка изменения размеров окна
    window.addEventListener('resize', onWindowResize, false);

    // Добавление источника света
    var spotlight = new THREE.PointLight(0xffffff);
    spotlight.position.set(100, 100, 100);
    scene.add(spotlight);

    // Загрузка текстур и создание ландшафта
    var loader = new THREE.TextureLoader();
    loader.load('js/libs/pics/plateau.jpg', function(heightmapTexture) { // Загрузка текстуры для карты высот
        loader.load('js/libs/pics/grasstile.jpg', function(texture) { // Загрузка текстуры для поверхности ландшафта
            // Создание Canvas для работы с изображением высот
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = heightmapTexture.image.width;
            canvas.height = heightmapTexture.image.height;
            context.drawImage(heightmapTexture.image, 0, 0); // Отрисовка изображения высот на Canvas
            // Получение данных пикселей изображения высот
            imagedata = context.getImageData(0, 0, heightmapTexture.image.width, heightmapTexture.image.height);
            
            // Создание ландшафта с использованием текстуры
            createTerrain(texture);
        });
    });

    // Запуск анимации
    animate();
}

// Создание ландшафта на основе изображения высот
function createTerrain(texture) {
    console.log("Creating terrain...");
    
    var widthSegments = imagedata.width;
    var heightSegments = imagedata.height;
    // Создание геометрии ландшафта с параметрами: ширина, высота, глубина, количество сегментов
    var geometry = new THREE.BoxGeometry(100, 10, 100, widthSegments - 1, 1, heightSegments - 1);
    var vertices = geometry.attributes.position.array; // Получение массива вершин геометрии
    // Установка высот вершин ландшафта на основе данных изображения высот
    for (var i = 0; i < vertices.length; i += 3) {
        var x = (i / 3) % widthSegments;
        var y = Math.floor((i / 3) / widthSegments);
        var heightValue = getPixel(imagedata, x, y) / 255 * 10; // Получение значения высоты изображения
        vertices[i + 1] = heightValue; // Установка значения высоты для каждой вершины
    }

    geometry.computeVertexNormals(); // Вычисление нормалей для освещения
    // Создание материала для ландшафта с текстурой
    var material = new THREE.MeshLambertMaterial({ map: texture });
    var terrainMesh = new THREE.Mesh(geometry, material);
    scene.add(terrainMesh); // Добавление ландшафта на сцену
}

// Получение значения пикселя изображения
function getPixel(imagedata, x, y) {
    var position = (x + imagedata.width * y) * 4;
    return imagedata.data[position]; // Возвращение значения пикселя изображения по заданным координатам
}

// Обработка изменения размеров окна браузера
function onWindowResize() {
    console.log("Window resize event.");
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // Обновление матрицы проекции камеры
    renderer.setSize(window.innerWidth, window.innerHeight); // Обновление размеров рендерера
}

// Функция анимации
function animate() {
    requestAnimationFrame(animate); // Запуск анимации через requestAnimationFrame
    render(); // Вызов функции рендеринга
}

// Функция рендеринга сцены
function render() {
    renderer.render(scene, camera); // Выполнение рендеринга сцены
}

// Инициализация приложения
init();