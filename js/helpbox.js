helpbutton = document.getElementById("help");
helpbox = document.getElementById("helpbox");
crossbutton = document.getElementById("exit");
helppage = document.getElementById("helppage");
prev = document.getElementById("prev");
next = document.getElementById("next");
pagecount = document.getElementById("page_count");
let pagecounter = 1;

function help () {
    if (pagecounter > 9) {
        pagecounter = 1;
    }
    if (pagecounter < 1) {
        pagecounter = 9;
    }
    if (pagecounter == 1) {
        helppage.innerHTML =
            '<div class="instruction"> \
                <p class="help_text">\
                    Инструмент <b>"Курсор"</b> позволяет выбирать созданные объекты. \
                    Чтобы выбрать объект, просто кликните по нему. \
                </p> \
                <button title="Курсор" class="help_button" style="background-image: url(img/cursor.svg)" disabled></button> \
            </div> \
            <div class="instruction"> \
                <p class="help_text"> \
                    Инструмент <b>"Рука"</b> позволяет менять расположение рабочего пространства. \
                    Чтобы сделать это, нажмите и удерживайте левую кнопку мыши, перемещая её в нужном направлении. \
                </p> \
                <button title="Рука" class="help_button" style="background-image: url(img/hand.svg)" disabled></button> \
            </div> \
            <div class="instruction"> \
                <p class="help_text"> \
                    Инструмент <b>"Лупа"</b> позволяет приблизить/отдалить изображение рабочего пространства. \
                    Чтобы приблизить изображение вокруг курсора, нажмите левую кнопку мыши; \
                    чтобы отдалить его, зажмите клавишу <strong>Ctrl</strong> и нажмите левую кнопку мыши. \
                </p> \
                <button title="Лупа" class="help_button" style="background-image: url(img/scale.svg)" disabled></button> \
            </div>';
    }
    else if (pagecounter == 2) {
        helppage.innerHTML = 
            '<div class="instruction"> \
                <p class="help_text">\
                    Инструмент <b>"Карандаш"</b> позволяет рисовать кривую линию произвольной формы. \
                    Чтобы нарисовать кривую линию, водите мышью, удерживая её левую кнопку. \
                </p> \
                <button title="Карандаш" class="help_button" style="background-image: url(img/pencil.svg)" disabled></button> \
            </div> \
            <div class="instruction"> \
                <p class="help_text"> \
                    Инструмент <b>"Линия"</b> позволяет рисовать прямую линию. \
                    Нажмите левую кнопку мыши, чтобы установить первую точку линии, затем удерживайте её, проводя мышью до нужного места, и отпустите, чтобы установить вторую точку и зафиксировать линию. \
                </p> \
                <button title="Линия" class="help_button" style="background-image: url(img/line.svg)" disabled></button> \
            </div>';
    } else if (pagecounter == 3) {
        helppage.innerHTML =
            '<div class="instruction"> \
                <p class="help_text">\
                    Наведите мышь на кнопку <b>"Фигуры"</b>, чтобы показать кнопки фигур. \
                </p> \
                <button title="Фигуры" class="help_button" style="background-image: url(img/figures.svg)" disabled></button> \
            </div> \
            <div class="instruction"> \
                <p class="help_text"> \
                    Фигура <b>"Прямоугольник"</b> рисуется через зажатие левой кнопки мыши. \
                    Зажмите <strong>Shift</strong> во время создания прямоугольника, чтобы нарисовать квадрат. \
                    Форму созданного прямоугольника можно изменять с помощью инструмента <b>Курсор</b>, зажимая ЛКМ на белых точках, находящихся на его сторонах, и двигая их. \
                </p> \
                <button title="Прямоугольник" class="help_button" style="background-image: url(img/rectangle.svg)" disabled></button> \
            </div> \
            <div class="instruction"> \
                <p class="help_text full_width"> \
                    Также прямоугольник можно вращать, перемещая белую точку, находящуюся вне прямоугольника. \
                    После создания прямоугольника на верхней панели появятся его характеристики - координаты, ширина, высота, угол наклона и уровень скруглённости углов. \
                    Все эти характеристики можно менять с помощью стрелок, расположенных справа от значений характеристик. \
                </p> \
            </div>';
    } else if (pagecounter == 4) {
        helppage.innerHTML =
            '<div class="instruction"> \
                <p class="help_text">\
                    Фигура <b>"Эллипс"</b> рисуется аналогично фигуре <b>"Прямоугольник"</b>. \
                    При зажатии кнопки <strong>Shift</strong> во время создания эллипса будет рисоваться круг. \
                </p> \
                <button title="Эллипс" class="help_button" style="background-image: url(img/ellipse.svg)" disabled></button> \
            </div> \
            <div class="instruction"> \
                <p class="help_text">\
                    Фигура <b>"Правильный многоугольник"</b> при создании может менять размер, угол наклона и количество вершин. \
                    Чтобы зафиксировать радиус создаваемого правильного многоугольника, зажмите <strong>Ctrl</strong>, а чтобы зафиксировать его угол наклона, зажмите <strong>Alt</strong>. \
                    При зажатии кнопки <strong>Shift</strong> угол наклона создаваемого правильного многоугольника зафиксируется таким образом, что его нижняя сторона будет направлена горизонтально. \
                </p> \
                <button title="Правильный многоугольник" class="help_button" style="background-image: url(img/polygon.svg)" disabled></button> \
            </div>';
    } else if (pagecounter == 5) {
        helppage.innerHTML = 
            '<div class="instruction"> \
                <p class="help_text full_width"> \
                    -Текст про звёздчатый многоугольник и пентаграмму- \
                </p> \
            </div>';
    } else if (pagecounter == 6) {
        helppage.innerHTML =
            '<div class="instruction"> \
                <p class="help_text full_width"> \
                    -Текст про текст- \
                </p> \
            </div>';
    } else if (pagecounter == 7) {
        helppage.innerHTML =
            '<div class="instruction"> \
                <p class="help_text">\
                    Инструмент <b>"Перо"</b> рисует фигуры произвольной формы. \
                    При зажатии <strong>Shift</strong> во время использования пера углы произвольной фигуры будут делиться нацело на 45 градусов. \
                </p> \
                <button title="Перо" class="help_button" style="background-image: url(img/path_tool.svg)" disabled></button> \
            </div> \
            <div class="instruction"> \
                <p class="help_text full_width"> \
                    После создания произвольной фигуры её вершины можно перемещать зажатием левой кнопки мыши с помощью инструмента <b>"Курсор"</b>, а саму фигуру можно вращать за кружок, расположенный чуть выше центра фигуры. \
                    Также с его помощью можно удалять вершины, нажимая по ним правой кнопкой мыши. \
                </p> \
            </div> \
            <div class="instruction"> \
                <p class="help_text">\
                    Инструмент <b>"Ластик"</b> удаляет элементы. \
                    Чтобы удалить элемент, проведите по нему ластиком, зажав левую кнопку мыши. \
                </p> \
                <button title="Ластик" class="help_button" style="background-image: url(img/eraser.svg)" disabled></button> \
            </div>';
    } else if (pagecounter == 8) {
        helppage.innerHTML = 
            '<div class="instruction big_height"> \
                <p class="help_text full_width"> \
                    Правая панель позволяет изменять различные характеристики активных элементов, а также работать со слоями. \
                    Перечислим её функции сверху вниз: <br> \
                    1)Изменение контура. Позволяет менять цвет и прозрачность контура. Также может полностью убрать контур. <br> \
                    2)Изменение заливки. Меняет цвет и прозрачность заливки, может полностью её убрать. <br> \
                    3)Изменение толщины контура (измеряется в пикселях). <br> \
                    4)Изменение стиля контура элемента, изменение стиля углов элемента, изменение стиля концов линий (справа налево). <br> \
                    5)Панель работы со слоями. \
                    Есть возможность создавать пустой слой, объединять слои, менять слои местами, менять их уровень яркости, делать слой невидимым, а также переименовывать, удалять и дублировать слои. \
                </p> \
            </div> \
            <div class="instruction"> \
                <p class="help_text">\
                    Инструмент <b>"Заливка"</b> меняет заливку элемента или заднего фона на тот цвет, что указан на правой панели. \
                </p> \
                <button title="Заливка" class="help_button" style="background-image: url(img/fill.svg)" disabled></button> \
            </div>';
    } else if (pagecounter == 9) {
        helppage.innerHTML = 
            '<div class="instruction full_height"> \
                <p class="help_text full_width">\
                    На верхней панели справа от логотипа расположены следующие функции (справа налево): <br> \
                    - Меню <b>"Файл"</b>, позволяющее создавать новый документ, открывать svg-изображение и сохранять файл в формате svg или png. <br> \
                    - Меню <b>"Редактировать"</b>, позволяющее вырезать, копировать, вставлять и удалять выбранные элементы. <br> \
                    - Меню <b>"Вид"</b>, позволяющее включать и выключать линейки и сетку, а также увеличивать и уменьшать масштаб изображения. <br> \
                    - Это меню. <br> \
                    - Кнопки <b>"Отменить"</b> и <b>"Вернуть"</b>, позволяющие отменять действия и возвращать их. <br> \
                    - Появляющиеся при выборе элементов кнопки <b>"На передний план"</b> и <b>"На задний план"</b>, перемещающие элементы на передний или задний план в пределах своего слоя. \
                </p> \
            </div>';
    }
    pagecount.innerHTML = 'Страницы: ' + pagecounter + '/9';
}

helpbutton.onclick = function () {
    helpbox.style.display = "block";
    setTimeout(function(){helpbox.style.opacity = 1;}, 10);
    help();
}

crossbutton.onclick = function () {
    helpbox.style.opacity = 0;
    setTimeout(function(){helpbox.style.display = "none";}, 500);
}

prev.onclick = function () {
    pagecounter--;
    help();
}

next.onclick = function () {
    pagecounter++;
    help();
}
