import { saveQuestionAnswer, saveQuestion } from '../utils/api'
import { showLoading, hideLoading } from 'react-redux-loading'

export const RECEIVE_QUESTIONS = 'RECEIVE_QUESTIONS'
export const ADD_QUESTION = 'ADD_QUESTION'
export const ANSWER_QUESTION = 'ANSWER_QUESTION'

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

        // Track successful question creation
        if (typeof pendo !== 'undefined') {
          pendo.track('question_created', {
            question_id: question.id,
            author: authedUser
          })
        }
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

        // Track successful vote submission
        const { questions } = getState()
        if (typeof pendo !== 'undefined') {
          pendo.track('vote_submitted', {
            question_id: qid,
            selected_option: answer,
            author_of_question: questions[qid] ? questions[qid].author : 'unknown'
          })
        }
      })
      .then(() => dispatch(hideLoading()))
  }
}