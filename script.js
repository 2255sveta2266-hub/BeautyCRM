// скрипт для сайта BeautyCRM


// константы и функции-помощники

// ключ, под которым данные лежат в localStorage (v2 чтобы не мешали старые данные)
const STORAGE_KEY = "beautycrm-data-v2";
const WORK_START = "09:00";   // начало рабочего дня
const WORK_END = "21:00";     // конец рабочего дня

// статусы записи и классы для них в css
const STATUSES = ["Подтверждена", "Ожидает", "Завершена", "Отменена"];
const STATUS_CLASS = {
    "Подтверждена": "confirmed",
    "Ожидает": "pending",
    "Завершена": "done",
    "Отменена": "cancelled"
};

// чтобы не писать каждый раз document.querySelector
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// переводим дату в строку вида 2026-10-26
function dateKey(date) {
    const year = date.getFullYear();
    // padStart добавляет ноль спереди, чтобы было 05, а не 5
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// обратно из строки в дату
function parseDate(value) {
    // split делит строку по дефису, map(Number) превращает кусочки в числа
    const [year, month, day] = value.split("-").map(Number);
    // месяцы в js считаются с нуля, поэтому отнимаем 1
    return new Date(year, month - 1, day);
}

// выводим дату по-русски
function formatDate(date, options = { day: "numeric", month: "long", year: "numeric" }) {
    // Intl.DateTimeFormat сам подставляет русские названия месяцев
    return new Intl.DateTimeFormat("ru-RU", options).format(date);
}

// заменяем опасные символы, чтобы пользователь не мог вставить свой html
function escapeHtml(value) {
    // каждый опасный символ меняем на безопасный код, например < на &lt;
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
}

// склонение слов: 1 запись, 2 записи, 5 записей
function pluralize(number, one, few, many) {
    // смотрим на последние цифры числа, от них зависит окончание
    const mod100 = number % 100;
    const mod10 = number % 10;
    if (mod100 >= 11 && mod100 <= 14) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
}

// делаем id для нового объекта
function makeId(prefix) {
    // время + случайные символы, чтобы id не повторялись
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// цена с пробелами и рублём: 2500 -> 2 500 ₽
const money = (value) => `${value.toLocaleString("ru-RU")} ₽`;
// то, что человек написал в поиске сверху (маленькими буквами)
const getQuery = () => $("#globalSearch").value.trim().toLocaleLowerCase("ru-RU");


// данные

// начальные данные салона - массивы объектов
// каталог услуг и мастера есть сразу, клиентов и записи добавляем уже на сайте
function createStartData() {
    return {
        clients: [],
        services: [
            { id: "s1", name: "Женская стрижка", price: 2500, duration: 60 },
            { id: "s2", name: "Окрашивание волос", price: 6500, duration: 150 },
            { id: "s3", name: "Маникюр с покрытием", price: 2200, duration: 90 },
            { id: "s4", name: "Педикюр", price: 2800, duration: 90 },
            { id: "s5", name: "Макияж", price: 3000, duration: 60 },
            { id: "s6", name: "Чистка лица", price: 3500, duration: 75 }
        ],
        masters: [
            { id: "m1", name: "Виктория Лебедева", specialty: "Парикмахер-стилист" },
            { id: "m2", name: "Алина Орлова", specialty: "Мастер маникюра и педикюра" },
            { id: "m3", name: "Софья Мартынова", specialty: "Визажист" },
            { id: "m4", name: "Наталья Белова", specialty: "Косметолог" }
        ],
        appointments: []
    };
}

// берём данные из localStorage, если там ничего нет - начальные данные
function loadData() {
    try {
        // JSON.parse превращает строку из localStorage обратно в объекты
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        // проверяем, что данные нормальные, а не мусор
        if (saved && Array.isArray(saved.clients) && Array.isArray(saved.appointments)) return saved;
    } catch (error) {
        console.warn("Не удалось прочитать сохранённые данные:", error);
    }
    return createStartData();
}

// сохраняем данные в браузер
function saveData() {
    try {
        // JSON.stringify превращает объекты в строку, потому что localStorage хранит только строки
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn("Не удалось сохранить данные:", error);
    }
}

// все данные сайта
let data = loadData();

// настройки интерфейса (в localStorage не сохраняем)
const ui = {
    // какой день выбран в календаре
    selectedDate: new Date(),
    // какой месяц сейчас показан в календаре
    visibleMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    formType: null,          // какая форма открыта
    editId: null,            // id того, что редактируем (null - значит создаём новое)
    statusFilter: "all",     // какой фильтр выбран
    sortOrder: "asc"         // как сортируем записи
};

// функции чтобы найти клиента, услугу или мастера по id
const byId = (list, id) => list.find((item) => item.id === id);
// у записи хранятся только id клиента, услуги и мастера, а сами объекты находим этими функциями
const clientOf = (appointment) => byId(data.clients, appointment.clientId);
const serviceOf = (appointment) => byId(data.services, appointment.serviceId);
const masterOf = (appointment) => byId(data.masters, appointment.masterId);
// цена записи = цена её услуги; ?. нужен, чтобы не было ошибки, если услугу удалили
const priceOf = (appointment) => serviceOf(appointment)?.price || 0;
// складываем цены всех записей из списка
const sumPrices = (list) => list.reduce((sum, item) => sum + priceOf(item), 0);
// сравниваем записи по дате и времени, нужно для сортировки
const compareByDate = (a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);

// сохраняем и обновляем страницу, вызываем после любого изменения
function commit() {
    saveData();
    updateDashboard();
}


// вывод данных на страницу

function updateDashboard() {
    // сегодняшняя дата в виде строки
    const today = dateKey(new Date());
    const todayCount = data.appointments.filter((a) => a.date === today && a.status !== "Отменена").length;

    // цифры в карточках сверху
    $("#clientsCount").textContent = data.clients.length;
    $("#appointmentsCount").textContent = todayCount;
    $("#mastersCount").textContent = data.masters.length;
    $("#servicesCount").textContent = data.services.length;

    // в приветствии пишем ближайшую запись
    const next = getNextAppointment();
    $("#welcomeSummary").textContent = next
        ? `Ближайший визит: ${formatDate(parseDate(next.date), { day: "numeric", month: "long" })} в ${next.time}, ${clientOf(next)?.name || "клиент"}.`
        : "Ближайших записей нет. Создай новую запись, чтобы заполнить расписание.";

    // перерисовываем все части страницы заново
    renderAppointments();
    renderClients();
    renderMasters();
    renderServices();
    renderFinances();
    renderAnalytics();
    renderCalendar();
    updateSelectedDayInfo();
}

// ищем ближайшую запись, которая ещё не прошла
function getNextAppointment() {
    const now = new Date();
    // берём подтверждённые и ожидающие записи, которые ещё впереди, и после сортировки первую
    return data.appointments
        .filter((a) => (a.status === "Подтверждена" || a.status === "Ожидает") && new Date(`${a.date}T${a.time}`) >= now)
        .sort(compareByDate)[0];
}

// показываем или прячем надпись, когда список пустой
function toggleEmpty(selector, isEmpty, message) {
    const element = $(selector);
    // toggle с true добавляет класс hidden, с false убирает
    element.classList.toggle("hidden", !isEmpty);
    element.textContent = message;
}

// таблица записей (поиск, фильтр и сортировка)
function renderAppointments() {
    // что написано в поиске
    const query = getQuery();
    const list = data.appointments
        // сначала оставляем записи с нужным статусом, потом ищем по тексту
        .filter((a) => ui.statusFilter === "all" || a.status === ui.statusFilter)
        .filter((a) => {
            const text = `${clientOf(a)?.name || ""} ${serviceOf(a)?.name || ""} ${masterOf(a)?.name || ""} ${a.status}`;
            return text.toLocaleLowerCase("ru-RU").includes(query);
        })
        .sort(compareByDate);

    // если выбрано "сначала поздние" - переворачиваем список
    if (ui.sortOrder === "desc") list.reverse();

    // для каждой записи делаем строку таблицы и вставляем в tbody
    $("#appointmentsList").innerHTML = list.map((a) => {
        const dateText = formatDate(parseDate(a.date), { weekday: "short", day: "2-digit", month: "2-digit" });
        // у кнопок в строке есть data-action и data-id, по ним в handleActionClick понимаем, что нажали
        return `<tr>
            <td>${escapeHtml(dateText)}, ${escapeHtml(a.time)}</td>
            <td>${escapeHtml(clientOf(a)?.name || "Клиент удалён")}</td>
            <td>${escapeHtml(serviceOf(a)?.name || "Услуга удалена")}</td>
            <td>${escapeHtml(masterOf(a)?.name || "Мастер удалён")}</td>
            <td><button type="button" class="status ${STATUS_CLASS[a.status]}" data-action="status" data-id="${a.id}" title="Нажми, чтобы сменить статус">${escapeHtml(a.status)}</button></td>
            <td class="row-actions">
                <button type="button" class="icon-button" data-action="details" data-type="appointment" data-id="${a.id}" aria-label="Подробнее о записи" title="Подробнее">i</button>
                <button type="button" class="icon-button" data-action="edit" data-type="appointment" data-id="${a.id}" aria-label="Изменить запись" title="Изменить">✎</button>
                <button type="button" class="icon-button danger" data-action="delete" data-type="appointment" data-id="${a.id}" aria-label="Удалить запись" title="Удалить">×</button>
            </td>
        </tr>`;
    }).join("");

    // если записей нет - показываем надпись
    const emptyText = data.appointments.length ? "По выбранным условиям записей не найдено." : "Записей пока нет. Создай первую запись.";
    toggleEmpty("#emptyAppointments", list.length === 0, emptyText);
}

// кнопки под карточкой
function cardActions(type, id) {
    return `<div class="card-actions">
        <button type="button" class="link-button" data-action="details" data-type="${type}" data-id="${id}">Подробнее</button>
        <button type="button" class="link-button" data-action="edit" data-type="${type}" data-id="${id}">Изменить</button>
        <button type="button" class="link-button danger" data-action="delete" data-type="${type}" data-id="${id}">Удалить</button>
    </div>`;
}

// карточки клиентов, vip сверху
function renderClients() {
    const query = getQuery();
    const list = data.clients
        .filter((c) => `${c.name} ${c.phone} ${c.email}`.toLocaleLowerCase("ru-RU").includes(query))
        // vip идут первыми: true это 1, false это 0
        .sort((a, b) => Number(b.vip) - Number(a.vip));

    // делаем карточку для каждого клиента
    $("#clientsList").innerHTML = list.map((c) => `
        <article class="data-card">
            <div class="card-top">
                <h3>${escapeHtml(c.name)}</h3>
                <button type="button" class="star ${c.vip ? "active" : ""}" data-action="vip" data-id="${c.id}" aria-pressed="${c.vip}" aria-label="Отметить как VIP" title="VIP-клиент">★</button>
            </div>
            <p>Телефон: ${escapeHtml(c.phone)}</p>
            <p>Email: ${escapeHtml(c.email || "не указан")}</p>
            ${cardActions("client", c.id)}
        </article>`).join("");

    toggleEmpty("#emptyClients", list.length === 0, query ? "Клиенты по запросу не найдены." : "Клиентская база пока пуста.");
}

// карточки мастеров
function renderMasters() {
    const query = getQuery();
    const list = data.masters.filter((m) => `${m.name} ${m.specialty}`.toLocaleLowerCase("ru-RU").includes(query));

    $("#mastersList").innerHTML = list.map((m) => {
        // считаем, сколько у мастера записей (отменённые не считаем)
        const count = data.appointments.filter((a) => a.masterId === m.id && a.status !== "Отменена").length;
        return `<article class="data-card">
            <h3>${escapeHtml(m.name)}</h3>
            <p>${escapeHtml(m.specialty)}</p>
            <p>Записей: ${count}</p>
            ${cardActions("master", m.id)}
        </article>`;
    }).join("");

    toggleEmpty("#emptyMasters", list.length === 0, query ? "Мастера по запросу не найдены." : "Список мастеров пока пуст.");
}

// карточки услуг
function renderServices() {
    const query = getQuery();
    const list = data.services.filter((s) => `${s.name} ${s.price} ${s.duration}`.toLocaleLowerCase("ru-RU").includes(query));

    $("#servicesList").innerHTML = list.map((s) => `
        <article class="data-card">
            <h3>${escapeHtml(s.name)}</h3>
            <p class="price">${money(s.price)}</p>
            <p>Длительность: ${s.duration} мин.</p>
            ${cardActions("service", s.id)}
        </article>`).join("");

    toggleEmpty("#emptyServices", list.length === 0, query ? "Услуги по запросу не найдены." : "Каталог пока пуст.");
}

// финансы: складываем цены услуг из записей
function renderFinances() {
    // завершённые записи - это уже полученные деньги
    const done = data.appointments.filter((a) => a.status === "Завершена");
    // подтверждённые и ожидающие - это деньги, которые ещё будут
    const planned = data.appointments.filter((a) => a.status === "Подтверждена" || a.status === "Ожидает");
    const revenue = sumPrices(done);

    $("#financeRevenue").textContent = money(revenue);
    $("#financePlanned").textContent = money(sumPrices(planned));
    // средний чек = выручка / число завершённых записей (если их нет, то 0, чтобы не делить на ноль)
    $("#financeAverage").textContent = money(done.length ? Math.round(revenue / done.length) : 0);
}

// цвета для диаграммы
const PIE_COLORS = ["#9A603C", "#D9B18D", "#5E361F", "#C99C76", "#B77A4D", "#8A6749"];

// аналитика и круговая диаграмма
function renderAnalytics() {
    $("#allAppointmentsCount").textContent = data.appointments.length;
    $("#analyticsClientsCount").textContent = data.clients.length;
    $("#analyticsServicesCount").textContent = data.services.length;

    // считаем сколько раз выбрали каждую услугу (отменённые не считаем)
    const rating = data.services
        .map((s) => ({ name: s.name, count: data.appointments.filter((a) => a.serviceId === s.id && a.status !== "Отменена").length }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, PIE_COLORS.length);

    // если данных нет - прячем диаграмму
    const pie = $("#popularPie");
    pie.classList.toggle("hidden", rating.length === 0);

    if (!rating.length) {
        $("#popularServices").innerHTML = `<li class="empty-state">Данных для диаграммы пока нет.</li>`;
        return;
    }

    // каждый кусок диаграммы - это цвет и его проценты от и до (для conic-gradient)
    const total = rating.reduce((sum, item) => sum + item.count, 0);
    let start = 0;
    const sectors = rating.map((item, index) => {
        const end = start + item.count / total * 100;
        const sector = `${PIE_COLORS[index]} ${start}% ${end}%`;
        start = end;
        return sector;
    });
    // собираем цвета в градиент и ставим на круг
    pie.style.background = `conic-gradient(${sectors.join(", ")})`;

    // список справа от диаграммы
    $("#popularServices").innerHTML = rating.map((item, index) => `<li>
        <span class="legend-color" style="background: ${PIE_COLORS[index]}"></span>
        <span class="legend-name">${escapeHtml(item.name)}</span>
        <span class="legend-value">${item.count} · ${Math.round(item.count / total * 100)}%</span>
    </li>`).join("");
}

// календарь на 6 недель, дни с записями отмечаем точкой
function renderCalendar() {
    // месяц, который сейчас показан
    const month = ui.visibleMonth;
    $("#calendarMonth").textContent = formatDate(month, { month: "long", year: "numeric" });

    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;   // в js неделя с воскресенья, а нам нужен понедельник
    // первая клетка - понедельник той недели, где начинается месяц
    const gridStart = new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset);
    const todayKey = dateKey(new Date());
    const selectedKey = dateKey(ui.selectedDate);
    // Set хранит дни, в которых есть записи, повторы ему не нужны
    const busyDates = new Set(data.appointments.filter((a) => a.status !== "Отменена").map((a) => a.date));

    // рисуем 42 клетки (6 недель по 7 дней)
    const days = [];
    for (let i = 0; i < 42; i++) {
        const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
        const key = dateKey(date);
        // классы для клетки: другой месяц, сегодня, выбран, есть записи
        const classes = [
            date.getMonth() !== month.getMonth() ? "outside-month" : "",
            key === todayKey ? "today" : "",
            key === selectedKey ? "selected" : "",
            busyDates.has(key) ? "has-appointments" : ""
        ].filter(Boolean).join(" ");
        days.push(`<button type="button" class="${classes}" data-date="${key}" aria-label="${escapeHtml(formatDate(date))}" aria-pressed="${key === selectedKey}">${date.getDate()}</button>`);
    }
    // вставляем все клетки в календарь
    $("#calendarDays").innerHTML = days.join("");
}

// блок справа про выбранный день
function updateSelectedDayInfo() {
    const key = dateKey(ui.selectedDate);
    const list = data.appointments.filter((a) => a.date === key && a.status !== "Отменена").sort(compareByDate);
    // Set считает каждого клиента один раз, даже если у него две записи в день
    const clientIds = new Set(list.map((a) => a.clientId));

    $("#selectedDateLabel").textContent = formatDate(ui.selectedDate, { day: "numeric", month: "long" });
    $("#dayAppointments").textContent = `${list.length} ${pluralize(list.length, "запись", "записи", "записей")}`;
    $("#dayClients").textContent = `${clientIds.size} ${pluralize(clientIds.size, "клиент", "клиента", "клиентов")}`;
    $("#dayList").innerHTML = list.map((a) =>
        `<li><strong>${escapeHtml(a.time)}</strong> ${escapeHtml(clientOf(a)?.name || "Клиент удалён")}</li>`
    ).join("");
}


// окно с подробностями

// список вида название - значение
function detailList(rows) {
    return `<dl class="details-list">${rows.map(([label, value]) =>
        `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl>`;
}

// список записей для окна подробностей
function historyList(list, describe) {
    if (!list.length) return `<p class="details-empty">Записей пока нет.</p>`;
    return `<ul class="history-list">${list.map((a) => `<li>
        <span>${escapeHtml(describe(a))}</span>
        <span class="status ${STATUS_CLASS[a.status]}">${escapeHtml(a.status)}</span>
    </li>`).join("")}</ul>`;
}

// короткая дата вида 26 окт.
const shortDate = (a) => formatDate(parseDate(a.date), { day: "numeric", month: "short" });

// собираем заголовок и html для окна подробностей
function getDetails(type, id) {
    // смотрим, что именно открыли, и собираем нужный текст
    if (type === "client") {
        const client = byId(data.clients, id);
        const visits = data.appointments.filter((a) => a.clientId === id).sort(compareByDate);
        // завершённые визиты клиента
        const done = visits.filter((a) => a.status === "Завершена");
        return {
            title: client.name,
            html: detailList([
                ["Телефон", client.phone],
                ["Email", client.email || "не указан"],
                ["Статус", client.vip ? "VIP-клиент ★" : "Обычный клиент"],
                ["Завершённых визитов", String(done.length)],
                ["Потрачено", money(sumPrices(done))]
            ]) + `<h3 class="subheading">История записей</h3>` +
                historyList(visits, (a) => `${shortDate(a)}, ${a.time} — ${serviceOf(a)?.name || "услуга удалена"}`)
        };
    }
    if (type === "service") {
        const service = byId(data.services, id);
        const list = data.appointments.filter((a) => a.serviceId === id).sort(compareByDate);
        return {
            title: service.name,
            html: detailList([
                ["Стоимость", money(service.price)],
                ["Длительность", `${service.duration} мин.`],
                ["Всего записей", String(list.length)]
            ]) + `<h3 class="subheading">Записи на услугу</h3>` +
                historyList(list, (a) => `${shortDate(a)}, ${a.time} — ${clientOf(a)?.name || "клиент удалён"}`)
        };
    }
    if (type === "master") {
        const master = byId(data.masters, id);
        const list = data.appointments.filter((a) => a.masterId === id).sort(compareByDate);
        const earned = sumPrices(list.filter((a) => a.status === "Завершена"));
        return {
            title: master.name,
            html: detailList([
                ["Специализация", master.specialty],
                ["Всего записей", String(list.length)],
                ["Выручка (завершённые)", money(earned)]
            ]) + `<h3 class="subheading">Расписание мастера</h3>` +
                historyList(list, (a) => `${shortDate(a)}, ${a.time} — ${clientOf(a)?.name || "клиент удалён"}`)
        };
    }
    // если это не клиент, услуга или мастер, то это запись
    const a = byId(data.appointments, id);
    return {
        title: "Запись клиента",
        html: detailList([
            ["Клиент", clientOf(a)?.name || "удалён"],
            ["Телефон", clientOf(a)?.phone || "—"],
            ["Услуга", serviceOf(a)?.name || "удалена"],
            ["Стоимость", money(priceOf(a))],
            ["Длительность", `${serviceOf(a)?.duration || 0} мин.`],
            ["Мастер", masterOf(a)?.name || "удалён"],
            ["Дата и время", `${formatDate(parseDate(a.date))}, ${a.time}`],
            ["Статус", a.status],
            ["Комментарий", a.comment || "нет"]
        ])
    };
}

// открываем окно с подробностями
function openDetails(type, id) {
    const details = getDetails(type, id);
    $("#detailsBox").innerHTML = details.html;
    // режим details: показываем подробности, а форму прячем
    showModal("ПОДРОБНОСТИ", details.title, "details");
    $("#closeModal").focus();
}


// формы и проверка

// открываем окно, mode это "form" (форма) или "details" (подробности)
function showModal(kicker, title, mode) {
    $("#modalKicker").textContent = kicker;
    $("#modalTitle").textContent = title;
    $("#entryForm").classList.toggle("hidden", mode !== "form");
    $("#formMessage").classList.toggle("hidden", mode !== "form");
    $("#detailsBox").classList.toggle("hidden", mode !== "details");
    $("#modalBackdrop").classList.remove("hidden");
    // чтобы страница под окном не прокручивалась
    document.body.style.overflow = "hidden";
}

// закрываем окно и сбрасываем то, что редактировали
function closeModal() {
    $("#modalBackdrop").classList.add("hidden");
    document.body.style.overflow = "";
    ui.formType = null;
    ui.editId = null;
}

// открываем форму, если передали id - значит редактируем
function openModal(type, id = null) {
    const titles = {
        appointment: "Новая запись",
        client: "Добавить клиента",
        master: "Добавить мастера",
        service: "Добавить услугу"
    };
    const editTitles = {
        appointment: "Изменить запись",
        client: "Изменить клиента",
        master: "Изменить мастера",
        service: "Изменить услугу"
    };
    // нужно, чтобы найти объект по типу при редактировании
    const lists = { client: data.clients, master: data.masters, service: data.services, appointment: data.appointments };

    ui.formType = type;
    ui.editId = id;
    $("#formMessage").textContent = "";
    // рисуем нужную форму внутри окна
    $("#entryForm").innerHTML = getFormMarkup(type);

    // поиск клиента в форме записи: пока человек печатает,
    // в списке остаются только подходящие клиенты
    const clientSearch = $("#clientSearch");
    const clientSelect = $("#clientId");
    const clientSearchMessage = $("#clientSearchMessage");

    if (clientSearch && clientSelect) {
        // запоминаем всех клиентов (кроме первого пункта "Выбери клиента"), по ним будем фильтровать
        const allClientOptions = Array.from(clientSelect.options).slice(1).map((option) => ({
            value: option.value,
            label: option.textContent
        }));

        // событие input срабатывает на каждую набранную букву
        clientSearch.addEventListener("input", () => {
            const query = clientSearch.value.trim().toLocaleLowerCase("ru-RU");
            // запоминаем, что уже было выбрано
            const previousValue = clientSelect.value;
            // оставляем только тех, у кого в имени есть введённый текст
            const matches = allClientOptions.filter((option) =>
                option.label.toLocaleLowerCase("ru-RU").includes(query)
            );

            // заново заполняем select найденными клиентами
            clientSelect.innerHTML = '<option value="">Выбери клиента</option>' +
                matches.map((option) =>
                    `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`
                ).join("");

            // если выбранный клиент остался в списке - выбираем его снова
            if (matches.some((option) => option.value === previousValue)) {
                clientSelect.value = previousValue;
            }

            // подсказка под полем: сколько нашли
            if (clientSearchMessage) {
                clientSearchMessage.textContent = query
                    ? `Найдено клиентов: ${matches.length}`
                    : "Можно искать по имени или фамилии.";
            }

            // если никого не нашли - так и пишем в списке
            if (query && matches.length === 0) {
                clientSelect.innerHTML = '<option value="">Клиент не найден</option>';
            }
        });
    }

    // при редактировании вставляем старые значения в поля
    if (id) fillForm(byId(lists[type], id));

    showModal(id ? "РЕДАКТИРОВАНИЕ" : "НОВАЯ КАРТОЧКА", id ? editTitles[type] : titles[type], "form");
    // ставим курсор в первое поле
    const firstInput = $("#entryForm").querySelector("input, select");
    if (firstInput) firstInput.focus();
}

// заполняем поля (name у полей такой же как ключи объекта)
function fillForm(item) {
    // идём по всем ключам объекта и вставляем значение в поле с таким же name
    Object.keys(item).forEach((key) => {
        const input = $("#entryForm").elements.namedItem(key);
        if (input) input.value = item[key];
    });
}

// делаем html одного поля вместе с label
function field(label, name, type, options = {}) {
    // собираем атрибуты для поля: required, min, max и т.д.
    const attrs = [
        options.required === false ? "" : "required",
        options.min !== undefined ? `min="${options.min}"` : "",
        options.max !== undefined ? `max="${options.max}"` : "",
        options.minlength ? `minlength="${options.minlength}"` : "",
        options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : ""
    ].join(" ");

    // в зависимости от типа делаем select, textarea или обычный input
    let control;
    if (type === "select") {
        const choices = (options.choices || []).map((c) => `<option value="${escapeHtml(c.value)}">${escapeHtml(c.label)}</option>`).join("");
        control = `<select id="${name}" name="${name}" ${attrs}><option value="">Выбери вариант</option>${choices}</select>`;
    } else if (type === "textarea") {
        control = `<textarea id="${name}" name="${name}" rows="3" ${attrs}></textarea>`;
    } else {
        control = `<input id="${name}" name="${name}" type="${type}" ${attrs}>`;
    }
    // label связан с полем через for и id
    return `<div class="form-field${options.full ? " full-width" : ""}"><label for="${name}">${label}</label>${control}</div>`;
}

// кнопки внизу формы, при редактировании текст другой
const formButtons = (saveText) =>
    `<div class="form-actions"><button class="button button-primary" type="submit">${ui.editId ? "Сохранить изменения" : saveText}</button><button class="button button-outline" type="button" data-cancel>Отмена</button></div>`;

// поле клиента для записи: сверху поиск, снизу список клиентов (select)
function searchableClientField() {
    // делаем option для каждого клиента
    const options = data.clients.map((client) =>
        `<option value="${escapeHtml(client.id)}">${escapeHtml(client.name)}</option>`
    ).join("");

    return `<div class="form-field client-search-field">
        <label for="clientSearch">Клиент</label>
        <input id="clientSearch" type="search" placeholder="Начни вводить имя или фамилию" autocomplete="off" aria-label="Поиск клиента">
        <select id="clientId" name="clientId" required>
            <option value="">Выбери клиента</option>${options}
        </select>
        <p class="field-hint" id="clientSearchMessage">Можно искать по имени или фамилии.</p>
    </div>`;
}

function getFormMarkup(type) {
    // форма клиента
    if (type === "client") {
        return field("Имя и фамилия", "name", "text", { minlength: 2, placeholder: "Например, Анна Смирнова" }) +
            field("Телефон", "phone", "tel", { placeholder: "+7 900 000-00-00" }) +
            field("Email", "email", "email", { required: false, placeholder: "client@example.com" }) +
            formButtons("Сохранить клиента");
    }
    // форма мастера
    if (type === "master") {
        return field("Имя и фамилия", "name", "text", { minlength: 2, placeholder: "Например, Алина Орлова" }) +
            field("Специализация", "specialty", "text", { placeholder: "Например, Мастер маникюра" }) +
            formButtons("Сохранить мастера");
    }
    // форма услуги
    if (type === "service") {
        return field("Название услуги", "name", "text", { minlength: 2, placeholder: "Например, Маникюр" }) +
            field("Стоимость, ₽", "price", "number", { min: 1, placeholder: "2500" }) +
            field("Длительность, минут", "duration", "number", { min: 5, max: 480, placeholder: "60" }) +
            formButtons("Сохранить услугу");
    }

    // для записи нужны клиент, услуга и мастер, проверяем что они есть
    if (!data.clients.length || !data.services.length || !data.masters.length) {
        return `<div class="form-field full-width"><p class="settings-note">Чтобы создать запись, сначала добавь хотя бы одного клиента, услугу и мастера.</p></div>
            <div class="form-actions">
                <button class="button button-soft" type="button" data-add="client">Добавить клиента</button>
                <button class="button button-soft" type="button" data-add="service">Добавить услугу</button>
                <button class="button button-soft" type="button" data-add="master">Добавить мастера</button>
                <button class="button button-outline" type="button" data-cancel>Закрыть</button>
            </div>`;
    }
    // у новой записи два статуса, при редактировании все
    const statusChoices = (ui.editId ? STATUSES : ["Подтверждена", "Ожидает"]).map((name) => ({ value: name, label: name }));

    // форма записи, тут больше всего полей: клиент, услуга, мастер, статус, дата, время и комментарий
    return searchableClientField() +
        field("Услуга", "serviceId", "select", { choices: data.services.map((s) => ({ value: s.id, label: `${s.name} · ${money(s.price)}` })) }) +
        field("Мастер", "masterId", "select", { choices: data.masters.map((m) => ({ value: m.id, label: m.name })) }) +
        field("Статус", "status", "select", { choices: statusChoices }) +
        field("Дата", "date", "date", { min: ui.editId ? undefined : dateKey(new Date()) }) +
        field("Время", "time", "time", { min: WORK_START, max: WORK_END }) +
        field("Комментарий", "comment", "textarea", { required: false, full: true, placeholder: "Пожелания клиента (необязательно)" }) +
        formButtons("Сохранить запись");
}

// функции сохранения: если ошибка - возвращают текст ошибки,
// если всё хорошо - сохраняют и возвращают пустую строку

// регулярка для имени: русские и английские буквы, пробел, апостроф и дефис, минимум 2 символа
const NAME_PATTERN = /^[A-Za-zА-Яа-яЁё\s'-]{2,}$/;

// проверка и сохранение клиента
function saveClient(values) {
    // trim убирает пробелы по краям
    const name = values.name.trim();
    const phone = values.phone.trim();
    const email = values.email.trim();
    const digits = phone.replace(/\D/g, "");   // убираем всё кроме цифр

    // дополнительная проверка в js (кроме required и minlength из html)
    if (!NAME_PATTERN.test(name)) return "Имя должно содержать только буквы (минимум 2 символа).";
    if (digits.length < 10 || digits.length > 12) return "Введи корректный телефон: от 10 до 12 цифр.";
    // при редактировании сам клиент не считается повтором
    if (data.clients.some((c) => c.id !== ui.editId && c.phone.replace(/\D/g, "") === digits)) return "Клиент с таким телефоном уже есть в списке.";

    // если редактируем - обновляем старый объект, если нет - добавляем новый в массив
    if (ui.editId) Object.assign(byId(data.clients, ui.editId), { name, phone, email });
    else data.clients.push({ id: makeId("c"), name, phone, email, vip: false });
    return "";
}

// проверка и сохранение мастера
function saveMaster(values) {
    const name = values.name.trim();
    const specialty = values.specialty.trim();

    if (!NAME_PATTERN.test(name)) return "Имя должно содержать только буквы (минимум 2 символа).";
    if (!specialty) return "Укажи специализацию мастера.";

    if (ui.editId) Object.assign(byId(data.masters, ui.editId), { name, specialty });
    else data.masters.push({ id: makeId("m"), name, specialty });
    return "";
}

// проверка и сохранение услуги
function saveService(values) {
    const name = values.name.trim();
    const price = Number(values.price);
    const duration = Number(values.duration);

    if (name.length < 2) return "Название услуги слишком короткое.";
    if (!(price > 0)) return "Стоимость должна быть больше нуля.";
    if (!(duration >= 5)) return "Длительность — не менее 5 минут.";
    // не даём создать две услуги с одинаковым названием
    if (data.services.some((s) => s.id !== ui.editId && s.name.toLowerCase() === name.toLowerCase())) return "Такая услуга уже есть в каталоге.";

    if (ui.editId) Object.assign(byId(data.services, ui.editId), { name, price, duration });
    else data.services.push({ id: makeId("s"), name, price, duration });
    return "";
}

// проверка и сохранение записи
function saveAppointment(values) {
    // время вида 09:00 можно сравнивать как строки
    if (values.time < WORK_START || values.time > WORK_END) return `Салон работает с ${WORK_START} до ${WORK_END}.`;
    // прошлое запрещаем только для новых записей
    if (!ui.editId && new Date(`${values.date}T${values.time}`) < new Date()) return "Нельзя создать запись на прошедшее время.";

    // проверяем, что у мастера нет другой записи на это же время (отменённые не считаем)
    const busy = data.appointments.some((a) =>
        a.id !== ui.editId && a.masterId === values.masterId && a.date === values.date && a.time === values.time && a.status !== "Отменена");
    if (busy) return "У этого мастера уже есть запись на выбранное время.";

    // собираем данные записи в один объект
    const fields = {
        clientId: values.clientId,
        serviceId: values.serviceId,
        masterId: values.masterId,
        date: values.date,
        time: values.time,
        status: values.status,
        comment: values.comment.trim()
    };
    if (ui.editId) Object.assign(byId(data.appointments, ui.editId), fields);
    else data.appointments.push({ id: makeId("a"), ...fields });

    // переключаем календарь на дату записи
    ui.selectedDate = parseDate(values.date);
    ui.visibleMonth = new Date(ui.selectedDate.getFullYear(), ui.selectedDate.getMonth(), 1);
    return "";
}

// отправка формы (required, min и max браузер уже проверил)
function handleFormSubmit(event) {
    // preventDefault, чтобы страница не перезагружалась при отправке формы
    event.preventDefault();
    // FormData собирает значения всех полей формы в объект
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());

    // для каждого типа формы своя функция сохранения
    const savers = { client: saveClient, master: saveMaster, service: saveService, appointment: saveAppointment };
    const messages = {
        client: "Клиент добавлен.",
        master: "Мастер добавлен.",
        service: "Услуга добавлена в каталог.",
        appointment: "Запись добавлена в расписание."
    };

    // если функция вернула текст - это ошибка, показываем её и ничего не сохраняем
    const error = savers[ui.formType](values);
    if (error) {
        $("#formMessage").textContent = error;
        return;
    }
    const type = ui.formType;
    const wasEdit = Boolean(ui.editId);
    closeModal();
    commit();
    showToast(wasEdit ? "Изменения сохранены." : messages[type]);
}


// действия пользователя

// маленькое уведомление в углу, пропадает через пару секунд
function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    // сбрасываем старый таймер, если уведомление уже было
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.add("hidden"), 2800);
}

// меняем статус по кругу: Подтверждена -> Ожидает -> Завершена -> Отменена
function cycleStatus(id) {
    const appointment = byId(data.appointments, id);
    // берём следующий статус из списка, % возвращает к первому после последнего
    appointment.status = STATUSES[(STATUSES.indexOf(appointment.status) + 1) % STATUSES.length];
    commit();
    showToast(`Статус изменён: ${appointment.status}`);
}

// vip у клиента
function toggleVip(id) {
    const client = byId(data.clients, id);
    // меняем true на false и наоборот
    client.vip = !client.vip;
    commit();
    showToast(client.vip ? `${client.name} теперь VIP-клиент.` : "VIP-отметка снята.");
}

// удаление
function deleteItem(type, id) {
    // названия для вопроса, имена массивов и поля, по которым записи связаны с объектом
    const names = { client: "клиента", service: "услугу", master: "мастера", appointment: "запись" };
    const lists = { client: "clients", service: "services", master: "masters", appointment: "appointments" };
    const links = { client: "clientId", service: "serviceId", master: "masterId" };

    // если есть записи с этим объектом, удалять нельзя, иначе в таблице будет пусто
    const key = links[type];
    if (key && data.appointments.some((a) => a[key] === id)) {
        showToast("Нельзя удалить: сначала удали связанные записи.");
        return;
    }
    // спрашиваем подтверждение
    if (!window.confirm(`Удалить ${names[type]}?`)) return;

    // оставляем в массиве всех, кроме удаляемого
    data[lists[type]] = data[lists[type]].filter((item) => item.id !== id);
    commit();
    showToast("Удалено.");
}

// один обработчик на все кнопки с data-action
function handleActionClick(event) {
    // closest находит ближайшую кнопку с data-action, даже если нажали на значок внутри неё
    const button = event.target.closest("[data-action]");
    if (!button) return;
    // достаём значения из data-атрибутов кнопки
    const { action, type, id } = button.dataset;

    if (action === "details") openDetails(type, id);
    if (action === "status") cycleStatus(id);
    if (action === "vip") toggleVip(id);
    if (action === "edit") openModal(type, id);
    if (action === "delete") deleteItem(type, id);
}


// запуск сайта и события

// вешаем клик на кнопку
function onClick(selector, handler) {
    $(selector).addEventListener("click", handler);
}

function init() {
    // пишем сегодняшнюю дату в шапке
    $("#todayLabel").textContent = formatDate(new Date(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toLocaleUpperCase("ru-RU");
    // первый раз выводим всё на страницу
    updateDashboard();

    // кнопки, которые открывают формы
    ["#dockAppointment", "#newAppointment", "#addFromCalendar"].forEach((id) => onClick(id, () => openModal("appointment")));
    ["#dockClient", "#clientsButton"].forEach((id) => onClick(id, () => openModal("client")));
    ["#dockService", "#servicesButton"].forEach((id) => onClick(id, () => openModal("service")));
    onClick("#mastersButton", () => openModal("master"));

    // модальное окно
    onClick("#closeModal", closeModal);
    $("#modalBackdrop").addEventListener("click", (event) => {
        if (event.target === $("#modalBackdrop")) closeModal();   // клик мимо окна
    });
    // событие submit - отправка формы
    $("#entryForm").addEventListener("submit", handleFormSubmit);
    $("#entryForm").addEventListener("click", (event) => {
        if (event.target.closest("[data-cancel]")) closeModal();
        const addButton = event.target.closest("[data-add]");
        if (addButton) openModal(addButton.dataset.add);
    });
    // закрываем окно по клавише Escape
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !$("#modalBackdrop").classList.contains("hidden")) closeModal();
    });

    // кнопки подробнее, статус, vip, изменить, удалить
    document.addEventListener("click", handleActionClick);

    // фильтр по статусу
    $("#statusFilters").addEventListener("click", (event) => {
        const chip = event.target.closest("[data-status]");
        if (!chip) return;
        // запоминаем фильтр и подсвечиваем нажатую кнопку
        ui.statusFilter = chip.dataset.status;
        $$("#statusFilters .chip").forEach((item) => {
            item.classList.toggle("active", item === chip);
            item.setAttribute("aria-pressed", item === chip);
        });
        renderAppointments();
    });

    // сортировка
    $("#sortSelect").addEventListener("change", (event) => {
        ui.sortOrder = event.target.value;
        renderAppointments();
    });

    // поиск по всем спискам сразу
    $("#globalSearch").addEventListener("input", () => {
        renderAppointments();
        renderClients();
        renderMasters();
        renderServices();
    });

    // календарь
    onClick("#prevMonth", () => {
        ui.visibleMonth = new Date(ui.visibleMonth.getFullYear(), ui.visibleMonth.getMonth() - 1, 1);
        renderCalendar();
    });
    onClick("#nextMonth", () => {
        ui.visibleMonth = new Date(ui.visibleMonth.getFullYear(), ui.visibleMonth.getMonth() + 1, 1);
        renderCalendar();
    });
    // клик по дню календаря (один обработчик на все дни)
    $("#calendarDays").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-date]");
        if (!button) return;
        ui.selectedDate = parseDate(button.dataset.date);
        ui.visibleMonth = new Date(ui.selectedDate.getFullYear(), ui.selectedDate.getMonth(), 1);
        renderCalendar();
        updateSelectedDayInfo();
    });

    // подсвечиваем пункт меню
    $$(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            $$(".nav-link").forEach((item) => item.classList.remove("active"));
            link.classList.add("active");
        });
    });
}

// запускаем всё
init();
