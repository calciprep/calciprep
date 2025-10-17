// A centralized service for fetching all static data from the public folder.

/**
 * Fetches the quiz data for a specific category.
 * @param {string} category - The category of the quiz (e.g., 'Synonyms').
 * @returns {Promise<Array|null>} A promise that resolves to the array of quizzes for that category, or null on error.
 */
export const getQuizData = async (category) => {
  const fileName = category.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '.json';
  try {
    const response = await fetch(`/data/${fileName}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not fetch quiz data:", error);
    return null;
  }
};

/**
 * Fetches the paragraphs for the main typing test.
 * @returns {Promise<Array|null>} A promise that resolves to the array of typing test paragraphs, or null on error.
 */
export const getTypingParagraphs = async () => {
  try {
    const response = await fetch('/data/typing-paragraphs.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.typing_tests;
  } catch (error) {
    console.error("Could not fetch typing paragraphs:", error);
    return null;
  }
};

/**
 * Fetches the exercises for the "Learn Keys" section.
 * @returns {Promise<Object|null>} A promise that resolves to the learn keys exercises object, or null on error.
 */
export const getLearnKeysExercises = async () => {
    try {
        const response = await fetch('/data/learn-keys-exercises.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.categories;
    } catch (error) {
        console.error("Could not fetch learn keys exercises:", error);
        return null;
    }
};

/**
 * Fetches the words for the "Practice Words" section.
 * @returns {Promise<Object|null>} A promise that resolves to the practice words object, or null on error.
 */
export const getPracticeWords = async () => {
    try {
        const response = await fetch('/data/practice-words.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.categories;
    } catch (error) {
        console.error("Could not fetch practice words:", error);
        return null;
    }
};

/**
 * Fetches the paragraphs for the "Type Paragraphs" section in Learn Typing.
 * @returns {Promise<Array|null>} A promise that resolves to the array of paragraphs, or null on error.
 */
export const getTypeParagraphs = async () => {
    try {
        const response = await fetch('/data/type-paragraphs.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Could not fetch type paragraphs:", error);
        return null;
    }
};

