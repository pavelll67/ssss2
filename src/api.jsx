// src/api.jsx

const JSON_HEADERS = {
    "Content-Type": "application/json",
};

function getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

// ==== Авторизация ====

export async function register(email, password, name) {
    const res = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
    })
    if (!res.ok) {
        throw new Error('Ошибка регистрации')
    }
    return true
}

export async function login(email, password) {
    const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
        throw new Error('Ошибка входа')
    }
    const data = await res.json()
    localStorage.setItem('token', data.token)
    return getMe()
}

export async function getMe() {
    const res = await fetch(`/api/auth/me`, {
        headers: {
            ...getAuthHeaders(),
        },
    })
    if (!res.ok) {
        throw new Error('not auth')
    }
    return res.json()
}

// ==== Общий метод ====

async function request(url, options = {}, errorMessage = "Ошибка запроса") {
    try {
    const res = await fetch(url, {
        ...options,
        headers: {
            ...JSON_HEADERS,
            ...getAuthHeaders(),
            ...(options.headers || {}),
        },
    });

    if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const errorText = errorData.message || errorData.error || errorMessage;
            throw new Error(errorText);
    }

        return await res.json();
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}

// ==== Конкретные методы API ====

export async function generateImage(prompt, aspectRatio = "1:1") {
    console.log('Calling generateImage API with:', { prompt, aspectRatio });
    const result = await request(
        "/api/image/generate",
        {
            method: "POST",
            body: JSON.stringify({prompt, aspect_ratio: aspectRatio}),
        },
        "Не удалось сгенерировать изображение"
    );
    console.log('generateImage API response:', result);
    return result;
}

export async function saveImage(imageId) {
    return request(
        "/api/image/save",
        {
            method: "POST",
            body: JSON.stringify({image_id: imageId}),
        },
        "Не удалось сохранить изображение"
    );
}

export async function attachImage(imageId) {
    return request(
        "/api/image/attach",
        {
            method: "POST",
            body: JSON.stringify({image_id: imageId}),
        },
        "Не удалось привязать изображение"
    );
}

export async function editImage(imageId, prompt, aspectRatio) {
    return request(
        "/api/image/edit",
        {
            method: "POST",
            body: JSON.stringify({
                image_id: imageId,
                prompt: prompt,
                aspect_ratio: aspectRatio
            }),
        },
        "Не удалось отредактировать изображение"
    );
}

export async function getImage(imageId) {
    return request(
        `/api/image/${imageId}`,
        {
            method: "GET",
        },
        "Не удалось получить информацию об изображении"
    );
}

// ==== Личный кабинет ====

export async function getMyImages() {
    return request(
        "/api/my/images",
        {
            method: "GET",
        },
        "Не удалось получить проекты"
    );
}