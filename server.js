const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000; 

// --- 1. КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ MONGODB ---
// !! ВАЖНО: ЗАМЕНИТЕ ЭТУ СТРОКУ, ЕСЛИ ВЫ НЕ ИСПОЛЬЗУЕТЕ ЛОКАЛЬНЫЙ MONGODB !!
const MONGODB_URI = 'mongodb+srv://aagatius_db_user:KyqyXv8Cfv4vUPTK@windircluster.uli5x8o.mongodb.net/?appName=WindirCluster'; 

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB успешно подключен.'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// --- 2. СХЕМА И МОДЕЛЬ Mongoose ---
const SubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    }
});

const Subscriber = mongoose.model('Subscriber', SubscriberSchema);
// ------------------------------------

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Конфигурация статических файлов: ищем HTML, CSS и картинки в папке WREDIR
const publicPath = path.join(__dirname); 

// Конфигурация статических файлов (CSS, IMG, JS)
// Используем publicPath, который указывает на родительскую папку
app.use(express.static(publicPath)); 

// Маршрут для главной страницы (index.html)
app.get('/', (req, res) => {
    // Явно указываем, что файл index.html находится в папке, из которой мы запустили сервер
    res.sendFile(path.join(publicPath, 'index.html'));
});

// --- 3. МАРШРУТ ДЛЯ ПОДПИСКИ (POST-ЗАПРОС) ---
app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email не может быть пустым.' });
    }

    try {
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
        
        console.log(`Новый подписчик сохранен: ${email}`);
        res.status(201).json({ 
            message: 'Вы успешно подписались на рассылку!',
            email: newSubscriber.email
        });

    } catch (error) {
        if (error.code === 11000) { 
             return res.status(409).json({ message: 'Этот email уже подписан.' });
        }
        console.error('Ошибка сохранения подписчика:', error);
        res.status(500).json({ message: 'Произошла ошибка сервера. Попробуйте снова.' });
    }
});


// --- ЗАПУСК СЕРВЕРА ---
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log('Ваш сайт теперь доступен по этому адресу!');
});