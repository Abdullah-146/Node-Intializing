import BadRequest from "../errors/badRequest.js";

export const pagination = ({ limit = null, cursor = null }) => {
  const paginationFilter = {
    limit: 10,
    cursor: {},
  };
  if (parseInt(limit, 10) >= 0) {
    paginationFilter.limit = parseInt(limit, 10);
    //* Added 1 to the limit to check if there are more records to fetch for cursor based pagination
    //* also not adding 1 to the limit if the limit is 0
    //* because 0 means no limit to data and adding 1 will make it 1
    if (limit > 0) {
      paginationFilter.limit = parseInt(limit, 10) + 1;
    }
  }
  if (cursor) {
    paginationFilter.cursor = {
      _id: { $lt: cursor },
    };
  }

  console.log("paginationFilter", paginationFilter);

  return paginationFilter;
};

export const checkAffectedToReturnData = (response, data, errMsg) => {
  if (response[0].affectedRows === 1) {
    return data;
  } else {
    throw new BadRequest(
      errMsg || "Could not perform this operation successfully."
    );
  }
};
