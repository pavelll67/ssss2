import { useState, useEffect, useRef, useMemo } from 'react';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input';
import { HeroSection } from '@/components/HeroSection';
import { Button } from '@/components/ui/button';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { generateImage, attachImage, saveImage, editImage, getImage } from '@/api';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { AspectRatioSelector } from '@/components/AspectRatioSelector';
import { StyleSelector } from '@/components/StyleSelector';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { useSaveNotification } from '@/contexts/SaveNotificationContext';


export function Home() {

  const { user } = useAuth();
  const { triggerSaveAnimation } = useSaveNotification();
  // Загружаем сохраненные данные из localStorage при инициализации
  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem('poster_prompt') || '';
  });
  const [aspectRatio, setAspectRatio] = useState(() => {
    return localStorage.getItem('poster_aspectRatio') || '1:1';
  });
  const [style, setStyle] = useState(() => {
    const savedStyle = localStorage.getItem('poster_style');
    return savedStyle ? savedStyle : null;
  });
  const [imageUrl, setImageUrl] = useState(() => {
    return localStorage.getItem('poster_imageUrl') || null;
  });
  const [imageId, setImageId] = useState(() => {
    return localStorage.getItem('poster_imageId') || null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(() => {
    return localStorage.getItem('poster_error') || null;
  });
  
  // Сохраняем ошибку в localStorage при изменении
  useEffect(() => {
    if (error) {
      localStorage.setItem('poster_error', error);
    } else {
      localStorage.removeItem('poster_error');
    }
  }, [error]);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [isVertical, setIsVertical] = useState(false);
  const [status, setStatus] = useState(() => {
    // Восстанавливаем статус из localStorage
    const savedStatus = localStorage.getItem('poster_status');
    const savedImageUrl = localStorage.getItem('poster_imageUrl');
    const generatingPrompt = localStorage.getItem('poster_generatingPrompt');
    const generationStartTime = localStorage.getItem('poster_generationStartTime');
    const currentPrompt = localStorage.getItem('poster_prompt') || '';
    const editingImageId = localStorage.getItem('poster_editingImageId'); // Проверяем, идет ли редактирование
    
    // Если статус был 'error', восстанавливаем его
    if (savedStatus === 'error') {
      return 'error';
    }
    
    // Если статус был 'streaming' или 'submitted', проверяем статус генерации
    if ((savedStatus === 'streaming' || savedStatus === 'submitted')) {
      // Если есть imageUrl - значит генерация завершилась, показываем результат
      // НО: если идет редактирование (есть editingImageId), не считаем, что редактирование завершено
      if (savedImageUrl && !editingImageId) {
        return 'ready';
      }
      
      // Проверяем, не прошло ли слишком много времени (больше 3 минут)
      let actualStartTime = generationStartTime;
      
      // Если generationStartTime отсутствует, устанавливаем текущее время (чтобы избежать бесконечной загрузки)
      if (!actualStartTime) {
        actualStartTime = String(Date.now());
        localStorage.setItem('poster_generationStartTime', actualStartTime);
      }
      
      const startTime = parseInt(actualStartTime, 10);
      if (!isNaN(startTime)) {
        const currentTime = Date.now();
        const elapsedMinutes = (currentTime - startTime) / (1000 * 60);
        
        // Если прошло больше 3 минут, считаем генерацию устаревшей
        if (elapsedMinutes > 3) {
// Очищаем устаревшие данные генерации
          localStorage.removeItem('poster_status');
          localStorage.removeItem('poster_generatingPrompt');
          localStorage.removeItem('poster_generationStartTime');
          localStorage.removeItem('poster_editingImageId'); // Очищаем и для редактирования
          return 'ready';
        }
      }
      
      // Если промпт изменился, значит началась новая генерация
      if (generatingPrompt && generatingPrompt !== currentPrompt) {
        return savedStatus; // Новая генерация идет, показываем загрузку
      }
      // Промпт совпадает, но нет imageUrl - генерация еще не завершилась
      // Оставляем статус загрузки, чтобы показать состояние загрузки при возврате
      return savedStatus;
    }
    
    // Если статус был 'error', восстанавливаем его
    if (savedStatus === 'error') {
      return 'error';
    }
    
    // Если нет статуса генерации - проверяем наличие imageUrl
    // Если есть imageUrl - показываем готовое изображение
    if (savedImageUrl) {
      return 'ready';
    }
    
    return 'ready';
  });
  
  // Устанавливаем isLoading на основе статуса при загрузке
  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [status]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(() => {
    return localStorage.getItem('poster_isEditMode') === 'true';
  });
  const [imageHistory, setImageHistory] = useState(() => {
    const saved = localStorage.getItem('poster_imageHistory');
    if (!saved) return [];
    
    // Парсим историю и удаляем дубликаты по imageId
    const history = JSON.parse(saved);
    const seen = new Set();
    const uniqueHistory = [];
    
    for (const item of history) {
      if (item && item.imageId && !seen.has(item.imageId)) {
        seen.add(item.imageId);
        uniqueHistory.push(item);
      }
    }
    
    return uniqueHistory;
  }); // История версий изображений [{imageId, imageUrl}, ...]
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(() => {
    const saved = localStorage.getItem('poster_currentHistoryIndex');
    return saved !== null ? parseInt(saved, 10) : -1;
  }); // Текущий индекс в истории
  const pendingImageIdRef = useRef(null);
  // Ref для хранения актуальных значений состояния для использования в pollImageStatus
  const stateRef = useRef({ imageId, imageUrl, imageHistory, currentHistoryIndex, isEditMode });
  
  // Обновляем ref при изменении состояния
  useEffect(() => {
    stateRef.current = { imageId, imageUrl, imageHistory, currentHistoryIndex, isEditMode };
  }, [imageId, imageUrl, imageHistory, currentHistoryIndex, isEditMode]); // Для хранения imageId, который нужно привязать после логина

  // Сохраняем промпт в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('poster_prompt', prompt);
  }, [prompt]);

  // Сохраняем aspectRatio в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('poster_aspectRatio', aspectRatio);
  }, [aspectRatio]);

  // Сохраняем style в localStorage при изменении
  useEffect(() => {
    if (style) {
      localStorage.setItem('poster_style', style);
    } else {
      localStorage.removeItem('poster_style');
    }
  }, [style]);

  // Сохраняем imageUrl в localStorage при изменении
  useEffect(() => {
    if (imageUrl) {
      localStorage.setItem('poster_imageUrl', imageUrl);
    } else {
      localStorage.removeItem('poster_imageUrl');
    }
  }, [imageUrl]);

  // Сохраняем imageId в localStorage при изменении
  useEffect(() => {
    if (imageId) {
      localStorage.setItem('poster_imageId', imageId);
    } else {
      localStorage.removeItem('poster_imageId');
    }
  }, [imageId]);

  // Сохраняем isEditMode в localStorage при изменении
  useEffect(() => {
    if (isEditMode) {
      localStorage.setItem('poster_isEditMode', 'true');
    } else {
      // При выходе из режима редактирования сохраняем текущее изображение из истории
      if (imageHistory.length > 0 && currentHistoryIndex >= 0 && currentHistoryIndex < imageHistory.length) {
        const currentVersion = imageHistory[currentHistoryIndex];
        if (currentVersion && currentVersion.imageId && currentVersion.imageUrl) {
          setImageUrl(currentVersion.imageUrl);
          setImageId(currentVersion.imageId);
          // Сохраняем в localStorage
          localStorage.setItem('poster_imageUrl', currentVersion.imageUrl);
          localStorage.setItem('poster_imageId', currentVersion.imageId);
        }
      }
      localStorage.removeItem('poster_isEditMode');
    }
  }, [isEditMode, imageHistory, currentHistoryIndex]);

  // Сохраняем status в localStorage при изменении
  useEffect(() => {
    if (status && (status === 'streaming' || status === 'submitted' || status === 'error')) {
      localStorage.setItem('poster_status', status);
    } else if (status === 'ready') {
      localStorage.removeItem('poster_status');
      // Также удаляем generatingPrompt и время начала при установке ready
      localStorage.removeItem('poster_generatingPrompt');
      localStorage.removeItem('poster_generationStartTime');
      // Очищаем editingImageId при установке ready (генерация/редактирование завершено)
      localStorage.removeItem('poster_editingImageId');
    }
  }, [status]);
  
  // Проверяем, не завершилась ли генерация на фоне (например, после возврата на страницу)
  // Синхронизируем статус с фактическим состоянием: если есть imageUrl, но статус показывает загрузку - исправляем
  useEffect(() => {
    const savedStatus = localStorage.getItem('poster_status');
    const editingImageId = localStorage.getItem('poster_editingImageId');
    // Если статус показывает загрузку, но есть imageUrl - значит генерация завершилась на фоне
    // НО: не удаляем данные, если идет редактирование (есть editingImageId)
    if ((status === 'streaming' || status === 'submitted' || savedStatus === 'streaming' || savedStatus === 'submitted') 
        && imageUrl && !editingImageId) {
      // Только если не идет редактирование, очищаем данные генерации
      setStatus('ready');
      localStorage.removeItem('poster_status');
      localStorage.removeItem('poster_generatingPrompt');
      localStorage.removeItem('poster_generationStartTime');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]); // Проверяем при изменении imageUrl
  

  // Сохраняем imageHistory в localStorage при изменении
  useEffect(() => {
    if (imageHistory.length > 0) {
      localStorage.setItem('poster_imageHistory', JSON.stringify(imageHistory));
    } else {
      localStorage.removeItem('poster_imageHistory');
    }
  }, [imageHistory]);

  // Сохраняем currentHistoryIndex в localStorage при изменении
  useEffect(() => {
    if (currentHistoryIndex >= 0) {
      localStorage.setItem('poster_currentHistoryIndex', String(currentHistoryIndex));
    } else {
      localStorage.removeItem('poster_currentHistoryIndex');
    }
  }, [currentHistoryIndex]);

  // Восстанавливаем текущее изображение из истории при загрузке, если история существует
  useEffect(() => {
    if (imageHistory.length > 0 && currentHistoryIndex >= 0 && currentHistoryIndex < imageHistory.length) {
      const currentVersion = imageHistory[currentHistoryIndex];
      if (currentVersion && currentVersion.imageUrl && currentVersion.imageId) {
        // Восстанавливаем текущее изображение из истории
        setImageUrl(currentVersion.imageUrl);
        setImageId(currentVersion.imageId);
      }
    } else {
      // Если нет истории, проверяем, есть ли imageUrl в localStorage, который нужно восстановить
      const savedImageUrl = localStorage.getItem('poster_imageUrl');
      const savedImageId = localStorage.getItem('poster_imageId');
      if (savedImageUrl && savedImageId) {
        // Всегда восстанавливаем из localStorage, если он там есть
        setImageUrl(savedImageUrl);
        setImageId(savedImageId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Выполняем только один раз при монтировании
  
  // Восстанавливаем опрос статуса, если есть imageId но нет imageUrl и статус показывает загрузку
  useEffect(() => {
    const savedStatus = localStorage.getItem('poster_status');
    const savedImageId = localStorage.getItem('poster_imageId');
    const savedEditingImageId = localStorage.getItem('poster_editingImageId'); // Для режима редактирования
    const savedImageUrl = localStorage.getItem('poster_imageUrl');
    const savedError = localStorage.getItem('poster_error');
    const isEditModeForRestore = localStorage.getItem('poster_isEditMode') === 'true';
    
    // Если есть ошибка в localStorage, всегда восстанавливаем её
    // Это гарантирует, что ошибка будет отображена при возврате на страницу
    if (savedError) {
      setError(savedError);
      // Если статус ошибки, устанавливаем его
      if (savedStatus === 'error' || status === 'error') {
        setStatus('error');
        setIsLoading(false);
        // Очищаем editingImageId при ошибке
        if (isEditModeForRestore) {
          localStorage.removeItem('poster_editingImageId');
        }
        return; // Не продолжаем опрос, если была ошибка
      }
    }
    
    // Если статус ошибки в localStorage, но ошибка не была восстановлена выше, восстанавливаем статус
    if (savedStatus === 'error' && !savedError) {
      setStatus('error');
      setIsLoading(false);
      // Очищаем editingImageId при ошибке
      if (isEditModeForRestore) {
        localStorage.removeItem('poster_editingImageId');
      }
      return; // Не продолжаем опрос, если была ошибка
    }
    
    // Если статус показывает загрузку, начинаем опрос
    // В режиме редактирования используем editingImageId, если он есть
    const imageIdToPoll = isEditModeForRestore && savedEditingImageId ? savedEditingImageId : savedImageId;
    
    // Для обычной генерации: есть imageId, но нет imageUrl
    // Для редактирования: есть editingImageId (старое imageUrl может быть, но это не важно)
    const shouldStartPoll = (status === 'streaming' || status === 'submitted' || savedStatus === 'streaming' || savedStatus === 'submitted') 
        && imageIdToPoll 
        && (isEditModeForRestore && savedEditingImageId ? true : !savedImageUrl); // Для редактирования всегда начинаем опрос, если есть editingImageId
    
    if (shouldStartPoll) {
      setIsLoading(true);
      setStatus(savedStatus === 'streaming' ? 'streaming' : 'submitted');
      // Начинаем опрос статуса
      pollImageStatus(imageIdToPoll, isEditModeForRestore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Выполняем только один раз при монтировании
  
  // Слушаем событие очистки ошибки
  useEffect(() => {
    const handleClearError = () => {
      setError(null);
      localStorage.removeItem('poster_error');
    };
    
    window.addEventListener('clearPosterError', handleClearError);
    
    return () => {
      window.removeEventListener('clearPosterError', handleClearError);
    };
  }, []);
  
  // Слушаем событие очистки промпта
  useEffect(() => {
    const handleClearPrompt = () => {
      setPrompt('');
      localStorage.removeItem('poster_prompt');
    };
    
    window.addEventListener('clearPosterPrompt', handleClearPrompt);
    
    return () => {
      window.removeEventListener('clearPosterPrompt', handleClearPrompt);
    };
  }, []);

  // Проверяем, является ли пользователь гостем и есть ли уже сгенерированный постер
  const isGuest = !user;
  const hasGuestPoster = isGuest && imageUrl;

  // Устанавливаем pendingImageIdRef при загрузке, если гость и изображение еще не было прикреплено
  useEffect(() => {
    if (!user && imageId && !localStorage.getItem('poster_imageAttached') && !pendingImageIdRef.current) {
      pendingImageIdRef.current = imageId;
    }
  }, [imageId, user]);

  // Привязываем изображение к пользователю после логина - только один раз
  useEffect(() => {
    const attachImageToUser = async () => {
      // Если пользователь залогинился и есть imageId, который нужно привязать
      // И изображение еще не было прикреплено
      const alreadyAttached = localStorage.getItem('poster_imageAttached') === 'true';
      if (user && pendingImageIdRef.current && !alreadyAttached) {
        try {
          await attachImage(pendingImageIdRef.current);
          console.log('Image attached to user:', pendingImageIdRef.current);
          localStorage.setItem('poster_imageAttached', 'true');
          pendingImageIdRef.current = null;
        } catch (err) {
          console.error('Error attaching image:', err);
        }
      }
    };

    attachImageToUser();
  }, [user]);

  // Функция для опроса статуса изображения
  const pollImageStatus = async (imageIdToPoll, isEditModeForPoll = false) => {
    let pollTimeout = null;
    let isCancelled = false;
    
    const poll = async () => {
      if (isCancelled) return;
      
      try {
        const result = await getImage(imageIdToPoll);
        console.log('Poll result:', result);
        
        if (isCancelled) return;
        
        // Проверяем статус - если failed, прекращаем опрос
        if (result.status === 'failed') {
          if (pollTimeout) {
            clearTimeout(pollTimeout);
            pollTimeout = null;
          }
          setError('Что-то пошло не так. Попробуйте еще раз.');
          setStatus('error');
          setIsLoading(false);
          // Не удаляем poster_status, чтобы сохранить статус 'error' для восстановления
          localStorage.removeItem('poster_generatingPrompt');
          localStorage.removeItem('poster_generationStartTime');
          // В режиме редактирования очищаем editingImageId при ошибке
          if (isEditModeForPoll) {
            localStorage.removeItem('poster_editingImageId');
          }
          return;
        }
        
        // Проверяем, есть ли preview_url и статус готов
        if (result.preview_url) {
          // Изображение готово
          if (pollTimeout) {
            clearTimeout(pollTimeout);
            pollTimeout = null;
          }
          
          // Получаем актуальные значения из ref
          const currentState = stateRef.current;
          
          if (isEditModeForPoll) {
            // В режиме редактирования сохраняем текущее изображение в историю
            const newHistory = [...currentState.imageHistory];
            // Если мы не в конце истории, обрезаем историю до текущей позиции
            if (currentState.currentHistoryIndex < currentState.imageHistory.length - 1) {
              newHistory.splice(currentState.currentHistoryIndex + 1);
            }
            // Проверяем, не является ли новое изображение дубликатом последнего в истории
            const lastInHistory = newHistory[newHistory.length - 1];
            const isDuplicate = lastInHistory && lastInHistory.imageId === imageIdToPoll;
            
            // Добавляем новое отредактированное изображение только если это не дубликат
            if (!isDuplicate) {
              newHistory.push({ imageId: imageIdToPoll, imageUrl: result.preview_url });
            }
            
            setImageHistory(newHistory);
            setCurrentHistoryIndex(newHistory.length - 1);
          } else {
            // При обычной генерации сбрасываем историю
            setImageHistory([]);
            setCurrentHistoryIndex(-1);
          }
          
          setImageUrl(result.preview_url);
          setImageId(imageIdToPoll);
          
          // Сохраняем напрямую в localStorage для гарантии сохранения даже при размонтированном компоненте
          localStorage.setItem('poster_imageUrl', result.preview_url);
          localStorage.setItem('poster_imageId', imageIdToPoll);
          
          // В режиме редактирования очищаем editingImageId после успешного получения результата
          if (isEditModeForPoll) {
            localStorage.removeItem('poster_editingImageId');
          }
          
          setStatus('ready');
          setIsLoading(false);
          // Удаляем статус и промпт генерации из localStorage после успешной генерации
          localStorage.removeItem('poster_status');
          localStorage.removeItem('poster_generatingPrompt');
          localStorage.removeItem('poster_generationStartTime');
        } else {
          // Изображение еще не готово, продолжаем опрос
          if (!isCancelled) {
            pollTimeout = setTimeout(poll, 5000); // Опрашиваем каждые 5 секунд
          }
        }
      } catch (err) {
        if (isCancelled) return;
        console.error('Error polling image status:', err);
        
        // Если getImage возвращает ошибку, прекращаем опрос и показываем ошибку
        if (pollTimeout) {
          clearTimeout(pollTimeout);
          pollTimeout = null;
        }
        setError('Что-то пошло не так. Попробуйте еще раз.');
        setStatus('error');
        setIsLoading(false);
        localStorage.removeItem('poster_status');
        localStorage.removeItem('poster_generatingPrompt');
        localStorage.removeItem('poster_generationStartTime');
        // В режиме редактирования очищаем editingImageId при ошибке
        if (isEditModeForPoll) {
          localStorage.removeItem('poster_editingImageId');
        }
      }
    };
    
    // Начинаем опрос
    poll();
    
    // Возвращаем функцию очистки
    return () => {
      isCancelled = true;
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }
    };
  };

  const handleGenerate = async (data, event) => {
    event?.preventDefault();
    
    // Проверяем лимит для гостей - если гость с постером, показываем окно входа
    if (isGuest && hasGuestPoster && !isEditMode) {
      setShowAuthModal(true);
      return;
    }

    // В режиме редактирования требуем авторизацию
    if (isEditMode && !user) {
      setShowAuthModal(true);
      return;
    }

    // В режиме редактирования требуется imageId
    if (isEditMode && !imageId) {
      setError('Нет изображения для редактирования');
      return;
    }
    
    // PromptInput передает объект { text, files } или просто event
    const textPrompt = typeof data === 'object' && data.text !== undefined 
      ? data.text 
      : prompt;
    
    if (!textPrompt || !textPrompt.trim()) return;

    setIsLoading(true);
    setError(null);

    setStatus('submitted');
    // Сохраняем промпт текущей генерации в localStorage для проверки при возврате
    localStorage.setItem('poster_generatingPrompt', textPrompt);
    // Сохраняем время начала генерации для проверки устаревших генераций
    localStorage.setItem('poster_generationStartTime', String(Date.now()));
    // Очищаем старое изображение при начале новой генерации (не в режиме редактирования)
    if (!isEditMode) {
      setImageUrl(null);
      setImageId(null);
      // Также очищаем из localStorage, чтобы при возврате не показывался старый постер
      localStorage.removeItem('poster_imageUrl');
      localStorage.removeItem('poster_imageId');
    }

    try {
      setStatus('streaming');
      
      let result;
      if (isEditMode) {
        // Режим редактирования - теперь тоже асинхронный
        console.log('Editing image with:', { imageId, prompt: textPrompt, aspectRatio });
        result = await editImage(imageId, textPrompt, aspectRatio);
      } else {
        // Режим генерации
        console.log('Generating image with:', { prompt: textPrompt, aspectRatio });
        result = await generateImage(textPrompt, aspectRatio);
      }
      
      console.log('API response:', result);
      // API теперь возвращает только image_id (и для generate, и для edit)
      const newImageId = result.image_id || result.imageId;
      if (!newImageId) {
        throw new Error('Не получен image_id от сервера');
      }
      
      // Сохраняем imageId и начинаем опрос статуса
      // В режиме редактирования не меняем imageId сразу, так как текущее изображение еще отображается
      if (!isEditMode) {
        setImageId(newImageId);
        localStorage.setItem('poster_imageId', newImageId);
        
        // Для гостя сохраняем imageId для последующего attach после логина
        if (!user) {
          pendingImageIdRef.current = newImageId;
          // Сбрасываем флаг привязки при новой генерации
          localStorage.removeItem('poster_imageAttached');
        }
      } else {
        // В режиме редактирования сохраняем новый imageId для опроса
        // Но не меняем текущий imageId, пока не получим результат
        localStorage.setItem('poster_editingImageId', newImageId);
      }
      
      // Начинаем опрос статуса изображения
      pollImageStatus(newImageId, isEditMode);
    } catch (err) {

      console.error(`Error ${isEditMode ? 'editing' : 'generating'} image:`, err);
      setError(err.message || `Ошибка при ${isEditMode ? 'редактировании' : 'генерации'} изображения`);
      setStatus('error');
      // Удаляем промпт генерации и время начала при ошибке
      localStorage.removeItem('poster_generatingPrompt');
      localStorage.removeItem('poster_generationStartTime');
      if (isEditMode) {
        localStorage.removeItem('poster_editingImageId');
      }
      setIsLoading(false);
    }
  };


  const handleSave = async () => {
    // Проверяем, что есть imageId для сохранения
    if (!imageId) {
      setError('Нет изображения для сохранения');
      return;
    }

    // Проверяем, что пользователь авторизован (требуется bearerAuth)
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveImage(imageId);
      // Запускаем анимацию сохранения в навигации
      triggerSaveAnimation();
    } catch (err) {
      console.error('Error saving image:', err);
      setError(err.message || 'Ошибка при сохранении изображения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {

    // Проверяем авторизацию для редактирования
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Проверяем, что есть изображение для редактирования
    if (!imageId) {
      setError('Нет изображения для редактирования');
      return;
    }

    // Включаем режим редактирования
    setIsEditMode(true);
    
    // Сбрасываем промпт
    setPrompt('');
    
    // Инициализируем историю текущим изображением
    if (imageHistory.length === 0 && imageId && imageUrl) {
      setImageHistory([{ imageId, imageUrl }]);
      setCurrentHistoryIndex(0);
    }
  };

  // Функции навигации по истории
  const handlePreviousVersion = () => {
    if (currentHistoryIndex > 0 && currentHistoryIndex < imageHistory.length) {
      const prevIndex = currentHistoryIndex - 1;
      const prevVersion = imageHistory[prevIndex];
      if (prevVersion) {
        setCurrentHistoryIndex(prevIndex);
        setImageUrl(prevVersion.imageUrl);
        setImageId(prevVersion.imageId);
      }
    }
  };

  const handleNextVersion = () => {
    if (currentHistoryIndex >= 0 && currentHistoryIndex < imageHistory.length - 1) {
      const nextIndex = currentHistoryIndex + 1;
      const nextVersion = imageHistory[nextIndex];
      if (nextVersion) {
        setCurrentHistoryIndex(nextIndex);
        setImageUrl(nextVersion.imageUrl);
        setImageId(nextVersion.imageId);
      }
    }
  };

  // Проверяем возможность навигации: кнопки показываются только если есть соответствующие версии
  // Используем useMemo для гарантии правильного вычисления
  const canGoBack = useMemo(() => {
    const result = imageHistory.length > 1 && currentHistoryIndex > 0;
    // Отладка: проверяем что индекс строго больше 0
    if (imageHistory.length > 1 && currentHistoryIndex === 0) {
      console.log('DEBUG: canGoBack should be false, currentHistoryIndex:', currentHistoryIndex, 'history length:', imageHistory.length);
    }
    return result;
  }, [imageHistory.length, currentHistoryIndex]);
  
  const canGoForward = useMemo(() => {
    return imageHistory.length > 1 && currentHistoryIndex >= 0 && currentHistoryIndex < imageHistory.length - 1;
  }, [imageHistory.length, currentHistoryIndex]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Постер сверху - фиксированная квадратная область без прокрутки */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-6 border-b bg-background overflow-hidden">
        {(imageUrl && status !== 'streaming' && status !== 'submitted') ? (
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Стрелки навигации по версиям (только в режиме редактирования) */}
            {isEditMode && imageHistory.length > 1 && (
              <>
                {/* Кнопка "назад" - показывается только если есть предыдущая версия (индекс строго > 0) */}
                {currentHistoryIndex > 0 && imageHistory.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviousVersion();
                    }}
                    className="absolute left-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg hover:bg-background transition-colors cursor-pointer opacity-100"
                    aria-label="Предыдущая версия"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}
                {/* Кнопка "вперед" - показывается только если есть следующая версия (не последняя) */}
                {currentHistoryIndex >= 0 && currentHistoryIndex < imageHistory.length - 1 && imageHistory.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextVersion();
                    }}
                    className="absolute right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg hover:bg-background transition-colors cursor-pointer opacity-100"
                    aria-label="Следующая версия"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}
              </>
            )}
            <img
              src={imageUrl}
              alt="Сгенерированный постер"
              className="max-w-5xl max-h-full w-auto h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity select-none"
              onClick={() => {
                // Если гость с постером, показываем окно входа вместо модального окна с фото
                if (isGuest && hasGuestPoster) {
                  setShowAuthModal(true);
                } else {
                  setShowPosterModal(true);
                }
              }}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              draggable="false"
              style={{
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitUserDrag: 'none',
              }}
            />
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            {(status === 'streaming' || status === 'submitted') ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-lg">Генерация изображения...</p>
                <p className="text-sm">Пожалуйста, подождите</p>
              </div>
            ) : (
              <>
                <p className="text-lg">Здесь будет отображаться результат генерации</p>
                <p className="text-sm mt-2">Введите описание и нажмите кнопку отправки</p>
              </>
            )}
          </div>
        )}
        </div>
        

      {/* Чат промпта снизу - фиксированная область с прокруткой */}
      <div className="p-6 h-[280px] shrink-0 overflow-y-auto relative">
        {/* Кнопки действий слева - абсолютное позиционирование, не влияют на промпт */}
        {imageUrl && (
          <div className="absolute left-[calc(50%-21rem-9rem)] top-6 flex flex-col gap-2">
            <Button
              onClick={handleSave}
              variant="outline"
              className="w-32"
              disabled={isSaving || !imageId}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
            <Button
              onClick={() => {
                if (isEditMode) {
                  setIsEditMode(false);
                  // Сбрасываем промпт при выходе из режима редактирования
                  setPrompt('');
                  // При выходе из режима редактирования сохраняем текущее изображение из истории (то что на экране)
                  if (imageHistory.length > 0 && currentHistoryIndex >= 0 && currentHistoryIndex < imageHistory.length) {
                    const currentVersion = imageHistory[currentHistoryIndex];
                    if (currentVersion && currentVersion.imageId && currentVersion.imageUrl) {
                      setImageUrl(currentVersion.imageUrl);
                      setImageId(currentVersion.imageId);
                      // Сохраняем в localStorage
                      localStorage.setItem('poster_imageUrl', currentVersion.imageUrl);
                      localStorage.setItem('poster_imageId', currentVersion.imageId);
                    }
                  }
                } else {
                  handleEdit();
                }
              }}
              variant={isEditMode ? "default" : "outline"}
              className="w-32"
              disabled={!imageId}
            >
              Редактировать
            </Button>
          </div>
        )}
        {/* Промпт по центру - всегда на одном месте */}
          <div className="max-w-2xl mx-auto space-y-4">

          <PromptInput onSubmit={handleGenerate} className="[&_[data-slot=input-group]]:items-end">
            <PromptInputTextarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}

              placeholder={isEditMode ? "Введите описание изменений для изображения..." : "Введите описание постера..."}
              disabled={isLoading}
              className="!min-h-[60px] !max-h-[144px] overflow-y-auto"
              rows={1}
            />
            <PromptInputFooter>
              <PromptInputTools>
                <AspectRatioSelector
                  value={aspectRatio}
                  onValueChange={setAspectRatio}
                  disabled={isLoading}
                />
                <StyleSelector
                  value={style}
                  onValueChange={setStyle}
              disabled={isLoading}

                />
              </PromptInputTools>
              <PromptInputSubmit 
                disabled={isLoading || !prompt.trim()} 
                status={status === 'error' ? undefined : status}
                size="default"
              >
                {status === 'submitted' || status === 'streaming' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Сгенерировать'
                )}
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Генерация изображения...</span>
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>
        </div>


      {/* Модальное окно для входа/регистрации */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onSuccess={async (userData) => {
          // После успешного логина привязываем изображение к пользователю только один раз
          const alreadyAttached = localStorage.getItem('poster_imageAttached') === 'true';
          if (imageId && !alreadyAttached) {
            try {
              await attachImage(imageId);
              console.log('Image attached to user after login:', imageId);
              localStorage.setItem('poster_imageAttached', 'true');
              pendingImageIdRef.current = null;
            } catch (err) {
              console.error('Error attaching image after login:', err);
            }
          }
        }}
      />
      
      {/* Модальное окно для просмотра постера */}
      <Dialog 
        open={showPosterModal} 
        onOpenChange={(open) => {
          setShowPosterModal(open);
          if (!open) {
            setImageScale(1); // Сбрасываем масштаб при закрытии
            setIsVertical(false);
          }
        }}
      >
        <DialogContent 
          className="!max-w-[95vw] !max-h-[95vh] w-auto h-auto p-0 m-0 !translate-x-[-50%] !translate-y-[-50%] select-none"
          showCloseButton={false}
          onContextMenu={(e) => e.preventDefault()}
        >
          {imageUrl && (
            <div className="relative flex items-center justify-center">
              <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Сгенерированный постер"

                  className="object-contain relative select-none"
                  onLoad={(e) => {
                    const img = e.target;
                    const imgIsVertical = img.naturalHeight > img.naturalWidth;
                    setIsVertical(imgIsVertical);
                    // Вертикальные фото: 1.5x, горизонтальные: 1.3x
                    setImageScale(imgIsVertical ? 1.5 : 1.3);
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  draggable="false"
                  style={{
                    maxWidth: `calc(95vw / ${imageScale})`,
                    maxHeight: `calc(95vh / ${imageScale})`,
                    width: 'auto',
                    height: 'auto',
                    transform: `scale(${imageScale})`,
                    transformOrigin: 'center center',
                    display: 'block',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    WebkitUserDrag: 'none',
                    pointerEvents: 'auto',
                  }}
                />
                {/* Для вертикальных фото: только 3 знака по центру */}
                {isVertical ? (
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none"
                    style={{
                      transform: `scale(${imageScale})`,
                      transformOrigin: 'center center',
                    }}
                  >
                    <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      doposter.ru
                    </p>
                    <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      doposter.ru
                    </p>
                    <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      doposter.ru
                    </p>
            </div>
          ) : (

                  <>
                    {/* Для горизонтальных фото: 9 знаков (3 слева, 3 по центру, 3 справа) */}
                    {/* 3 водяных знака слева - прижаты к левой стороне */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 flex flex-col items-start justify-between pointer-events-none"
                      style={{
                        transform: `scale(${imageScale})`,
                        transformOrigin: 'left center',
                        paddingLeft: '0.5rem',
                        paddingTop: '0.75rem',
                        paddingBottom: '0.75rem',
                      }}
                    >
                      <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        doposter.ru
                      </p>
                      <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        doposter.ru
                      </p>
                      <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        doposter.ru
                      </p>
            </div>

                    {/* 3 водяных знака по центру */}
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none"
                      style={{
                        transform: `scale(${imageScale})`,
                        transformOrigin: 'center center',
                        paddingTop: '0.75rem',
                        paddingBottom: '0.75rem',
                      }}
                    >
                      <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        doposter.ru
                      </p>
                      <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        doposter.ru
                      </p>
                      <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        doposter.ru
                      </p>
        </div>

                    {/* 3 водяных знака справа - прижаты к правой стороне */}
                    <div 
                      className="absolute right-0 top-0 bottom-0 flex flex-col items-end justify-between pointer-events-none"
                      style={{
                        transform: `scale(${imageScale})`,
                        transformOrigin: 'right center',
                        paddingRight: '0.5rem',
                        paddingTop: '0.75rem',
                        paddingBottom: '0.75rem',
                      }}
                    >
                      <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        doposter.ru
                      </p>
                      <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        doposter.ru
                      </p>
                      <p className="text-3xl font-bold text-white/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        doposter.ru
                      </p>
          </div>

                  </>
                )}
        </div>
      </div>

          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



