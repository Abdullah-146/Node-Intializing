import RefreshToken from "../models/refreshToken.js";

class RefreshTokenDAL {
  async createRefreshToken(data) {
    try {
      let refreshToken = new RefreshToken(data);
      return await refreshToken.save({ validateBeforeSave: true });
    } catch (err) {
      throw err;
    }
  }

  async findRefreshTokenByTokenByUserId(userId) {
    try {
      let refreshToken = await RefreshToken.findOne({ userId: userId });
      return refreshToken;
    } catch (err) {
      throw err;
    }
  }

  async findByToken(token) {
    try {
      let refreshToken = await RefreshToken.findOne({ refreshToken: token });
      return refreshToken;
    } catch (err) {
      throw err;
    }
  }

  async deleteRefreshTokenByUserId(userId) {
    try {
      let response = await RefreshToken.findOneAndDelete({ userId: userId });
      if (!response) {
        return false;
      }
      return true;
    } catch (err) {
      throw err;
    }
  }
}

export default new RefreshTokenDAL();
