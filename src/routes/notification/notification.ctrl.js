import createError from 'http-errors';
import Joi from 'joi';
import { startSession } from 'mongoose';
import { Notification } from '../../models';

/**
 * @description 모든 알림 확인
 * @access GET /notification
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 사용자의 모든 알림
 */
export const getNoti = async (req, res, next) => {
  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      const notiData = await Notification.getNotiList(res.locals.uid).session(session);
      console.log(`[INFO] 유저 ${res.locals.uid} 가 알림을 확인했습니다.`);
      return res.status(200).json({
        result: 'ok',
        data: notiData,
      });
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'));
  }
};

/**
 * @description 특정 알림 읽음 처리
 * @access PATCH /notification
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns -
 */
export const setRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ _id: req.body.notiId, userId: res.locals.uid }, { read: true });// direct use model must change dao
    console.log(`[INFO] 유저 ${res.locals.uid} 가 알림을 ${req.body.notiId} 를 확인했습니다.`);
    return res.status(200).json({
      result: 'ok',
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'));
  }
};

/**
 * @description 모든 알림 읽음처리
 * @access PATCH /notification/all
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns -
 */
export const setReadAll = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: res.locals.uid }, { read: true });// direct use model must change dao
    console.log(`[INFO] 유저 ${res.locals.uid} 가 알림을 모두 읽음처리 했습니다.`);
    return res.status(200).json({
      result: 'ok',
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'));
  }
};

/**
 * @description 새로운 알림 유무
 * @access GET /notification/check
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 새로운 알림 유무(true/false)
 */
export const checkNotified = async (req, res, next) => {
  try {
    const notified = await Notification.find({ userId: res.locals.uid, read: false }, { _id: 1 });// direct use model must change dao
    let notiCount = 0;
    if (notified) {
      notiCount = notified.length;
    }

    console.log(`[INFO] 유저 ${res.locals.uid} 가 알림유무를 확인했습니다.`);
    return res.status(200).json({
      result: 'ok',
      data: { notiCount },
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'));
  }
};

/**
 * @description 알림 삭제
 * @access DELETE /notification
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns -
 */
export const deleteNoti = async (req, res, next) => {
  const notiObjectId = Joi.object({
    _id: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
  });

  try {
    await notiObjectId.validateAsync({
      _id: req.body.notiId,
    });
  } catch (e) {
    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 적절하지 않은 알림 ${req.body.notiId} 을 삭제처리 하려 했습니다.`
    );
    return next(createError(400, '적절하지 않은 ObjectId입니다.'));
  }

  try {
    await Notification.deleteOne({ _id: req.body.notiId });// direct use model must change dao
    console.log(`[INFO] 유저 ${res.locals.uid} 가 알림 ${req.body.notiId} 를 삭제했습니다.`);
    return res.status(200).json({
      result: 'ok',
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'));
  }
};

/**
 * @description 모든 알림 삭제
 * @access DELETE /notification/all
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns -
 */
export const deleteAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: res.locals.uid });// direct use model must change dao
    console.log(`[INFO] 유저 ${res.locals.uid} 가 모든 알림을 삭제했습니다.`);
    return res.status(200).json({ result: 'ok' });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError('알 수 없는 오류가 발생했습니다.'));
  }
};
