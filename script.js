const STORAGE_KEY = 'springMvcLearningDetails';

function readSavedDetails() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {};
    }

    const details = JSON.parse(saved);
    return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
  } catch (error) {
    console.error('Could not read saved form details:', error);
    return {};
  }
}

function saveDetails(details) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    return true;
  } catch (error) {
    console.error('Could not save form details:', error);
    return false;
  }
}

function showFieldError(field, message) {
  const error = document.getElementById(`${field.id}-error`);
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  error.textContent = message;
}

function initializeForm() {
  const form = document.getElementById('details-form');
  const username = document.getElementById('username');
  const email = document.getElementById('email');
  const summary = document.getElementById('summary');
  const fields = [username, email, summary];
  const saved = readSavedDetails();

  username.value = typeof saved.username === 'string' ? saved.username : '';
  email.value = typeof saved.email === 'string' ? saved.email : '';
  summary.value = typeof saved.summary === 'string' ? saved.summary : '';

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      showFieldError(field, '');
      saveDetails({
        username: username.value,
        email: email.value,
        summary: summary.value
      });
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const summaryValue = summary.value.trim();
    const errors = {
      username: '',
      email: '',
      summary: ''
    };

    if (!usernameValue) {
      errors.username = 'Please enter a username.';
    } else if (!/^[A-Za-z]+$/.test(username.value)) {
      errors.username = 'Use English letters only (A–Z), with no spaces, numbers, or symbols.';
    }

    if (!emailValue) {
      errors.email = 'Please enter your email address.';
    } else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(emailValue)) {
      errors.email = 'Enter a valid email address ending in @gmail.com.';
    }

    if (!summaryValue) {
      errors.summary = 'Please enter a short summary.';
    }

    showFieldError(username, errors.username);
    showFieldError(email, errors.email);
    showFieldError(summary, errors.summary);

    saveDetails({
      username: username.value,
      email: email.value,
      summary: summary.value
    });

    const firstInvalidField = fields.find((field) => errors[field.name]);
    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    window.location.href = 'success.html';
  });
}

function initializeSuccessPage() {
  const saved = readSavedDetails();
  const details = [
    ['submitted-username', saved.username],
    ['submitted-email', saved.email],
    ['submitted-summary', saved.summary]
  ];

  details.forEach(([id, value]) => {
    document.getElementById(id).textContent = typeof value === 'string' && value.trim()
      ? value
      : 'No information submitted.';
  });
}

function initializeQuiz() {
  const form = document.getElementById('quiz-form');
  const results = document.getElementById('quiz-results');
  const score = document.getElementById('quiz-score');
  const feedback = document.getElementById('quiz-feedback');
  const questions = Array.from(form.querySelectorAll('[data-correct]'));

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let correctCount = 0;
    feedback.replaceChildren();

    questions.forEach((question, index) => {
      const selected = question.querySelector('input:checked');
      const correctInput = question.querySelector(`input[value="${question.dataset.correct}"]`);
      const correctAnswer = correctInput.closest('label').textContent.trim();
      const isCorrect = selected !== null && selected.value === question.dataset.correct;

      if (isCorrect) {
        correctCount += 1;
      }

      const resultItem = document.createElement('li');
      const questionText = document.createElement('strong');
      const status = document.createElement('span');
      const answer = document.createElement('p');

      resultItem.className = isCorrect ? 'quiz-result-correct' : 'quiz-result-incorrect';
      questionText.textContent = `Question ${index + 1}: `;
      status.textContent = isCorrect ? 'Correct' : selected ? 'Incorrect' : 'Not answered';
      answer.textContent = `Your answer: ${selected ? selected.closest('label').textContent.trim() : 'No answer selected.'} Correct answer: ${correctAnswer}`;
      resultItem.append(questionText, status, answer);
      feedback.append(resultItem);
    });

    score.textContent = `Your score: ${correctCount} out of ${questions.length}`;
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

const currentPage = document.body.dataset.page;
if (currentPage === 'form') {
  initializeForm();
} else if (currentPage === 'success') {
  initializeSuccessPage();
} else if (currentPage === 'quiz') {
  initializeQuiz();
}
