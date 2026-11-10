import { saveQuestionAnswer, saveQuestion } from '../utils/api'
import { showLoading, hideLoading } from 'react-redux-loading'

export const RECEIVE_QUESTIONS = 'RECEIVE_QUESTIONS'
export const ADD_QUESTION = 'ADD_QUESTION'
export const ANSWER_QUESTION = 'ANSWER_QUESTION'

// Sends a Pendo Track Event without letting tracking failures break the app flow
function trackPendoEvent (eventName, properties) {
  try {
    if (window.pendo && typeof window.pendo.track === 'function') {
      window.pendo.track(eventName, properties)
    }
  } catch (e) {
    // Ignore tracking errors
  }
}

export function receiveQuestions (questions) {
  return {
    type: RECEIVE_QUESTIONS,
    questions,
  }
}

function addQuestion (question) {
  return {
    type: ADD_QUESTION,
    question,
  }
}

export function handleAddQuestion (optionOneText, optionTwoText) {
  return (dispatch, getState) => {
    const { authedUser } = getState()

    dispatch(showLoading())

    return saveQuestion({
      author: authedUser,
      optionOneText,
      optionTwoText
    })
      .then((question) => {
        dispatch(addQuestion(question))
        // Track that the new question was successfully saved
        trackPendoEvent('question_created', {
          question_id: question.id,
          option_one_length: optionOneText.length,
          option_two_length: optionTwoText.length,
          timestamp: question.timestamp
        })
      })
      .then(() => dispatch(hideLoading()))
  }
}

function answerQuestion (qid, answer, authedUser) {
  return {
    type: ANSWER_QUESTION,
    qid,
    answer,
    authedUser
  }
}

export function handleAnswerQuestion (qid, answer) {
  return (dispatch, getState) => {
    const { authedUser } = getState()

    dispatch(showLoading())

    return saveQuestionAnswer({
      authedUser,
      qid,
      answer
    })
      .then(() => {
        dispatch(answerQuestion(qid, answer, authedUser))
        // Track that the vote was successfully saved
        const question = getState().questions[qid]
        trackPendoEvent('question_answered', {
          question_id: qid,
          answer,
          question_author: question ? question.author : undefined,
          total_votes_after: question
            ? question.optionOne.votes.length + question.optionTwo.votes.length
            : undefined
        })
      })
      .then(() => dispatch(hideLoading()))
  }
}