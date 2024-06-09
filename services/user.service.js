import UserDAL from "../dal/user.js";
import { pagination } from "../utils/reusable.js";

class UserService {
  constructor() {
    this.userDAL = UserDAL;
  }

  async getUserProfile(userId) {
    let response = await this.userDAL.findUserById(userId);
    delete response.pin;
    return response;
  }

  async getAllUsers(query, userId) {
    let paginationFilter = pagination({ ...query });
    let filter = {
      ...query,
      _id: { $ne: userId },
      ...paginationFilter.cursor,
    };
    let response = await this.userDAL.getAllUsers(
      filter,
      paginationFilter.limit
    );

    let hasNextPage = false;
    if (query?.limit > 0) {
      if (response.length > query?.limit) {
        hasNextPage = true;
        response.pop();
      }
    }
    return { users: response, hasNextPage };
  }
}

export default new UserService();
