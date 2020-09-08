import Users from "../../models/users";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import util from 'util'
import crypto from 'crypto'
const SECRET_KEY = process.env.SECRET_KEY;
const randomBytesPromise = util.promisify(crypto.randomBytes);
const pbkdf2Promise = util.promisify(crypto.pbkdf2);
import transporter from "../../lib/sendMail";

dotenv.config()

export const login = async function (req, res, next) {
    const email = req.body["email"];
    const userPw = req.body["userPw"];
  
    const user = await Users.getSalt(email);
    if (user) {
      const crypt_Pw = await pbkdf2Promise(
        userPw,
        user["salt"],
        93782,
        64,
        "sha512"
      );
  
      const result = await Users.findUser(email, crypt_Pw.toString("base64"));
      if (result) {
        const token = jwt.sign(
          {
            nick: result["nickname"],
            uid: result["_id"],
            isConfirmed: result["isConfirmed"],
          },
          SECRET_KEY,
          {
            expiresIn: process.env.JWT_EXPIRES_IN,
          }
        );
  
        return res.status(200).json({
          result: "ok",
          token,
          nick: result.nickname,
          userId: result.userid,
        });
      } else {
        return res.status(400).json({
          result: "error",
          message: "잘못된 비밀번호 입니다.",
        });
      }
    } else {
      return res.status(404).json({
        result: "error",
        message: "유저를 찾을 수 없습니다.",
      });
    }
  };
  
export const join = async function (req, res, next) {
    const email = req.body["email"];
    const userPw = req.body["userPw"];
    const userPwRe = req.body["userPwRe"];
    const nick = req.body["userNick"];
    const check = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(
      userPw
    );
    // 이메일 인증 추가필요
    if (check) {
      if (userPw == userPwRe) {
        /* 중복 가입 이메일 처리 */
        if ((await Users.isExist(email)) != null) {
          return res.status(400).json({
            result: "error",
            message: "중복된 이메일입니다. 다른 이메일로 가입해주세요.",
          });
        }
        const generatedId = await crypto
          .createHash("sha256")
          .update(email)
          .digest("hex")
          .slice(0, 14);
        const salt = await randomBytesPromise(64);
        const crypt_Pw = await pbkdf2Promise(
          userPw,
          salt.toString("base64"),
          93782,
          64,
          "sha512"
        );
        const auth_token = crypt_Pw.toString("base64").substr(0, 10);
        const result = await Users.create({
          email: email,
          password: crypt_Pw.toString("base64"),
          salt: salt.toString("base64"),
          nickname: nick,
          token: auth_token,
          screenId: generatedId,
        });
        if (result) {
          const option = {
            from: process.env.MAIL_USER,
            to: email,
            subject: "이메일 인증을 완료해주세요.",
            html:
            `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html html="" xmlns="http://www.w3.org/1999/xhtml" style="margin: 0; padding: 0;">
            
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <title>Document</title>
                
            </head>
            
            <body style="margin: 0; padding: 0; background: #F7F7F7;">
                <center class="wrapper" style="margin: 0; padding: 0; width: 100%; table-layout: fixed; background: #2222; padding-bottom: 30px;">
                    <div class="webkit" style="margin: 0; padding: 0; max-width: 480px; background: #fff;">
                        <table class="templet" align="center" style="border-collapse: collapse; border-radius: 12px; margin: 0 auto; width: 100%; text-align: center; border-spacing: 0; padding: 20px; font-family: sans-serif; color: #6A6877;" width="100%">
                            <tr style="margin: 0; padding: 0;">
                                <td style="margin: 0; padding: 0;">
                                    <table width="100%" style="margin: 0; padding: 0; border-collapse: collapse; border-spacing: 0;">
                                        <tr style="margin: 0; padding: 0;">
                                            <td style="margin: 0; padding: 0; background: #fff; padding-top: 20px; text-align: center;" align="center">
                                                <p style="margin: 0; padding: 0; font-size: 24px; font-weight: 700; color: rgba(21, 146, 230, 0.8);">welcome to EpicLogue</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <table width="100%" style="margin: 0; padding: 0; border-collapse: collapse; border-spacing: 0;" align="center">
                                <tr style="margin: 0; padding: 0;">
                                    <td style="margin: 0; padding: 0; text-align: center; margin-left: 0 auto;" align="center">
                                        <p style="margin: 0; padding: 0; font-size: 20px; font-weight: 700; color: rgb(113,113,113); margin-top: 12px; margin-bottom: 18px;">Where imagination comes true!</p>
            
            
                                    </td>
                                </tr>
                            </table>
                            <tr style="margin: 0; padding: 0;">
                                <td style="margin: 0; padding: 0;">
                                    <p class="contents" style="margin: 0; font-size: 16px; font-weight: 600; color: #6A6877; padding: 12px 0;">더 많은 작품을 공유해보세요</p>
                                </td>
                            </tr>
                            <tr style="margin: 0; padding: 0;">
                                <td style="margin: 0; padding: 0;">
                                    <p class="contents" style="margin: 0; font-size: 16px; font-weight: 600; color: #6A6877; padding: 12px 0;">더욱 편리한 서비스를 느껴보세요</p>
                                </td>
                            </tr>
                            <tr style="margin: 0; padding: 0;">
                                <td style="margin: 0; padding: 0;">
                                    <p class="contents" style="margin: 0; font-size: 16px; font-weight: 600; color: #6A6877; padding: 12px 0;">작가와 직접 소통 해보세요</p>
                                </td>
                            </tr>
                            <tr style="margin: 0; padding: 0;">
                                <td style="margin: 0; padding: 0;">
                                    <div style="padding: 0; border: 2px solid #2222; margin: 25px 40px;"></div>
                                </td>
                            </tr>
                            <tr style="margin: 0; padding: 0;">
                                <td style="margin: 0; padding: 0;">
                                    <p style="margin: 0; padding: 0; padding-bottom: 30px; font-size: 16px; color: rgba(21, 146, 230, 1); font-weight: 700;">인증버튼을 클릭 하시면 서비스 이용이 가능해요</p>
                                </td>
                            </tr>
                                            <tr style="margin: 0; padding: 0;">
                                <td style="margin: 0; padding: 0;">
                                    <a href="https://api.epiclogue.tk/auth/mailAuth?email=${email}&token=${auth_token}" style="margin: 0; padding: 0;"><button class="button" style="margin: 0; padding: 0; all: unset; display: inline-block; width: 70%; height: 42px; background: rgba(21, 146, 230, 0.8); border-radius: 25px; font-size: 16px; font-weight: 700; line-height: 42px; text-decoration: none; color: #fff;">인증하기</button></a>
                                </td>
                            </tr>
                                                            <tr style="margin: 0; padding: 0;">
                                <td style="margin: 0; padding: 0;">
                                    <p style="margin: 0; padding: 40px 0; font-size: 12px; font-weight: 700; color: #A6A4B2;">Designed by Lunarcat</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </center>
            </body>
            
            </html>
          `
          };
  
          transporter.sendMail(option, function (error, info) {
            if (error) {
              console.log(error);
              res.status(401).json({
                result: "error",
                reason: error,
              });
            } else {
              console.log(info.response);
              return res.status(201).json({
                result: "ok",
                info: info.response,
              });
            }
          });
        } else {
          return res.status(401).json({
            result: "error",
            message: "이미 존재하는 아이디 입니다. 다시 시도해주세요!",
          });
        }
      } else {
        return res.status(401).json({
          result: "error",
          message: "패스워드가 일치하지 않습니다!",
        });
      }
    } else {
      return res.status(401).json({
        result: "error",
        message: "비밀번호 규칙을 다시 확인해주세요.",
      });
    }
  };
  
export const mailAuth = async function (req, res, next) {
    const email = req.query.email;
    const token = req.query.token;
    try {
      const result = await Users.isConfirmed(email, token);
      if (result) {
        await Users.confirmUser(email);
        return res.status(201).json({
          result: "ok",
        });
      } else {
        return res.status(401).json({
          result: "error",
          message: "인증실패",
        });
      }
    } catch (e) {
      console.error(`[Error] ${e}`);
      return res.status(500).json({
        result: "error",
        message: e.message,
      });
    }
  };