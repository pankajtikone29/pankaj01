// Variables for tracking state
let currentQuestionIndex = 0;
let score = 0;
let maxQuestions = 10;
let questions = [];
let totalQuizzesTaken = 0;
let timerInterval;
let timeElapsed = 0; // Time in seconds
let timeLimit = 0;
let timerExpired = false; // Flag to prevent repeated alerts

// DOM Elements
const landingPage = document.getElementById("landing-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");
const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const stopBtn = document.getElementById("stop-btn");
const restartBtn = document.getElementById("restart-btn");
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const finalScoreElement = document.getElementById("final-score");
const totalQuizzesElement = document.getElementById("total-quizzes");
const animationElement = document.getElementById("animation");
const quizLengthSelect = document.getElementById("quiz-length");
const participationMessage = document.getElementById("participation-message");

// Fetch questions dynamically from the API
async function fetchQuestions(amount) {
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=${amount}&type=multiple`);
        if (!response.ok) throw new Error("Failed to fetch questions");
        const data = await response.json();
        questions = data.results.map(item => ({
            question: item.question,
            options: [...item.incorrect_answers, item.correct_answer].sort(() => Math.random() - 0.5),
            answer: item.correct_answer,
        }));
    } catch (error) {
        alert("Error fetching questions. Please try again later.");
    }
}

// Start the timer
function startTimer() {
    timeElapsed = 0;
    timerExpired = false;
    timerInterval = setInterval(() => {
        timeElapsed++;
        const remainingTime = timeLimit - timeElapsed;
        if (remainingTime <= 0) {
            stopTimer();
            if (!timerExpired) {
                timerExpired = true; // Prevent repeated alerts
                alert("Time's up!");
                showResults();
            }
            return;
        }

        const minutes = String(Math.floor(remainingTime / 60)).padStart(2, "0");
        const seconds = String(remainingTime % 60).padStart(2, "0");
        timerElement.textContent = `Time: ${minutes}:${seconds}`;
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Load the current question
function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const currentQuestionData = questions[currentQuestionIndex];
    questionElement.innerHTML = currentQuestionData.question;
    optionsElement.innerHTML = currentQuestionData.options
        .map(
            (option, index) =>
                `<div>
                    <input type="radio" name="answer" id="option${index}" value="${option}">
                    <label for="option${index}">${option}</label>
                </div>`
        )
        .join("");

    // Update question number
    document.getElementById("question-number").textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    // Hide the Next button initially
    nextBtn.classList.add("hidden");

    // Add event listener to show the Next button when an option is selected
    optionsElement.querySelectorAll("input[name='answer']").forEach(option => {
        option.addEventListener("change", () => {
            nextBtn.classList.remove("hidden");
        });
    });
}

// Check the answer
function checkAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (!selectedOption) {
        alert("Please select an answer!");
        return false;
    }

    const answer = selectedOption.value;
    if (answer === questions[currentQuestionIndex].answer) {
        score++;
    }

    scoreElement.textContent = `Score: ${score}`;
    return true;
}

// Show results
function showResults() {
    quizPage.classList.add("hidden");
    resultPage.classList.remove("hidden");
    stopTimer();

    totalQuizzesTaken++;
    totalQuizzesElement.textContent = `Total Quizzes Taken: ${totalQuizzesTaken}`;
    finalScoreElement.textContent = `You scored ${score} out of ${maxQuestions}`;

    // Participation message and dynamic GIF selection
    let message = "";
    let gifURL = ""; // Placeholder for GIF URLs

    if (score === maxQuestions) {
        message = "Excellent! You answered all questions correctly!";
        gifURL = "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif"; // Celebration GIF
    } else if (score >= maxQuestions * 0.7) {
        message = "Great job! You're really good at this!";
        gifURL = "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif"; // Great job GIF
    } else if (score >= maxQuestions * 0.4) {
        message = "Good try! Keep practicing, you'll get better!";
        gifURL = "https://media.giphy.com/media/26uflQxzIqAwmU3Ne/giphy.gif"; // Encouragement GIF
    } else {
        message = "Don't worry! Keep going, and you'll improve!";
        gifURL = "https://media.giphy.com/media/3o6ZsYv5CoCpaVbYQk/giphy.gif"; // Motivational GIF
    }

    participationMessage.textContent = message;

    // Set GIF dynamically
    animationElement.style.backgroundImage = `url('${gifURL}')`;
    animationElement.style.backgroundSize = "cover";
    animationElement.style.backgroundPosition = "center";
}

// Button Event Listeners
startBtn.addEventListener("click", async () => {
    maxQuestions = parseInt(quizLengthSelect.value);
    timeLimit = maxQuestions * 25; // 25 seconds per question

    landingPage.classList.add("hidden");
    quizPage.classList.remove("hidden");
    currentQuestionIndex = 0;
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    timerElement.textContent = `Time: ${String(Math.floor(timeLimit / 60)).padStart(2, "0")}:${String(timeLimit % 60).padStart(2, "0")}`;

    await fetchQuestions(maxQuestions);
    loadQuestion();
    startTimer();
});

nextBtn.addEventListener("click", () => {
    if (checkAnswer()) {
        currentQuestionIndex++;
        loadQuestion();
    }
});

stopBtn.addEventListener("click", showResults);

restartBtn.addEventListener("click", () => {
    resultPage.classList.add("hidden");
    landingPage.classList.remove("hidden");
});

// Exit button functionality
document.getElementById("exit-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to exit?")) {
        window.location.href = "goodbye.html"; // Redirect to goodbye page
    }
});