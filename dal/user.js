import User from "../models/user.js";

class UserDAL {
  commonUnSelect = "-password -__v -isDeleted";

  async createUser(data) {
    try {
      let user = new User(data);
      return await user.save({ validateBeforeSave: true });
    } catch (err) {
      throw err;
    }
  }

  async getAllUsers(filter, limit = 0) {
    try {
      return await User.find({ ...filter })
        .select(this.commonUnSelect)
        .limit(limit)
        .lean();
    } catch (err) {
      throw err;
    }
  }

  async findUserByEmail(email) {
    try {
      let user = await User.findOne({ email: email }).select("-__v -isDeleted");
      return user;
    } catch (err) {
      throw err;
    }
  }

  async updateUserById(_id, data) {
    try {
      let userDoc = await User.findByIdAndUpdate(_id, data, {
        new: true,
        runValidators: true,
      })
        .select(this.commonUnSelect)
        .lean();
      return userDoc;
    } catch (err) {
      throw err;
    }
  }

  async findUserById(_id, select = this.commonUnSelect) {
    return await User.findById(_id).select(select).lean();
  }
}

export default new UserDAL();
