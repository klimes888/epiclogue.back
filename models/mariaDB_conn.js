const mariadb = require('mariadb');
const dotenv = require('dotenv');

dotenv.config();

const pool = mariadb.createPool({
    host: process.env.DBHost, port: process.env.DBPort,
    user: process.env.DBUser, password: process.env.DBPass,
    connectionLimit: 5, database: process.env.DBdb
});
 
async function GetUserList(){
    let conn, rows;
    try{
        conn = await pool.getConnection();
        rows = await conn.query('SELECT * FROM user');
    }
    catch(err){
        throw err;
    }
    finally{
        if (conn) conn.end();
        return rows;
    }
}

async function GetSalt(userId){
    let conn, result;
    try{
        conn = await pool.getConnection();
        result = await conn.query('SELECT salt FROM user where id=?', [userId]);
    }catch(err){
        throw err;
    }finally{
        if(conn) conn.end();
        if (result != '') {
            return result[0].salt;
        }
        else {
            return false;
        }
    }
}

async function IsLogin(userId, userPw){
    let conn, result;
    try {
        conn = await pool.getConnection();
        result = await conn.query('SELECT * FROM user where id=? and pw=?', [userId, userPw])
    } catch(err){
        throw err;
    } finally{
        if(conn) conn.end();
        return result;
    }
}

async function GetUserProfile(uuid) {
    let conn, result;
    try {
        conn = await pool.getConnection();
        result = await conn.query('SELECT id, nickname, intro FROM user WHERE uuid=?', [uuid]);
    } catch(err) {
        throw err;
    } finally {
        if (conn) conn.end();
        return result
    }
}

async function GetUserPost(uuid) {
    let conn, result;
    try {
        conn = await pool.getConnection();
        result = await conn.query('SELECT post_id, title FROM board WHERE uuid=?', [uuid])
    } 
    catch (err) {
        throw err;
    }
    finally {
        if (conn) conn.end();
        return result;
    }
}

async function JoinUser(userId, userPw, salt){
    let conn, result, isMatch;
    conn = await pool.getConnection();
    isMatch = await conn.query('SELECT * FROM user where id=?', [userId])

    if(isMatch.length < 1){
        conn.query('INSERT INTO user(id, pw, salt) VALUES(?,?,?)', [userId, userPw, salt])
        result = true
    }
    else{
        result = false
    }

    if(conn) conn.end();

    return result
}

async function ChangePass(userId, userPw, userPwNew, saltNew){
    let conn, isMatch, result
    conn = await pool.getConnection();
    isMatch = await conn.query('SELECT * FROM user where id=? and pw=?', [userId, userPw])
    if(isMatch.length > 0){
        try{
            await conn.query('UPDATE user set pw=?, salt=? where id=?', [userPwNew, saltNew, userId])
            result = true
        } catch(err) {
            throw err;
        }
    }
    else{
        result = false
    }

    if(conn) conn.end();
    return result
}

async function DelAccount(userId, userPw){
    let conn, result
    conn = await pool.getConnection();
    isMatch = await conn.query('SELECT * FROM user where id=? and pw=?', [userId, userPw])
    if(isMatch.length > 0){
        try{
            await conn.query('DELETE FROM user where id=?', [userId]);
            result = true
        } catch(err) {
            return false
        }
    }
    else{
        result = false
    }

    if(conn) conn.end();
    return result
}

async function ShowBoard() {
    let conn, result;
    try {
        conn = await pool.getConnection();
        conn.query('USE lunacat');
        result = await conn.query(`SELECT title, post_id FROM board`);
    }
    catch (err) {
        throw err;
    }
    finally {
        if(conn) conn.end();
        return result;
    }
}

async function GetUserUUID(userID) {
    let conn, result;
    try {
        conn = await pool.getConnection();
        result = await conn.query('SELECT uuid FROM user WHERE id=?', [userID]);
        console.log(result);
    } 
    catch (err) {
        throw err;
    }
    finally {
        if (conn) conn.end();
    return result[0].uuid;
    }
}

async function GetPostUUID(postID) {
    let conn, result;
    try {
        conn = await pool.getConnection();
        result = await conn.query('SELECT uuid FROM board WHERE post_id=?', [postID]);
    } 
    catch (err) {
        throw err;
    }
    finally {
        if (conn) conn.end();
    return result[0].uuid;
    }
}

async function ShowPost(postID) {
    let conn, result;
    try {
        conn = await pool.getConnection();
        conn.query('USE lunacat');
        result = await conn.query(`SELECT * FROM board WHERE post_id=?`, [postID]);
    }
    catch (err) {
        throw err;
    }
    finally {
        if(conn) conn.end();
        return result;
    } 
}

async function Posting(title, content, uuid) {
    let conn, result;
    try {
        conn = await pool.getConnection();
        conn.query(`INSERT INTO board (title, content, uuid) VALUES (?, ?, ?)`, [title, content, uuid]);
        result = await conn.query(`SELECT MAX(post_id) from board`)
        // console.log(temp[0]['MAX(post_id)']);
    }
    catch (err) {
        throw err;
    }
    finally {
        if (conn) conn.end();
        return result;
    }
}

async function UpdatePost(postID, title, content) {
    let conn, result;
    try {
        conn = await pool.getConnection();
        await conn.query(`UPDATE board SET title=? , content=? WHERE post_id=?`, [title, content, postID]);
        result = true;
    }
    catch (err) {
        throw err;
    }
    finally {
        if(conn) conn.end();
        return result;
    }
}

async function DelPost(postID) {
    let conn, result;
    try {
        conn = await pool.getConnection();
        await conn.query(`DELETE FROM board WHERE post_id=?`, [postID]);
        result = true;
    }
    catch (err) {
        throw err;
    }
    finally {
        if(conn) conn.end();
        return result;
    }
}

module.exports = {
    getUserList: GetUserList,
    isLogin: IsLogin,
    joinUser: JoinUser,
    getSalt: GetSalt,
    // getUserProfileShort: GetUserProfileShort,
    changePass: ChangePass,
    delAccount: DelAccount,
    showBoard: ShowBoard,
    showPost: ShowPost,
    posting: Posting,
    updatePost: UpdatePost,
    delPost: DelPost,
    getUserProfile: GetUserProfile,
    getPostUUID: GetPostUUID,
    getUserUUID: GetUserUUID,
    getUserPost: GetUserPost
}