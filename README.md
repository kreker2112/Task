# Короткий опис виконаної роботи:

## Виконана робота:
### 1) Створення нової сторінки для календаря:
 - Додано сторінку Calendar, яка містить компонент календаря.
 - Додано пункт меню, який веде на нову сторінку Calendar.
   
### 2) Інтерактивний календар:
 - Календар підтримує три режими відображення: день, тиждень та місяць.
 - Для перемикання між режимами додані відповідні кнопки.

### 3) Функціональність подій:
 - Реалізовано створення нових подій з можливістю вибору дати та часу.
 - Додано можливість редагування існуючих подій.
 - Додано функціонал для перетягування подій між різними датами та часовими інтервалами.

### 4) Візуальне оформлення:
 - Календар оформлено у відповідності до загального стилю програми.
 - Додано адаптивне оформлення для коректного відображення на десктопах, планшетах та мобільних пристроях.

### 5) Управління даними:
 - Використано Pinia для управління станом календаря, зокрема для зберігання та маніпуляції подіями.
   
### 6) Використані технології та бібліотеки:
 - Vue 3: Основний фреймворк для побудови інтерфейсу користувача.
 - Nuxt 3: Фреймворк на базі Vue для створення серверних додатків.
 - TypeScript: Використано для забезпечення типізації та покращення якості коду.
 - Pinia: Сучасна бібліотека управління станом для Vue, використовувана для зберігання та обробки даних подій.
 - dayjs: Бібліотека для роботи з датами, використана для маніпуляції та форматування дат.

## Створені файли:
   
 - pages/calendar.vue сторінка календаря, що містить в собі компонент календаря
 - components/CalendarComponent.vue: Інтерактивний компонент календаря з можливістю створення, редагування та перетягування подій.
 - теку і файл сховища для роботи з Pinia: store/calendarStore.ts
 - landing.vue: Додано пункт меню для переходу на сторінку календаря у змінну links.
 - styles: Додано адаптивне оформлення для календаря.
   
