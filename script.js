// Конфигурация
const CONFIG = {
    FORM_ENDPOINT: 'https://formcarry.com/s/pw7L1Ixj7yi', // Замените на ваш ID
    STORAGE_KEY: 'feedback_form_data',
    MESSAGE_TIMEOUT: 5000
};

// Основные элементы
const elements = {
    openFormBtn: document.getElementById('openFormBtn'),
    popupOverlay: document.getElementById('popupOverlay'),
    formContainer: document.getElementById('formContainer'),
    closeBtn: document.getElementById('closeBtn'),
    contactForm: document.getElementById('contactForm'),
    formMessage: document.getElementById('formMessage'),
    submitBtn: document.getElementById('submitBtn'),
    policyLink: document.getElementById('policyLink'),
    clearBtn: document.getElementById('clearBtn')
};

// Состояние
let isFormOpen = false;

/**
 * Инициализация приложения
 */
function init() {
    setupEventListeners();
    
    // Проверяем, нужно ли открыть форму при загрузке
    if (window.location.hash === '#feedback-form') {
        openForm();
    }
}

/**
 * Настройка обработчиков событий
 */
function setupEventListeners() {
    elements.openFormBtn.addEventListener('click', openForm);
    elements.closeBtn.addEventListener('click', closeForm);
    elements.popupOverlay.addEventListener('click', closeOnOverlayClick);
    elements.contactForm.addEventListener('submit', handleFormSubmit);
    elements.contactForm.addEventListener('input', saveFormData);
    elements.clearBtn.addEventListener('click', clearForm);
    elements.policyLink.addEventListener('click', showPrivacyPolicy);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleEscapeKey);
}

/**
 * Открытие формы
 */
function openForm() {
    elements.popupOverlay.classList.add('active');
    isFormOpen = true;
    
    // Изменяем URL
    history.pushState({ formOpen: true }, '', '#feedback-form');
    
    // Загружаем сохраненные данные
    loadFormData();
    
    // Фокусируемся на первом поле
    document.getElementById('fullName').focus();
}

/**
 * Закрытие формы
 */
function closeForm() {
    elements.popupOverlay.classList.remove('active');
    isFormOpen = false;
    
    // Возвращаем URL
    if (history.state && history.state.formOpen) {
        history.back();
    }
    
    // Скрываем сообщение
    hideMessage();
}

/**
 * Закрытие по клику на подложку
 */
function closeOnOverlayClick(e) {
    if (e.target === elements.popupOverlay) {
        closeForm();
    }
}

/**
 * Сохранение данных формы
 */
function saveFormData() {
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        organization: document.getElementById('organization').value,
        message: document.getElementById('message').value,
        privacyPolicy: document.getElementById('privacyPolicy').checked
    };
    
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(formData));
}

/**
 * Загрузка данных формы
 */
function loadFormData() {
    const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
    
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            document.getElementById('fullName').value = formData.fullName || '';
            document.getElementById('email').value = formData.email || '';
            document.getElementById('phone').value = formData.phone || '';
            document.getElementById('organization').value = formData.organization || '';
            document.getElementById('message').value = formData.message || '';
            document.getElementById('privacyPolicy').checked = formData.privacyPolicy || false;
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
        }
    }
}

/**
 * Очистка формы
 */
function clearForm() {
    if (confirm('Очистить все поля формы?')) {
        elements.contactForm.reset();
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        showMessage('Форма очищена', false);
    }
}

/**
 * Показать сообщение
 */
function showMessage(message, isError = false) {
    elements.formMessage.textContent = message;
    elements.formMessage.className = `form-message ${isError ? 'error' : 'success'}`;
    elements.formMessage.style.display = 'flex';
    
    setTimeout(() => {
        hideMessage();
    }, CONFIG.MESSAGE_TIMEOUT);
}

/**
 * Скрыть сообщение
 */
function hideMessage() {
    elements.formMessage.style.display = 'none';
}

/**
 * Валидация формы
 */
function validateForm() {
    const fields = {
        fullName: document.getElementById('fullName'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        message: document.getElementById('message'),
        privacyPolicy: document.getElementById('privacyPolicy')
    };
    
    // Проверка обязательных полей
    if (!fields.fullName.value.trim()) {
        showMessage('Введите ФИО', true);
        fields.fullName.focus();
        return false;
    }
    
    if (!fields.email.value.trim()) {
        showMessage('Введите email', true);
        fields.email.focus();
        return false;
    }
    
    if (!fields.email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showMessage('Введите корректный email', true);
        fields.email.focus();
        return false;
    }
    
    if (!fields.phone.value.trim()) {
        showMessage('Введите телефон', true);
        fields.phone.focus();
        return false;
    }
    
    if (!fields.message.value.trim()) {
        showMessage('Введите сообщение', true);
        fields.message.focus();
        return false;
    }
    
    if (!fields.privacyPolicy.checked) {
        showMessage('Необходимо согласие с политикой', true);
        fields.privacyPolicy.focus();
        return false;
    }
    
    return true;
}

/**
 * Обработка отправки формы
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // Блокируем кнопку
    elements.submitBtn.disabled = true;
    elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    
    // Собираем данные
    const formData = new FormData(elements.contactForm);
    const data = Object.fromEntries(formData.entries());
    
    try {
        // Отправляем на сервер
        const response = await fetch(CONFIG.FORM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok && result.code === 200) {
            // Успешно
            showMessage('Сообщение отправлено!');
            elements.contactForm.reset();
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            
            // Закрываем форму через 2 секунды
            setTimeout(() => {
                closeForm();
            }, 2000);
        } else {
            throw new Error(result.message || 'Ошибка отправки');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка отправки. Попробуйте еще раз.', true);
    } finally {
        // Разблокируем кнопку
        elements.submitBtn.disabled = false;
        elements.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить';
    }
}

/**
 * Показать политику конфиденциальности
 */
function showPrivacyPolicy(e) {
    e.preventDefault();
    alert('Политика обработки персональных данных:\n\n1. Мы собираем только данные, которые вы сами указываете в форме.\n2. Данные используются только для связи с вами.\n3. Мы не передаем ваши данные третьим лицам.\n4. Вы можете запросить удаление ваших данных в любое время.');
}

/**
 * Обработка кнопки "Назад"
 */
function handlePopState() {
    if (isFormOpen) {
        closeForm();
    }
}

/**
 * Обработка клавиши Escape
 */
function handleEscapeKey(e) {
    if (e.key === 'Escape' && isFormOpen) {
        closeForm();
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', init);
