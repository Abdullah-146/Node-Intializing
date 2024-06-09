import UserDAL from "../dal/user.js";
import RefreshTokenDAL from "../dal/refreshToken.js";
import auth from "../utils/auth.js";
import BadRequest from "../errors/badRequest.js";
import ValidationError from "../errors/validationError.js";
import NotFound from "../errors/notFound.js";

class AuthService {
  constructor() {
    this.userDAL = UserDAL;
    this.refreshTokenDAL = RefreshTokenDAL;
  }

  async signup(data) {
    try {
      let { password, ...userObj } = data;

      //hashing password before storing in DB
      let hashedPassword = await auth.hashPassword(10, password);
      const user = await this.userDAL.createUser({
        ...userObj,
        password: hashedPassword,
      });
      if (!user) {
        throw new BadRequest("Check your request and try again!");
      }

      //generating access token and refresh token
      let accessToken = auth.accessTokenGenerator({
        _id: user._id,
        email: user.email,
      });
      let refreshToken = auth.refreshTokenGenerator({
        _id: user._id,
        email: user.email,
      });

      //saving refresh token in DB
      await this.refreshTokenDAL.createRefreshToken({
        refreshToken: refreshToken,
        userId: user._id,
      });

      let responseUser = {
        ...user.toObject(),
      };

      //deleting unwanted fields from response
      delete responseUser.password;
      delete responseUser.isDeleted;
      delete responseUser.__v;

      return { user: responseUser, accessToken, refreshToken };
    } catch (err) {
      throw new Error(err);
    }
  }

  async login(data) {
    try {
      let { email, password } = data;

      //checking if user exists
      let user = await this.userDAL.findUserByEmail(email.toLowerCase());
      if (!user) {
        throw new NotFound("User not found!");
      }

      //checking if password is correct
      let isPasswordCorrect = await auth.verifyPassword(
        password,
        user.password
      );
      if (!isPasswordCorrect) {
        throw new ValidationError("Email or Password is incorrect!");
      }

      //generating access token and refresh token
      let accessToken = auth.accessTokenGenerator({
        _id: user._id,
        email: user.email,
      });
      let refreshToken = auth.refreshTokenGenerator({
        _id: user._id,
        email: user.email,
      });

      //checking if refresh token already present in DB
      let refreshTokenDoc =
        await this.refreshTokenDAL.findRefreshTokenByTokenByUserId(user._id);
      if (refreshTokenDoc) {
        await this.refreshTokenDAL.deleteRefreshTokenByUserId(user._id);

        await this.refreshTokenDAL.createRefreshToken({
          userId: user._id,
          refreshToken: refreshToken,
        });
      }

      //deleting unwanted fields from response
      let responseUser = {
        ...user.toObject(),
      };
      delete responseUser.password;
      delete responseUser.isDeleted;
      delete responseUser.__v;

      return { user: responseUser, accessToken, refreshToken };
    } catch (err) {
      throw new Error(err);
    }
  }

  async logout(refreshToken, userId) {
    try {
      //verifying refresh token
      let decodedRefreshToken = await auth.verifyRefreshToken(refreshToken);
      if (!decodedRefreshToken) {
        throw new BadRequest("Invalid Request!");
      }

      //deleting refresh token from DB
      await this.refreshTokenDAL.deleteRefreshTokenByUserId(
        decodedRefreshToken._id
      );

      return "Logged out successfully!";
    } catch (err) {
      throw new Error(err);
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      //verifying refresh token
      let decodedRefreshToken = await auth.verifyRefreshToken(refreshToken);
      if (!decodedRefreshToken) {
        throw new ValidationError("Invalid refresh token!");
      }

      //checking if refresh token is present in DB
      let refreshTokenFromDB = await this.refreshTokenDAL.findByToken(
        refreshToken
      );
      if (!refreshTokenFromDB) {
        throw new ValidationError("Invalid refresh token!");
      }

      //generating new access token and refresh token
      let accessToken = auth.accessTokenGenerator({
        _id: decodedRefreshToken._id,
        email: decodedRefreshToken.email,
      });
      let refreshToken = auth.refreshTokenGenerator({
        _id: decodedRefreshToken._id,
        email: decodedRefreshToken.email,
      });

      //updating refresh token in db so that only one refresh token is present in db for a user
      //this will logout all other devices
      await this.refreshTokenDAL.deleteRefreshTokenByUserId(
        decodedRefreshToken._id
      );
      await this.refreshTokenDAL.createRefreshToken({
        userId: decodedRefreshToken._id,
        refreshToken: refreshToken,
      });

      return { accessToken, refreshToken };
    } catch (err) {
      throw new Error(err);
    }
  }
}

export default new AuthService();
