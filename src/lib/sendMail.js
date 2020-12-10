import mailer from 'nodemailer'
import dotenv from 'dotenv'
import aws from 'aws-sdk'
dotenv.config()

aws.config.loadFromPath(__dirname + "/aws.config.json")

const transporter = mailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01'
  })
})

export const emailText = (email, auth_token) => {
  return `
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
                          <a href="https://www.epiclogue.com/auth/auth?email=${email}&token=${auth_token}" style="margin: 0; padding: 0;"><button class="button" style="margin: 0; padding: 0; all: unset; display: inline-block; width: 70%; height: 42px; background: rgba(21, 146, 230, 0.8); border-radius: 25px; font-size: 16px; font-weight: 700; line-height: 42px; text-decoration: none; color: #fff;">인증하기</button></a>
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
}

export const findPassText = (email, authToken) => {
    return `
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
                            <div style="padding: 0; border: 2px solid #2222; margin: 25px 40px;"></div>
                        </td>
                    </tr>
                    <tr style="margin: 0; padding: 0;">
                        <td style="margin: 0; padding: 0;">
                            <p style="margin: 0; padding: 0; padding-bottom: 30px; font-size: 16px; color: rgba(21, 146, 230, 1); font-weight: 700;">인증버튼을 클릭 하시면 비밀번호 재설정이 가능해요</p>
                        </td>
                    </tr>
                                    <tr style="margin: 0; padding: 0;">
                        <td style="margin: 0; padding: 0;">
                            <a href="https://www.epiclogue.com/auth/findPass?email=${email}&token=${authToken}" style="margin: 0; padding: 0;"><button class="button" style="margin: 0; padding: 0; all: unset; display: inline-block; width: 70%; height: 42px; background: rgba(21, 146, 230, 0.8); border-radius: 25px; font-size: 16px; font-weight: 700; line-height: 42px; text-decoration: none; color: #fff;">인증하기</button></a>
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
}

export default transporter
