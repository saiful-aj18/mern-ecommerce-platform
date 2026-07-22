const redis = require("../config/redis");
const { newSessionId, hashToken } = require("./token.service");


const REFRESH_TTL = () => {

    const raw = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
    const m = /^(\d+)([smhd])$/.exec(raw);
    if (!m) return 7 * 86400;
    const [, n, unit] = m;
    const mul = { s: 1, m: 60, h: 3600, d: 86400 }[unit];
    return Number(n) * mul;
};


const sessionKey = (sid) => `auth:session:${sid}`;

const saveSession = async ({sid, userId, refreshToken, userAgent}) => {
    // const sid = newSessionId();
    const refreshHash = hashToken(refreshToken);
    const key = sessionKey(sid);
    await redis.hset(key, {
        userId: userId.toString(),
        refreshHash,
        createdAt: new Date().toISOString(),
        ua: userAgent || "unknown"
    });

    await redis.expire(key, REFRESH_TTL());
    return sid;
}

const getSession = async (sid) => {
    const data = await redis.hgetall(sessionKey(sid));
    if (!data || Object.keys(data).length === 0) return null;
    return data;
};

const deleteSession = async (sid) => {
    await redis.del(sessionKey(sid));
};

const rotateSession = async ({ oldSid, sid, userId, newRefreshToken, userAgent }) => {
    await deleteSession(oldSid);
    return saveSession({ sid, userId, refreshToken: newRefreshToken, userAgent });
};

module.exports = { saveSession, getSession, deleteSession, rotateSession };