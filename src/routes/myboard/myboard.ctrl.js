import * as models from '../../models'
import Joi from 'joi'
import createError from 'http-errors'
import { getBookmarkList } from '../interaction/bookmark/bookmark.ctrl'

export const allWorks = async (req, res, next) => {

}

export const myContents = async (req, res, next) => {

}

export const secondaryWorks = async (req, res, next) => {

}

export const bookmarks = (req, res, next) => {
  return getBookmarkList(req, res, next)
}